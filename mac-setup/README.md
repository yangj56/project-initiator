# Mac setup

Clean Mac dev setup: **Oh My Zsh**, **nvm**, **Cursor**, **Docker Desktop**, and CLI tools. No iTerm2 — use Cursor’s terminal (or any terminal).

**What you get**

- **Homebrew zsh** (current stable; macOS `/bin/zsh` stays as the fallback) + **Oh My Zsh** `robbyrussell` theme
- Git autocomplete + autosuggestions
- **nvm** + Node 24
- **Cursor** (main IDE + terminal)
- **Docker Desktop**
- Flycut, autojump, fzf, bat, eza, ripgrep
- This **setup** directory as the single source of truth
- A **`doctor`** command to verify everything

---

## 0. One-time macOS prerequisite

```bash
xcode-select --install
```

---

## 1. Get the setup

`mac-setup` lives in the [project-initiator](https://github.com/yangj56/project-initiator) repo. Clone it if you do not already have it:

```bash
git clone https://github.com/yangj56/project-initiator.git
cd project-initiator/mac-setup
```

---

## 2. Layout

```
mac-setup/
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

From `mac-setup`:

```bash
chmod +x bootstrap.sh install.sh
./bootstrap.sh
./install.sh
exec zsh
doctor
```

- **`bootstrap.sh`** — Installs Homebrew (if needed), sets up PATH, and generates `config/git/gitconfig` from the template if it doesn’t exist.
- **`install.sh`** — Updates Homebrew, runs `brew bundle`, upgrades zsh, installs Oh My Zsh, symlinks `.zshrc`, `.gitconfig`, `.gitignore_global`, registers Homebrew zsh as the login shell, and installs Node 24 via nvm.
- **`exec zsh`** — Reloads your shell so the new config is active.
- **`doctor`** — Checks that brew, zsh, git, node, nvm, docker, fzf, autojump, Oh My Zsh, and symlinks are present.

---

## 4. Git config (your identity)

`config/git/gitconfig` is **not** tracked. It is created from `config/git/gitconfig.template` the first time you run `bootstrap.sh`.

Edit it and set your name and email:

```bash
cursor config/git/gitconfig
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
git clone https://github.com/yangj56/project-initiator.git
cd project-initiator/mac-setup
./bootstrap.sh
./install.sh
exec zsh
doctor
```

Then edit `config/git/gitconfig` with your name and email.
