#!/bin/sh
# Bloqueia commit se o gitleaks detectar segredo nos arquivos staged.
# Instalado como hook local via `bash scripts/install-git-hooks.sh` (roda 1x por clone,
# hooks do Git não são versionados automaticamente pelo próprio Git).

GITLEAKS_BIN="gitleaks"
if ! command -v gitleaks >/dev/null 2>&1; then
  WINGET_FALLBACK="$LOCALAPPDATA/Microsoft/WinGet/Packages/Gitleaks.Gitleaks_Microsoft.Winget.Source_8wekyb3d8bbwe/gitleaks.exe"
  if [ -x "$WINGET_FALLBACK" ]; then
    GITLEAKS_BIN="$WINGET_FALLBACK"
  else
    echo "⚠️  gitleaks não encontrado — pulei a checagem de segredos. Instale com: winget install Gitleaks.Gitleaks"
    exit 0
  fi
fi

"$GITLEAKS_BIN" protect --staged --verbose
