#!/usr/bin/env python3
import socket
import subprocess
import time
import sys
import atexit
import signal
import shutil

emulator_proc = None

def is_emulator_running():
    try:
        with socket.create_connection(('127.0.0.1', 9099), timeout=1):
            return True
    except OSError:
        return False

def cleanup():
    global emulator_proc
    if emulator_proc is not None:
        print("🛑 Stopping Firebase Auth Emulator...")
        try:
            emulator_proc.terminate()
            emulator_proc.wait(timeout=5)
        except Exception:
            emulator_proc.kill()
        emulator_proc = None

def signal_handler(sig, frame):
    sys.exit(1)

# Register cleanup for normal exit and signals
atexit.register(cleanup)
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def main():
    global emulator_proc
    
    if is_emulator_running():
        print("🔥 Firebase Auth Emulator is already running on port 9099")
    else:
        print("🔥 Starting Firebase Auth Emulator in background...")
        log_file = open("firebase-emulator.log", "a")
        
        npx_path = shutil.which("npx")
        if not npx_path:
            print("❌ npx not found in PATH. Please install Node.js.")
            sys.exit(1)
            
        cmd = [
            npx_path, "firebase", "emulators:start", 
            "--only", "auth", 
            "--project", "gamelog-40e10", 
            "--import=./emulator-data", 
            "--export-on-exit=./emulator-data"
        ]
        
        emulator_proc = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
        
        attempts = 0
        while not is_emulator_running():
            if emulator_proc.poll() is not None:
                print("❌ Firebase Auth Emulator exited before becoming ready. See firebase-emulator.log for details.")
                sys.exit(1)
            
            attempts += 1
            if attempts >= 30:
                print("❌ Firebase Auth Emulator did not become ready within 30 seconds. See firebase-emulator.log for details.")
                sys.exit(1)
            
            time.sleep(1)

    print("✅ Emulator is ready. Starting processes...")
    try:
        make_cmd = ["make", "dev-init-internal", "EMULATOR=true", "START_EMULATOR=false"]
        result = subprocess.run(make_cmd)
        sys.exit(result.returncode)
    except Exception as e:
        print(f"❌ Failed to run make: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
