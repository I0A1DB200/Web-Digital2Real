"""Verify a locally configured issuer's RFC 9068 access tokens using PyJWT."""

import json
from pathlib import Path

import jwt


class AccessTokenVerifier:
    def __init__(self, issuer: str, audience: str, jwks_file: Path):
        if not issuer or not audience:
            raise ValueError("The issuer and audience are required")
        jwks = json.loads(jwks_file.read_text(encoding="utf-8"))
        self.issuer = issuer
        self.audience = audience
        self.keys = {}
        for jwk in jwks["keys"]:
            if (jwk.get("kty") != "RSA" or jwk.get("alg") not in (None, "RS256")
                    or jwk.get("use") not in (None, "sig")):
                continue
            if "d" in jwk:
                raise ValueError("The JWKS must contain public keys only")
            key_id = jwk.get("kid")
            if not isinstance(key_id, str) or not key_id or key_id in self.keys:
                raise ValueError("JWT verification requires unique signing key IDs")
            key = jwt.PyJWK.from_dict(jwk, algorithm="RS256").key
            if key.key_size < 2048:
                raise ValueError("JWT verification requires RSA keys of at least 2048 bits")
            self.keys[key_id] = key
        if not self.keys:
            raise ValueError("No supported access-token signing keys")

    def subject(self, token: str) -> str | None:
        if not token or len(token) > 8192:
            return None
        try:
            header = jwt.get_unverified_header(token)
            key_id = header.get("kid")
            if (header.get("typ") not in ("at+jwt", "application/at+jwt")
                    or not isinstance(key_id, str) or key_id not in self.keys):
                return None
            claims = jwt.decode(
                token, self.keys[key_id], algorithms=["RS256"],
                issuer=self.issuer, audience=self.audience,
                options={"require": ["iss", "sub", "aud", "exp", "iat", "jti", "client_id"]},
            )
        except jwt.InvalidTokenError:
            return None
        subject = claims["sub"]
        return subject if isinstance(subject, str) and 0 < len(subject) <= 255 else None
