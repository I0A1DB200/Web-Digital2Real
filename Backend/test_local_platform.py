from dataclasses import replace
from pathlib import Path
import json
from time import time
from tempfile import TemporaryDirectory
from unittest import TestCase

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient

from Backend.local_backup import snapshot
from Backend.local_identity import AccessTokenVerifier
from Backend.local_platform import Principal, create_app, resolve_principal
from Backend.local_store import LocalStore, SubscriptionSnapshot


class LocalPlatformTest(TestCase):
    def setUp(self):
        temp = self.enterContext(TemporaryDirectory())
        self.store = LocalStore(Path(temp) / "test.sqlite")
        self.now = 100
        self.app = create_app(self.store, clock=lambda: self.now)
        self.client = self.enterContext(TestClient(self.app))
        with self.store.transaction(write=True) as db:
            db.executemany("INSERT INTO users(subject) VALUES (?)", [("alice",), ("bob",)])
            db.executemany("INSERT INTO resources VALUES (?,?,?,?,?)", [
                ("anonymous", "Demo", "public data", "public", None),
                ("member", "Member", "registered data", "registered", None),
                ("paid", "Paid", "synthetic private data", "premium", "lab"),
                ("ops", "Operations", "admin data", "admin", None),
                ("internal", "Internal", "internal data", "internal", None),
            ])
            db.executemany("INSERT INTO legal_versions VALUES (?,?,?,?,?)", [
                ("terms", "v1", 50, "Texto sintético", "Synthetic terms"),
                ("terms", "v2", 200, "Segundo texto", "Second text"),
            ])

    def login(self, subject, admin=False):
        self.app.dependency_overrides[resolve_principal] = lambda: Principal(subject, admin)

    def snapshot(self):
        return SubscriptionSnapshot("fixture", "one", "sub", "alice", "lab", 1, 80, 180, True)

    def test_default_runtime_has_health_and_only_public_content(self):
        self.assertEqual(self.client.get("/health/live").status_code, 200)
        self.assertEqual(self.client.get("/health/ready").status_code, 200)
        response = self.client.get("/api/v1/catalog", headers={"Authorization": "Bearer ignored"})
        self.assertEqual(response.json(), [{"id": "anonymous", "title": "Demo", "access": "public"}])
        self.assertEqual(response.headers["cache-control"], "private, no-store")
        for resource in ("paid", "ops", "internal", "missing"):
            self.assertEqual(self.client.get(f"/api/v1/resources/{resource}").status_code, 404)
        self.assertEqual(self.client.get("/api/v1/me/export").status_code, 401)
        self.assertIn("/api/v1/catalog", self.client.get("/openapi.json").json()["paths"])

    def test_entitlements_use_server_identity_expiration_and_scope(self):
        event = self.snapshot()
        self.assertTrue(self.store.apply_subscription(event))
        self.login("alice")
        response = self.client.get("/api/v1/resources/paid")
        self.assertEqual(response.json()["payload"], "synthetic private data")
        self.assertEqual(response.headers["cache-control"], "private, no-store")
        self.now = event.ends_at
        self.assertEqual(self.client.get("/api/v1/resources/paid").status_code, 404)
        self.now = 100
        self.login("bob", admin=True)
        self.assertEqual(self.client.get("/api/v1/resources/paid").status_code, 404)
        self.assertEqual(self.client.get("/api/v1/resources/ops").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/resources/internal").status_code, 404)
        self.login("unknown", admin=True)
        self.assertEqual(self.client.get("/api/v1/resources/ops").status_code, 404)

    def test_billing_retries_and_out_of_order_updates_cannot_restore_access(self):
        event = self.snapshot()
        self.assertTrue(self.store.apply_subscription(event))
        revoked = replace(event, event_id="two", revision=3, active=False)
        self.assertTrue(self.store.apply_subscription(revoked))
        self.assertFalse(self.store.apply_subscription(revoked))
        self.assertFalse(self.store.apply_subscription(replace(event, event_id="late", revision=2)))
        with self.assertRaises(ValueError):
            self.store.apply_subscription(replace(event, event_id="conflict", revision=4, subject="bob"))
        # Failed ownership changes roll back the receipt too.
        self.assertTrue(self.store.apply_subscription(replace(event, event_id="conflict", revision=4)))
        self.assertTrue(self.store.apply_subscription(replace(revoked, event_id="final", revision=5)))
        self.login("alice")
        self.assertEqual(self.client.get("/api/v1/resources/paid").status_code, 404)

    def test_bookmarks_and_exports_are_isolated_and_validation_redacts_input(self):
        self.login("alice")
        path = "/api/v1/me/practice/EE-0033"
        self.assertEqual(self.client.put(path, json={"stage": "S1", "score": 100}).json(),
                         {"code": "invalid_request"})
        self.assertEqual(self.client.put(path, json={"stage": "S1"}).status_code, 204)
        self.assertEqual(self.client.put(path, json={"stage": "S2"}).status_code, 204)
        self.assertEqual(self.client.get("/api/v1/me/export").json()["practice_bookmarks"],
                         [{"experience": "EE-0033", "stage": "S2"}])
        self.login("bob")
        self.assertEqual(self.client.get("/api/v1/me/export").json()["practice_bookmarks"], [])

    def test_legal_version_is_bilingual_effective_and_idempotent(self):
        self.login("alice")
        document = self.client.get("/api/v1/legal/terms?locale=en").json()
        self.assertEqual(document["text"], "Synthetic terms")
        self.assertEqual(document["version"], "v1")
        path = "/api/v1/me/legal/terms"
        self.assertEqual(self.client.put(path, json={"version": "v2"}).status_code, 409)
        for _ in range(2):
            self.assertEqual(self.client.put(path, json={"version": "v1"}).status_code, 204)
        self.assertEqual(len(self.client.get("/api/v1/me/export").json()["legal_acceptances"]), 1)
        self.now = 200
        self.assertEqual(self.client.put(path, json={"version": "v1"}).status_code, 409)
        self.assertEqual(self.client.put(path, json={"version": "v2"}).status_code, 204)

    def test_signed_access_token_and_local_closure(self):
        issuer = "https://issuer.invalid"
        audience = "local-api"
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        jwk = jwt.algorithms.RSAAlgorithm.to_jwk(private_key.public_key(), as_dict=True)
        jwk["kid"] = "fixture"
        jwks = self.store.path.with_name("public-jwks.json")
        jwks.write_text(json.dumps({"keys": [jwk]}), encoding="utf-8")
        self.app.state.token_verifier = AccessTokenVerifier(issuer, audience, jwks)
        now = int(time())
        claims = {"iss": issuer, "aud": audience, "sub": "alice", "iat": now, "exp": now + 60,
                  "jti": "fixture", "client_id": "local-client", "admin": True}

        def headers(payload, typ="at+jwt"):
            token = jwt.encode(payload, private_key, algorithm="RS256", headers={"kid": "fixture", "typ": typ})
            return {"Authorization": "Bearer " + token}

        self.assertEqual(self.client.get("/api/v1/me/export", headers=headers(claims)).status_code, 200)
        self.assertEqual(self.client.get("/api/v1/resources/ops", headers=headers(claims)).status_code, 404)
        for invalid in (headers(claims, "JWT"), headers(dict(claims, aud="other")),
                        headers(dict(claims, iss="https://other.invalid")),
                        headers(dict(claims, exp=now - 1))):
            self.assertEqual(self.client.get("/api/v1/me/export", headers=invalid).status_code, 401)
        self.store.save_bookmark("alice", "EE-0033", "S1")
        self.assertEqual(self.client.post("/api/v1/me/closure", headers=headers(claims)).status_code, 204)
        self.assertEqual(self.client.get("/api/v1/me/export", headers=headers(claims)).status_code, 401)
        self.assertEqual(self.store.export("alice")["practice_bookmarks"], [])
        self.assertFalse(self.store.save_bookmark("alice", "EE-0033", "S3"))
        self.assertFalse(self.store.accept("alice", "terms", "v1", self.now))

    def test_snapshot_can_be_restored_without_overwriting_existing_data(self):
        target = self.store.path.with_name("restored.sqlite")
        self.store.save_bookmark("alice", "EE-0033", "S1")
        snapshot(self.store.path, target)
        self.store.save_bookmark("alice", "EE-0033", "S2")
        restored = LocalStore(target)
        restored.migrate()
        self.assertEqual(restored.export("alice")["practice_bookmarks"][0]["stage"], "S1")
        with self.assertRaises(FileExistsError):
            snapshot(self.store.path, target)
        self.assertEqual(restored.export("alice")["practice_bookmarks"][0]["stage"], "S1")

    def test_migration_preserves_rows_and_rejects_a_future_schema(self):
        self.store.migrate()
        self.assertTrue(self.store.user_exists("alice"))
        with self.store.transaction(write=True) as db:
            db.execute("PRAGMA user_version = 999")
        with self.assertRaisesRegex(ValueError, "Unsupported"):
            self.store.migrate()
