"""Local persistence for exercising production contracts with synthetic data."""

import sqlite3
from contextlib import closing, contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass(frozen=True)
class SubscriptionSnapshot:
    """State already authenticated and reconciled by a trusted billing adapter."""

    provider: str
    event_id: str
    subscription_id: str
    subject: str
    product: str
    revision: int
    starts_at: int
    ends_at: int
    active: bool


class LocalStore:
    def __init__(self, path: Path):
        self.path = path

    @contextmanager
    def transaction(self, *, write=False):
        with closing(sqlite3.connect(self.path, timeout=5)) as db, db:
            db.row_factory = sqlite3.Row
            db.execute("PRAGMA foreign_keys = ON")
            db.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            yield db

    def migrate(self):
        with self.transaction(write=True) as db:
            version = db.execute("PRAGMA user_version").fetchone()[0]
            if version == 1:
                return
            if version != 0:
                raise ValueError("Unsupported local database version")
            for definition in (
                "users (subject TEXT PRIMARY KEY, closed_at INTEGER)",
                """resources (
                    id TEXT PRIMARY KEY, title TEXT NOT NULL, payload TEXT NOT NULL,
                    access TEXT NOT NULL CHECK(access IN ('public','registered','premium','internal','admin')),
                    product TEXT, CHECK(access != 'premium' OR product IS NOT NULL))""",
                """subscriptions (
                    provider TEXT NOT NULL, id TEXT NOT NULL, subject TEXT NOT NULL REFERENCES users,
                    product TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision >= 0),
                    starts_at INTEGER NOT NULL, ends_at INTEGER NOT NULL,
                    active INTEGER NOT NULL CHECK(active IN (0,1)),
                    CHECK(ends_at > starts_at), PRIMARY KEY(provider,id))""",
                """billing_events (
                    provider TEXT NOT NULL, id TEXT NOT NULL, PRIMARY KEY(provider,id))""",
                """bookmarks (
                    subject TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
                    experience TEXT NOT NULL, stage TEXT NOT NULL,
                    PRIMARY KEY(subject,experience))""",
                """legal_versions (
                    document TEXT NOT NULL, version TEXT NOT NULL, effective_at INTEGER NOT NULL,
                    es TEXT NOT NULL, en TEXT NOT NULL, PRIMARY KEY(document,version),
                    UNIQUE(document,effective_at))""",
                """acceptances (
                    subject TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
                    document TEXT NOT NULL, version TEXT NOT NULL, accepted_at INTEGER NOT NULL,
                    PRIMARY KEY(subject,document,version),
                    FOREIGN KEY(document,version) REFERENCES legal_versions(document,version))""",
            ):
                db.execute("CREATE TABLE " + definition)
            db.execute("CREATE INDEX subscription_access ON subscriptions(subject, product, ends_at)")
            db.execute("PRAGMA user_version = 1")

    def ready(self):
        with self.transaction() as db:
            db.execute("SELECT subject FROM users LIMIT 1").fetchall()

    def user_exists(self, subject):
        with self.transaction() as db:
            return db.execute("SELECT 1 FROM users WHERE subject = ? AND closed_at IS NULL", (subject,)).fetchone() is not None

    def resources(self, subject, staff, now, resource_id=None):
        with self.transaction() as db:
            return db.execute(
                """SELECT id, title, access, CASE WHEN ? IS NOT NULL THEN payload END AS payload
                   FROM resources
                   WHERE (? IS NULL OR id = ?) AND
                     (access = 'public'
                      OR (access = 'registered' AND ? IS NOT NULL)
                      OR (access = 'admin' AND ?)
                      OR (access = 'premium' AND EXISTS (
                          SELECT 1 FROM subscriptions s
                          WHERE s.subject = ? AND s.product = resources.product
                            AND s.active = 1 AND s.starts_at <= ? AND ? < s.ends_at)))
                   ORDER BY id LIMIT 100""",
                (resource_id, resource_id, resource_id, subject, staff, subject, now, now),
            ).fetchall()

    def apply_subscription(self, event: SubscriptionSnapshot):
        with self.transaction(write=True) as db:
            receipt = db.execute(
                "INSERT INTO billing_events VALUES (?,?) ON CONFLICT DO NOTHING",
                (event.provider, event.event_id),
            )
            if receipt.rowcount == 0:
                return False
            current = db.execute(
                "SELECT subject, product FROM subscriptions WHERE provider=? AND id=?",
                (event.provider, event.subscription_id),
            ).fetchone()
            if current and (current["subject"], current["product"]) != (event.subject, event.product):
                raise ValueError("Subscription ownership and product are immutable")
            result = db.execute(
                """INSERT INTO subscriptions VALUES (?,?,?,?,?,?,?,?)
                   ON CONFLICT(provider,id) DO UPDATE SET
                     revision=excluded.revision, starts_at=excluded.starts_at,
                     ends_at=excluded.ends_at, active=excluded.active
                   WHERE excluded.revision > subscriptions.revision""",
                (event.provider, event.subscription_id, event.subject, event.product,
                 event.revision, event.starts_at, event.ends_at, event.active),
            )
            return result.rowcount == 1

    def save_bookmark(self, subject, experience, stage):
        with self.transaction(write=True) as db:
            result = db.execute(
                """INSERT INTO bookmarks
                   SELECT subject, ?, ? FROM users WHERE subject = ? AND closed_at IS NULL
                   ON CONFLICT(subject,experience) DO UPDATE SET stage=excluded.stage""",
                (experience, stage, subject),
            )
            return result.rowcount == 1

    @staticmethod
    def _current_document(db, document, now):
        return db.execute(
            """SELECT document, version, effective_at, es, en FROM legal_versions
               WHERE document=? AND effective_at<=? ORDER BY effective_at DESC LIMIT 1""",
            (document, now),
        ).fetchone()

    def document(self, document, now):
        with self.transaction() as db:
            return self._current_document(db, document, now)

    def accept(self, subject, document, version, now):
        with self.transaction(write=True) as db:
            current = self._current_document(db, document, now)
            if not current or current["version"] != version:
                return False
            db.execute(
                """INSERT INTO acceptances
                   SELECT subject, ?, ?, ? FROM users WHERE subject=? AND closed_at IS NULL
                   ON CONFLICT DO NOTHING""",
                (document, version, now, subject),
            )
            return db.execute(
                """SELECT 1 FROM users WHERE subject=? AND closed_at IS NULL""", (subject,),
            ).fetchone() is not None

    def close_account(self, subject, now):
        with self.transaction(write=True) as db:
            db.execute("UPDATE users SET closed_at = ? WHERE subject = ? AND closed_at IS NULL", (now, subject))
            db.execute("DELETE FROM bookmarks WHERE subject = ?", (subject,))

    def export(self, subject):
        with self.transaction() as db:
            return {
                "subject": subject,
                "practice_bookmarks": [dict(row) for row in db.execute(
                    "SELECT experience, stage FROM bookmarks WHERE subject=? ORDER BY experience", (subject,),
                )],
                "legal_acceptances": [dict(row) for row in db.execute(
                    """SELECT document, version, accepted_at FROM acceptances
                       WHERE subject=? ORDER BY document, version""", (subject,),
                )],
                "subscriptions": [dict(row) for row in db.execute(
                    """SELECT product, starts_at, ends_at, active FROM subscriptions
                       WHERE subject=? ORDER BY provider,id""", (subject,),
                )],
            }


def utc_timestamp():
    return int(datetime.now(timezone.utc).timestamp())
