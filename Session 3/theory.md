## Step 1 — Prepare the repo

1. Create this structure (exact names matter):

```
Session 3/
  index.html
  styles.css
  script.js
  Jenkinsfile
```

2. Example minimal files (you can keep yours):

**Session 3/index.html**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SYIT DevOps – Static CI/CD</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Static Site: Jenkins CI/CD</h1>
  <p id="msg">Hello from HTML/CSS/JS pipeline.</p>
  <script src="script.js"></script>
</body>
</html>
```

**Session 3/styles.css**

```css
body { font-family: system-ui, sans-serif; margin: 2rem; }
h1 { margin: 0 0 0.5rem; }
#msg { color: #444; }
```

**Session 3/script.js**

```js
document.getElementById('msg').textContent += ' Build succeeded.';
```

Commit and push to GitHub.

---

## Step 2 — Jenkinsfile (in `Session 3/Jenkinsfile`)
Perfect 👍 let’s prepare **two Jenkinsfiles** — one tuned for **Windows agents**, the other for **macOS/Linux agents** — plus a **cross-platform option** that works on both.

---

## 🟦 1. Jenkinsfile for **Windows**

```groovy
pipeline {
  agent { label 'windows' }   // or just "any" if your only agent is Windows
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Package') {
      steps {
        bat '''
          cd "Session 3"
          if exist dist rmdir /s /q dist
          mkdir dist
          copy /y index.html dist\\
          copy /y styles.css dist\\
          copy /y script.js dist\\
          dir dist
        '''
      }
    }
    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'Session 3/dist/**', fingerprint: true
      }
    }
  }
}
```

✅ Uses `bat`
✅ `rmdir /s /q` is like `rm -rf`
✅ `copy /y` ensures overwrite

---

## 🟩 2. Jenkinsfile for **macOS/Linux**

```groovy
pipeline {
  agent { label 'unix' }   // or "any" if your agent is macOS/Linux
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Package') {
      steps {
        sh '''
          set -e
          cd "Session 3"
          rm -rf dist && mkdir dist
          cp index.html styles.css script.js dist/
          ls -la dist
        '''
      }
    }
    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'Session 3/dist/**', fingerprint: true
      }
    }
  }
}
```

✅ Uses `sh`
✅ Works on macOS & Linux agents

---

Here’s a clean, step-by-step for creating the Jenkins **Pipeline** job, plus ready-to-paste pipeline code for **Windows** and for **macOS/Linux**.

---

## A) Create the Jenkins Pipeline job

1. New Item → **Pipeline** → name: `Session 3 Static Site`.

2. **Description** (paste this):

```
Build and package the static site in Session 3 (index.html, styles.css, script.js). 
Archives artifacts (dist/) for download. Triggered by webhook or manual runs.
```

3. **General**

* Leave “This project is parameterized” unchecked (you can add later).
* Optional: tick **GitHub project** and paste your repo URL to show a link.

4. **Build Triggers**
   Choose one:

* If you set a GitHub webhook: **GitHub hook trigger for GITScm polling**.
* If you don’t have a webhook: **Poll SCM** with `H/2 * * * *` (checks about every 2 minutes).

5. **Pipeline**
   Choose one of these two modes:

### Option 1 — Pipeline script from SCM (recommended)

* **Definition:** Pipeline script from SCM
* **SCM:** Git
* **Repository URL:** `https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25.git`
* **Branches to build:** `*/main`
* **Script Path:**

  * If your Jenkinsfile is inside the folder: `Session 3/Jenkinsfile`
  * If it’s at repo root: `Jenkinsfile`

Save. Done.

### Option 2 — Pipeline script (paste code in Jenkins UI)

* **Definition:** Pipeline script
* Paste one of the pipeline codes below (Windows or macOS/Linux).
* Save.

---

Here’s your **Windows-friendly** Pipeline Script version. It checks out your repo, **packages** the static site into a `dist` folder using Windows commands, and then archives the results.

```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25.git'
      }
    }

    stage('Package (Windows)') {
      steps {
        bat '''
          cd "Session 3"
          if exist dist rmdir /s /q dist
          mkdir dist
          copy /y index.html dist\\
          copy /y styles.css dist\\
          copy /y script.js dist\\
          dir dist
        '''
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: 'Session 3/dist/**', fingerprint: true
      }
    }
  }
}
```

If you want to **keep your original approach** (no `dist`, archive files directly from `Session 3/`), use this Windows-safe variant:

```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            url: 'https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25.git'
      }
    }

    stage('Build') {
      steps {
        echo 'Building static website (Windows)...'
      }
    }

    stage('Archive') {
      steps {
        // Windows supports this comma-separated pattern in Jenkins
        archiveArtifacts artifacts: 'Session 3/*.html, Session 3/*.css, Session 3/*.js', fingerprint: true
      }
    }
  }
}
```

Tip: the **packaging into `dist/`** is nicer for demos and later steps (like publishing or deploying).
