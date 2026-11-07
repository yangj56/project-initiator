autoload -Uz compinit
compinit

if command -v brew >/dev/null 2>&1; then
  _brew_prefix="$(brew --prefix)"
  [[ -f "${_brew_prefix}/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ]] &&
    source "${_brew_prefix}/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
  [[ -f "${_brew_prefix}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]] &&
    source "${_brew_prefix}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
  [[ -f "${_brew_prefix}/etc/profile.d/autojump.sh" ]] &&
    source "${_brew_prefix}/etc/profile.d/autojump.sh"
  unset _brew_prefix
fi

[[ -f "$HOME/.fzf.zsh" ]] && source "$HOME/.fzf.zsh"
