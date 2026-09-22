#!/usr/bin/env python3
"""Firebase Auth Emulator Manager.

Provides cross-platform utilities to start, stop, and verify the Firebase Auth
Emulator.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time

EMULATOR_PORT = 9099
DEFAULT_PROJECT_ID = "gamelog-40e10"
REPO_ROOT = Path(__file__).resolve().parent.parent


def is_emulator_running(
    host: str = "127.0.0.1", port: int = EMULATOR_PORT
) -> bool:
  """Checks whether the Firebase Auth Emulator is listening on the given host and port."""
  for target_host in (host, "localhost"):
    try:
      with socket.create_connection((target_host, port), timeout=0.5):
        return True
    except OSError:
      pass
  return False


def start_emulator_bg(
    project_id: str = DEFAULT_PROJECT_ID,
    data_dir: Path | str = REPO_ROOT / "emulator-data",
    timeout: int = 35,
) -> subprocess.Popen | None:
  """Starts the Firebase Auth Emulator in the background if not already running."""
  if is_emulator_running():
    print(f"🔥 Firebase Auth Emulator is already running on port {EMULATOR_PORT}")
    return None

  npx_path = shutil.which("npx")
  if not npx_path:
    print("❌ Error: 'npx' not found in PATH. Please install Node.js.")
    sys.exit(1)

  data_path = Path(data_dir).resolve()
  data_path.mkdir(parents=True, exist_ok=True)

  log_file_path = REPO_ROOT / "firebase-emulator.log"
  log_file = open(log_file_path, "a", encoding="utf-8")

  cmd = [
      npx_path,
      "-y",
      "firebase",
      "emulators:start",
      "--only",
      "auth",
      "--project",
      project_id,
      f"--import={data_path}",
      f"--export-on-exit={data_path}",
  ]

  print(
      f"🔥 Starting Firebase Auth Emulator in background (logs:"
      f" {log_file_path.name})..."
  )
  use_shell = os.name == "nt"
  proc = subprocess.Popen(
      cmd,
      stdout=log_file,
      stderr=subprocess.STDOUT,
      cwd=str(REPO_ROOT),
      shell=use_shell,
  )

  start_time = time.time()
  while time.time() - start_time < timeout:
    if is_emulator_running():
      print("✅ Firebase Auth Emulator is ready!")
      return proc
    if proc.poll() is not None:
      print(
          f"❌ Firebase Auth Emulator exited prematurely with code"
          f" {proc.returncode}."
      )
      print(f"   Check {log_file_path.name} for error logs.")
      sys.exit(1)
    time.sleep(0.5)

  print(
      f"⚠️ Timed out waiting for Firebase Auth Emulator on port {EMULATOR_PORT}."
  )
  sys.exit(1)


def stop_emulator(proc: subprocess.Popen | None = None) -> None:
  """Stops the emulator process if running."""
  if proc is not None and proc.poll() is None:
    print("🛑 Stopping Firebase Auth Emulator...")
    try:
      proc.terminate()
      proc.wait(timeout=5)
    except Exception:
      proc.kill()
    print("✅ Emulator stopped.")
    return

  if not is_emulator_running():
    print("ℹ️  Firebase Auth Emulator is not currently running.")
    return

  print("🛑 Stopping Firebase Auth Emulator processes on port 9099...")
  if os.name == "nt":
    subprocess.run(
        'cmd /c "for /f \\"tokens=5\\" %a in (\'netstat -aon ^| findstr :9099\') do taskkill /f /pid %a"',
        shell=True,
        check=False,
    )
  else:
    # Linux / macOS: find PID listening on port 9099 and terminate
    try:
      pids = subprocess.check_output(
          ["lsof", "-t", f"-i:{EMULATOR_PORT}"], text=True
      ).split()
      for pid in pids:
        try:
          os.kill(int(pid), signal.SIGTERM)
        except OSError:
          pass
      print("✅ Emulator stopped.")
    except Exception:
      print(
          "⚠️ Could not automatically stop emulator. Please terminate the"
          " process manually."
      )


def main():
  parser = argparse.ArgumentParser(description="Manage Firebase Auth Emulator.")
  parser.add_argument(
      "action",
      choices=["start", "stop", "status"],
      nargs="?",
      default=None,
      help="Action to perform (default: start)",
  )
  parser.add_argument("--start", action="store_true", help="Start the emulator")
  parser.add_argument("--stop", action="store_true", help="Stop the emulator")
  parser.add_argument("--status", action="store_true", help="Check emulator status")
  parser.add_argument(
      "--project", default=DEFAULT_PROJECT_ID, help="Firebase project ID"
  )
  args = parser.parse_args()

  action = args.action
  if args.stop:
    action = "stop"
  elif args.status:
    action = "status"
  elif args.start:
    action = "start"
  elif not action:
    action = "start"

  if action == "status":
    running = is_emulator_running()
    print(
        f"Firebase Auth Emulator is {'RUNNING' if running else 'STOPPED'} on"
        f" port {EMULATOR_PORT}."
    )
    sys.exit(0 if running else 1)
  elif action == "stop":
    stop_emulator()
  elif action == "start":
    start_emulator_bg(project_id=args.project)


if __name__ == "__main__":
  main()
