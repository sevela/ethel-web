#!/bin/sh
# Nainstaluje git hooky z scripts/hooks/ do .git/hooks/.
# Spust jednou po klonovani repa: sh scripts/hooks/install.sh
set -e
ROOT=$(git rev-parse --show-toplevel)
cp "$ROOT/scripts/hooks/pre-commit" "$ROOT/.git/hooks/pre-commit"
chmod +x "$ROOT/.git/hooks/pre-commit"
echo "✅ pre-commit hook nainstalovan (prettier + eslint)."
