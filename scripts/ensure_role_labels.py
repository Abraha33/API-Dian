#!/usr/bin/env python3
"""Create role-* and type-* labels using GitHub CLI (`gh`). Run from repo root."""

from __future__ import annotations

import subprocess
import sys

LABELS: list[tuple[str, str, str]] = [
    ("role-backend", "0052CC", "Backend board"),
    ("role-frontend", "1D76DB", "Frontend board"),
    ("role-database", "5319E7", "Database board"),
    ("role-qa", "0E8A16", "QA board"),
    ("role-design", "B60205", "Design board"),
    ("role-devops", "FBCA04", "DevOps board"),
    ("role-product", "C2E0C6", "Product board"),
    ("role-platform", "D4C5F9", "Platform / full-stack board"),
    ("type-bug", "D73A4A", "Defect"),
    ("type-feature", "A2EEEF", "New capability"),
    ("type-spike", "FEF2C0", "Research / spike"),
    ("type-tech-debt", "EDEDED", "Technical debt"),
    ("type-chore", "F9D0C4", "Chore / maintenance"),
]


def main() -> int:
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Install and login: https://cli.github.com/  (`gh auth login`)", file=sys.stderr)
        return 1

    for name, color, desc in LABELS:
        r = subprocess.run(
            ["gh", "label", "create", name, "--color", color, "--description", desc],
            capture_output=True,
            text=True,
        )
        if r.returncode != 0:
            print(f"skip (exists or error): {name}", file=sys.stderr)
    print("Done. Check Repo Settings → Labels.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
