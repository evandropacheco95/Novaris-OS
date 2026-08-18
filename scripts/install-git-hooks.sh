#!/bin/sh
# Roda 1x por clone: liga o hook de pre-commit (checagem de segredos via gitleaks).
set -e
REPO_ROOT="$(git rev-parse --show-toplevel)"
cp "$REPO_ROOT/scripts/pre-commit-secrets-check.sh" "$REPO_ROOT/.git/hooks/pre-commit"
chmod +x "$REPO_ROOT/.git/hooks/pre-commit"
echo "✓ Hook de pre-commit (gitleaks) instalado."
