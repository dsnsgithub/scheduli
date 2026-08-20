#!/bin/sh

set -u

# Function to simulate 'timeout' on macOS
# Usage: run_with_timeout <seconds> <command>
run_with_timeout() {
  local sec=$1
  shift
  "$@" &
  local pid=$!
  (sleep "$sec"; kill "$pid" 2>/dev/null) &
  local watcher=$!
  wait "$pid" 2>/dev/null
  local res=$?
  kill "$watcher" 2>/dev/null
  return $res
}

mkdir -p .maestro/recordings || exit 1

find .maestro -name '*.yaml' | while IFS= read -r file; do
  echo "Running tests for $file"

  attempt=1
  while [ "$attempt" -le 3 ]; do
    if run_with_timeout 300 maestro test "$file"; then
      break
    fi

    echo "Attempt $attempt failed (or timed out) for $file"

    if [ "$attempt" -eq 3 ]; then
      echo "Test failed after 3 attempts: $file"
      exit 1
    fi

    echo "Sleeping 10 seconds before retry..."
    sleep 10

    attempt=$((attempt + 1))
  done
done
