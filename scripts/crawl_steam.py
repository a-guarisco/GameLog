#!/usr/bin/env python3
"""
Crawler utility to populate seed_data_users.json from Steam Web API.

Requires a valid Steam API key.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import time
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend" / "gamelog"
DEFAULT_OUTPUT_FILE = BACKEND_DIR / "src" / "core" / "seed_data_users.json"


def main():
    parser = argparse.ArgumentParser(
        description="Crawl Steam users for mock seed data."
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Steam Web API Key (or use STEAM_API_KEY env var)",
    )
    parser.add_argument(
        "--mock-users",
        type=int,
        default=50,
        help="Number of users to crawl (default: 50)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=str(DEFAULT_OUTPUT_FILE),
        help="Target output path for JSON file (default: backend/gamelog/src/core/seed_data_users.json)",
    )
    parser.add_argument(
        "--override",
        "--force",
        "-f",
        action="store_true",
        help="Force re-crawling Steam data even if output JSON already exists",
    )
    args = parser.parse_args()

    output_file = Path(args.output)
    if output_file.is_file() and not args.override:
        print(f"✨ '{output_file.name}' already exists. Skipping Steam crawl (use --override to re-crawl).")
        return

    # Ensure backend/gamelog is on sys.path
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))

    try:
        from src.core.steam_crawler import crawl_steam_users
    except ImportError:
        import shutil
        import subprocess

        uv_path = shutil.which("uv")
        if uv_path:
            cmd = [
                uv_path,
                "run",
                "--project",
                str(BACKEND_DIR),
                "python",
                __file__,
            ] + sys.argv[1:]
            result = subprocess.run(cmd)
            sys.exit(result.returncode)
        else:
            print("❌ Error: backend dependencies ('requests', 'rich', etc.) are required.")
            sys.exit(1)

    # Auto-load backend/.env if present
    env_file = BACKEND_DIR.parent / ".env"
    if not env_file.exists():
        env_file = BACKEND_DIR / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

    key = (
        args.api_key
        or os.environ.get("STEAM_API_KEY")
        or os.environ.get("DEFAULT_STEAM_API_KEY")
        or os.environ.get("SLAITROC_STEAM_API_KEY")
    )
    if not key:
        print(
            "❌ Error: A valid Steam Web API Key is required to crawl data from"
            " Steam."
        )
        print(
            "💡 Pass it via --api-key <KEY> or set the STEAM_API_KEY"
            " environment variable."
        )
        sys.exit(1)

    crawl_steam_users(
        api_key=key, target_count=args.mock_users, output_path=output_file
    )


if __name__ == "__main__":
    main()

