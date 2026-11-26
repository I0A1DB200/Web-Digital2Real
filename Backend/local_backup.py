"""Create a verified, non-overwriting SQLite snapshot for local recovery drills."""

import argparse
import os
import sqlite3
from contextlib import closing
from pathlib import Path


def snapshot(source: Path, destination: Path):
    source_uri = source.resolve().as_uri() + "?mode=ro"
    with closing(sqlite3.connect(source_uri, uri=True, timeout=5)) as original:
        descriptor = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        os.close(descriptor)
        try:
            with closing(sqlite3.connect(destination)) as copy:
                original.backup(copy)
                if copy.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
                    raise ValueError("Snapshot integrity check failed")
                if copy.execute("PRAGMA user_version").fetchone()[0] != 1:
                    raise ValueError("Snapshot has an unsupported schema")
        except Exception:
            destination.unlink()
            raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    snapshot(args.source, args.destination)


if __name__ == "__main__":
    main()
