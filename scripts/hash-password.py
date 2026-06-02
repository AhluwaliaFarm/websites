#!/usr/bin/env python3
"""Print SHA-256 hex digest for a partner login password."""
import hashlib
import sys


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/hash-password.py \"your-password\"", file=sys.stderr)
        sys.exit(1)
    digest = hashlib.sha256(sys.argv[1].encode("utf-8")).hexdigest()
    print(digest)


if __name__ == "__main__":
    main()
