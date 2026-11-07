# Dotfiles

Clean Mac dev setup: **Oh My Zsh**, **nvm**, **Cursor**, **Docker Desktop**, and CLI tools. No iTerm2 — use Cursor’s terminal (or any terminal).

**What you get**

- **Oh My Zsh** + `robbyrussell` theme
- Git autocomplete + autosuggestions
- **nvm** + Node 24
- **Cursor** (main IDE + terminal)
- **Docker Desktop**
- Flycut, autojump, fzf, bat, eza, ripgrep
- One **dotfiles repo** as the single source of truth
- A **`doctor`** command to verify everything

---

## 0. One-time macOS prerequisite

```bash
xcode-select --install
```

---

## 1. Clone this repo

Clone to any directory (e.g. `~/dotfiles` or `~/Documents/developer/dotfiles`):

```bash
git clone https://github.com/YOUR_USERNAME/dotfiles.git ~/dotfiles
cd ~/dotfiles
```

---

## 2. Repo structure

```
dotfiles/
├── Brewfile
├── bootstrap.sh
├── install.sh
├── bin/
│   ├── link
│   └── doctor
└── config/
    ├── zsh/
    │   ├── zshrc
    │   ├── exports.zsh
    │   ├── aliases.zsh
    │   └── plugins.zsh
    └── git/
        ├── gitconfig.template   # tracked
        ├── gitconfig            # generated, gitignored
        └── gitignore_global
```

---

## 3. Run setup

From the repo directory:

```bash
chmod +x bootstrap.sh install.sh
./bootstrap.sh
./install.sh
exec zsh
doctor
```

- **`bootstrap.sh`** — Installs Homebrew (if needed), sets up PATH, and generates `config/git/gitconfig` from the template if it doesn’t exist.
- **`install.sh`** — Runs `brew bundle`, installs Oh My Zsh, symlinks `.zshrc`, `.gitconfig`, `.gitignore_global`, and installs Node 24 via nvm.
- **`exec zsh`** — Reloads your shell so the new config is active.
- **`doctor`** — Checks that brew, git, node, nvm, docker, fzf, autojump, Oh My Zsh, and symlinks are present.

---

## 4. Git config (your identity)

`config/git/gitconfig` is **not** tracked. It is created from `config/git/gitconfig.template` the first time you run `bootstrap.sh`.

Edit it and set your name and email:

```bash
# Open the file (path depends on where you cloned the repo)
cursor ~/dotfiles/config/git/gitconfig
```

Uncomment and set:

```ini
[user]
	name = Your Name
	email = your@email.com
```

---

## 5. Optional: after install

- **Docker Desktop** — open the app once so the `docker` CLI works (`doctor` checks this).
- **Flycut** — **System Settings → Login Items** → enable so the clipboard manager starts on login.

---

## 6. Verify setup

```bash
brew --version
git --version
node -v
nvm --version
git ch<TAB>   # tab completion
doctor
```

You should see the **robbyrussell** prompt, e.g.:

```
➜  ~ git:(main)
```

---

## Mental model

| Step           | Purpose              |
|----------------|----------------------|
| `bootstrap.sh` | Prepare the machine  |
| `install.sh`   | Apply your identity  |
| `exec zsh`     | Activate config      |
| `doctor`       | Verify health        |

---

## New Mac

On a fresh MacBook:

```bash
xcode-select --install
git clone https://github.com/YOUR_USERNAME/dotfiles.git ~/dotfiles
cd ~/dotfiles
./bootstrap.sh
./install.sh
exec zsh
doctor
```

Then edit `config/git/gitconfig` with your name and email.
