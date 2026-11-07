export EDITOR="cursor --wait"
export LANG="en_US.UTF-8"

export PATH="${DOTFILES:-$HOME/dotfiles}/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
if command -v brew >/dev/null 2>&1; then
  _nvm_sh="$(brew --prefix nvm 2>/dev/null)/nvm.sh"
  [[ -s "$_nvm_sh" ]] && source "$_nvm_sh"
  unset _nvm_sh
fi
