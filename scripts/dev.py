#!/usr/bin/env python3
"""
GameLog Master Development Orchestrator.

Launches and manages all services (Firebase Emulator, Backend Docker containers,
and Expo Mobile Client) with a single command.

Usage:
    python3 scripts/dev.py                  # Standard Expo Go + Local Emulator
    python3 scripts/dev.py --android        # Android Native Build + Emulator
    python3 scripts/dev.py --init           # Full DB reset + Launch
    python3 scripts/dev.py --cloud          # Run against Live Firebase Cloud
    python3 scripts/dev.py --no-mobile      # Backend & Emulator only
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
MOBILE_DIR = REPO_ROOT / "mobile-app"

# Import emulator helper from scripts directory
sys.path.insert(0, str(REPO_ROOT / "scripts"))
import emulator  # noqa: E402

emulator_proc = None


def cleanup():
    global emulator_proc
    if emulator_proc is not None:
        emulator.stop_emulator(emulator_proc)
        emulator_proc = None


def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)


def run_cmd(cmd: list[str], cwd: Path | str = REPO_ROOT, env: dict | None = None) -> int:
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    print(f"👉 Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=str(cwd), env=full_env)
    return result.returncode


def main():
    global emulator_proc

    parser = argparse.ArgumentParser(description="GameLog Unified Dev Runner")
    parser.add_argument("--android", action="store_true", help="Launch Expo Android native build instead of Expo Go")
    parser.add_argument("--init", action="store_true", help="Reset PostgreSQL database and re-seed before starting")
    parser.add_argument("--cloud", action="store_true", help="Connect to Live Firebase Cloud Console instead of local emulator")
    parser.add_argument("--no-emulator", action="store_true", help="Skip starting the local Firebase emulator")
    parser.add_argument("--no-mobile", action="store_true", help="Start only backend services (no mobile client)")
    parser.add_argument("--mock-users", type=int, default=50, help="Number of mock users for database seed (default: 50)")
    args = parser.parse_args()

    # Register signal cleanup
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    use_emulator = not args.cloud
    os.environ["USE_FIREBASE_EMULATOR"] = "true" if use_emulator else "false"
    os.environ["EXPO_PUBLIC_USE_FIREBASE_EMULATOR"] = "true" if use_emulator else "false"

    print("==================================================")
    print("🎮 Starting GameLog Development Environment")
    print(f"   Auth Mode: {'🛠️ Local Emulator' if use_emulator else '☁️ Cloud Firebase'}")
    print(f"   Client:    {'🤖 Native Android' if args.android else '📱 Expo Go' if not args.no_mobile else '🚫 Backend only'}")
    if args.init:
        print("   Database:  🔄 Reset & Seed requested")
    print("==================================================\n")

    # 1. Start Firebase Auth Emulator (if applicable)
    if use_emulator and not args.no_emulator:
        emulator_proc = emulator.start_emulator_bg()

    # 2. Database Reset or Service Startup
    compose_cmd = ["docker", "compose", "-f", "compose.yml"]
    if args.init:
        print("\n🔄 Resetting database volumes and applying fresh migrations...")
        run_cmd(compose_cmd + ["down", "-v"], cwd=BACKEND_DIR)
        run_cmd(compose_cmd + ["up", "-d", "db"], cwd=BACKEND_DIR)
        print("⏳ Waiting for database to become healthy...")
        time.sleep(4)
        run_cmd(compose_cmd + ["up", "-d"], cwd=BACKEND_DIR)
        print("📦 Running Alembic migrations...")
        run_cmd([sys.executable, str(REPO_ROOT / "scripts" / "crawl_steam.py"), "--mock-users", str(args.mock_users)])
        print(f"🌱 Seeding database with {args.mock_users} users...")
        run_cmd(compose_cmd + ["exec", "gamelog", "uv", "run", "python", "-m", "src.core.seed", "--mock-users", str(args.mock_users)], cwd=BACKEND_DIR)
    else:
        print("\n🚀 Starting backend Docker services...")
        run_cmd(compose_cmd + ["up", "-d"], cwd=BACKEND_DIR)

    # 3. Seed Firebase test accounts
    print("\n🔑 Seeding Firebase test accounts...")
    seed_args = [sys.executable, str(REPO_ROOT / "scripts" / "seed_firebase.py")]
    if args.cloud:
        seed_args.append("--cloud")
    elif use_emulator:
        seed_args.append("--emulator")
    run_cmd(seed_args)

    # 4. Mobile App Launch
    if args.no_mobile:
        print("\n✅ Backend services and Emulator are running.")
        print("Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            cleanup()
        return

    print("\n📱 Launching Mobile App...")
    if args.android:
        # Sync google-services.json to android/app if android folder exists
        android_app_dir = MOBILE_DIR / "android" / "app"
        src_google_services = MOBILE_DIR / "google-services.json"
        if android_app_dir.is_dir() and src_google_services.is_file():
            shutil.copyfile(src_google_services, android_app_dir / "google-services.json")
            print("📂 Synced google-services.json to android/app/")
        run_cmd(["npm", "run", "android"], cwd=MOBILE_DIR)
    else:
        run_cmd(["npm", "run", "start:fresh"], cwd=MOBILE_DIR)

    cleanup()


if __name__ == "__main__":
    main()
