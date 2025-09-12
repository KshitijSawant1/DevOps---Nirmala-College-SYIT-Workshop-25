# Quick Setup

```bash
# one-time (identify yourself to Git)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

# 1) Create or Clone a Repo

```bash
# OPTION A: start locally
mkdir hello-devops && cd hello-devops
git init
echo "Hello DevOps" > hello.txt

# OPTION B: clone an existing GitHub repo
git clone https://github.com/<you>/hello-devops.git
cd hello-devops
```

---

# 2) Status, Add, Commit

```bash
git status                         # see what's changed
git add hello.txt                  # stage a file
# or stage everything:
git add -A                         # (aka `git add .`)
git commit -m "feat: add hello file"
```

---

# 3) Connect & Push to GitHub (if you created locally)

```bash
# create an empty repo on GitHub named hello-devops, then:
git branch -M main
git remote add origin https://github.com/<you>/hello-devops.git
git push -u origin main
```

---

# 4) Pull latest from GitHub

```bash
git pull origin main
```

---

# 5) Branch → Work → Commit → Push

```bash
git checkout -b feature/update-readme   # create & switch
echo "# Hello DevOps" > README.md
git add README.md
git commit -m "docs: add README"
git push -u origin feature/update-readme
```

Open a Pull Request on GitHub → review → **Merge** into `main`.

---

# 6) Merge locally (alternative to PR)

```bash
git checkout main
git pull origin main
git merge feature/update-readme
git push origin main
```

---

# The “Revert/Undo” Toolkit (most useful cases)

### A) Unstage something you added by mistake

```bash
git add .
git status
git restore --staged path/to/file         # remove from staging only
```

### B) Discard local (unstaged) changes in a file

```bash
git restore path/to/file                  # back to last commit version
```

### C) Change the last commit message or include forgotten files (no push yet)

```bash
# edit message only:
git commit --amend -m "better message"

# include more files:
git add forgotten.txt
git commit --amend
```

### D) Revert a specific commit (safe for public branches)

```bash
git log --oneline                         # copy the commit hash (e.g., a1b2c3d)
git revert a1b2c3d                        # creates a new commit that undoes it
git push origin main
```

### E) Reset to an earlier commit (rewrite history — avoid on shared branches)

```bash
git log --oneline
git reset --soft  a1b2c3d   # keep changes staged (moves HEAD only)
git reset --mixed a1b2c3d   # keep changes unstaged (default)
git reset --hard  a1b2c3d   # blow away local changes to match that commit
```

### F) Recover after “oops I hard-reset/overwrote”

```bash
git reflog                                # find the lost HEAD ref
git checkout -b rescue <ref-from-reflog>  # restore to a new branch
```

### G) Abort a conflicted merge

```bash
git merge feature-x
# conflicts...
git merge --abort
```

### H) Resolve conflicts & continue

```bash
# open files, fix conflict markers <<<<<<< ======= >>>>>>>
git add fixed-file.js
git commit                                 # completes the merge
```

---

# Useful Views

```bash
git log --oneline --graph --decorate --all
git diff                 # unstaged changes
git diff --staged        # staged vs HEAD
```

---

# Mini-Lab: Do It Now

```bash
# 1) clone your repo
git clone https://github.com/<you>/hello-devops.git
cd hello-devops

# 2) create a feature branch & change a file
git checkout -b feature/greet
echo "Welcome to CI/CD" >> hello.txt
git add hello.txt
git commit -m "feat: add CI/CD greeting"
git push -u origin feature/greet

# 3) open PR on GitHub and merge it

# 4) update main locally
git checkout main
git pull origin main

# 5) revert the greeting commit (simulate a mistake)
git log --oneline         # get the hash of that commit
git revert <hash>
git push origin main
```

---