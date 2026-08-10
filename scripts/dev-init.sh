#!/bin/sh
set -e

PYTHON_BIN="${PYTHON:-python3}"
EMULATOR_PID=""

is_emulator_running() {
	"$PYTHON_BIN" -c "import socket, sys; s = socket.socket(); running = (s.connect_ex(('127.0.0.1', 9099)) == 0); s.close(); sys.exit(0 if running else 1)"
}

cleanup() {
	status=$?

	if [ -n "$EMULATOR_PID" ]; then
		echo "🛑 Stopping Firebase Auth Emulator..."
		kill "$EMULATOR_PID" 2>/dev/null || true
		wait "$EMULATOR_PID" 2>/dev/null || true
	fi

	exit "$status"
}

trap cleanup INT TERM EXIT

if is_emulator_running; then
	echo "🔥 Firebase Auth Emulator is already running on port 9099"
else
	echo "🔥 Starting Firebase Auth Emulator in background..."
	npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit=./emulator-data >> firebase-emulator.log 2>&1 &
	EMULATOR_PID=$!

	attempts=0
	while ! is_emulator_running; do
		if ! kill -0 "$EMULATOR_PID" 2>/dev/null; then
			echo "❌ Firebase Auth Emulator exited before becoming ready. See firebase-emulator.log for details."
			exit 1
		fi

		attempts=$((attempts + 1))
		if [ "$attempts" -ge 30 ]; then
			echo "❌ Firebase Auth Emulator did not become ready within 30 seconds. See firebase-emulator.log for details."
			exit 1
		fi

		sleep 1
	done
fi

make dev-init-internal EMULATOR=true START_EMULATOR=false
