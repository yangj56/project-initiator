_brew_prefix=""
if command -v brew >/dev/null 2>&1; then
  _brew_prefix="$(brew --prefix)"
  [[ -f "${_brew_prefix}/etc/profile.d/autojump.sh" ]] &&
    source "${_brew_prefix}/etc/profile.d/autojump.sh"
  [[ -f "${_brew_prefix}/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ]] &&
    source "${_brew_prefix}/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
fi

[[ -f "$HOME/.fzf.zsh" ]] && source "$HOME/.fzf.zsh"

# zsh-syntax-highlighting has to be sourced after every other plugin.
if [[ -n $_brew_prefix && -f "${_brew_prefix}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ]]; then
  source "${_brew_prefix}/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
fi
unset _brew_prefix
