#!/usr/bin/env bash
set -euo pipefail

# Always run with bash (sourcing from zsh breaks `if ! command` via history expansion)
if [[ -z "${BASH_VERSION:-}" ]]; then
  exec /usr/bin/env bash "$0" "$@"
fi

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v brew >/dev/null 2>&1; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

# Git config (local file is gitignored; create from template on first install)
GITCONFIG="$DOTFILES/config/git/gitconfig"
GITCONFIG_TEMPLATE="$DOTFILES/config/git/gitconfig.template"
if [[ ! -f "$GITCONFIG" ]] && [[ -f "$GITCONFIG_TEMPLATE" ]]; then
  cp "$GITCONFIG_TEMPLATE" "$GITCONFIG"
  echo "Generated config/git/gitconfig from template — set your name and email"
fi

brew bundle --file "$DOTFILES/Brewfile"

# fzf shell integration (~/.fzf.zsh)
if [[ -x "$(brew --prefix)/opt/fzf/install" ]]; then
  "$(brew --prefix)/opt/fzf/install" --all --no-update-rc
fi

chmod +x "$DOTFILES/bin/link" "$DOTFILES/bin/doctor"

"$DOTFILES/bin/link" "$DOTFILES/config/zsh/zshrc" "$HOME/.zshrc"
"$DOTFILES/bin/link" "$DOTFILES/config/git/gitconfig" "$HOME/.gitconfig"
"$DOTFILES/bin/link" "$DOTFILES/config/git/gitignore_global" "$HOME/.gitignore_global"

# Oh My Zsh (safe install; KEEP_ZSHRC preserves our symlinked .zshrc)
if [[ ! -d "$HOME/.oh-my-zsh" ]]; then
  RUNZSH=no CHSH=no KEEP_ZSHRC=yes \
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi

# NVM + Node 24
export NVM_DIR="$HOME/.nvm"
mkdir -p "$NVM_DIR"
if [[ -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  source "$(brew --prefix nvm)/nvm.sh"
  nvm install 24
  nvm alias default 24
  nvm use default
else
  echo "Warning: nvm not found; skip Node install" >&2
fi

if ! git config --global user.name >/dev/null 2>&1 ||
   ! git config --global user.email >/dev/null 2>&1; then
  echo "Warning: set git user.name and user.email in $GITCONFIG" >&2
fi

echo "Install complete — run: exec zsh && doctor"
