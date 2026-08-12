import os
import socket
import subprocess
import time
import sys

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def main():
    if is_port_open(9099):
        print('🔥 Firebase Auth Emulator is already running on port 9099')
        sys.exit(0)

    print('🔥 Starting Firebase Auth Emulator in background...')
    
    # npx.cmd on Windows, npx on macOS/Linux
    use_shell = os.name == 'nt'
    
    cmd = [
        'npx', '-y', 'firebase', 'emulators:start', 
        '--only', 'auth', 
        '--project', 'gamelog-40e10', 
        '--import=./emulator-data', 
        '--export-on-exit=./emulator-data'
    ]
    
    # Start emulator in background, detaching I/O
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=use_shell)
    
    print('⏳ Waiting for Firebase Auth Emulator on port 9099...')
    start_time = time.time()
    ready = False
    
    while time.time() - start_time < 60:
        if is_port_open(9099):
            ready = True
            break
        time.sleep(0.5)
        
    if ready:
        print('✅ Firebase Auth Emulator is ready!')
    else:
        print('⚠️ Timed out waiting for Firebase Auth Emulator (port 9099 not listening after 20s).')
        sys.exit(1)

if __name__ == '__main__':
    main()
