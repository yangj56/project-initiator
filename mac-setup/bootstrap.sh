#!/usr/bin/env bash
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v brew >/dev/null 2>&1; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
else
  eval "$(/usr/local/bin/brew shellenv)"
fi

# Generate gitconfig from template if it doesn't exist (ignored by git)
GITCONFIG="$DOTFILES/config/git/gitconfig"
GITCONFIG_TEMPLATE="$DOTFILES/config/git/gitconfig.template"
if [[ ! -f "$GITCONFIG" ]] && [[ -f "$GITCONFIG_TEMPLATE" ]]; then
  cp "$GITCONFIG_TEMPLATE" "$GITCONFIG"
  echo "Generated config/git/gitconfig from template"
fi

echo "Bootstrap complete"
