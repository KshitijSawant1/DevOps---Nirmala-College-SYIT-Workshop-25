# 1) Create the Flask app files (local)

Target layout in your repo:

```
Session 2/
  app.py
  requirements.txt
```

`Session 2/app.py`

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, DevOps Workshop with Flask!"

if __name__ == "__main__":
    # 0.0.0.0 so it’s reachable by IP, port 5000 for consistency
    app.run(host="0.0.0.0", port=5000)
```

`Session 2/requirements.txt`

```
flask==3.0.3
```

If you already created these files in VS Code, ensure they are saved at the exact path above.

---

# 2) Push the code to GitHub

If the repository already exists on GitHub (it does, for you), and you have the repo cloned locally:

```bash
cd /path/to/your/local/clone

# Confirm the files exist:
ls -la "Session 2"

# Stage, commit, push
git add "Session 2/app.py" "Session 2/requirements.txt"
git commit -m "feat: simple Flask app for Jenkins demo"
git push origin main
```

If you hadn’t cloned the repo yet:

```bash
git clone https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25.git
cd DevOps---Nirmala-College-SYIT-Workshop-25
# add the files, then commit and push as above
```

---

# 3) Create the Jenkins Freestyle job

## General

* (Optional) Check “GitHub project” and set the project URL to your repo page.

## Source Code Management

* Select: Git
* Repository URL:

  ```
  https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25.git
  ```
* Branches to build: `main`
* Credentials: leave empty if repo is public.

## Build Triggers

Pick one:

* For manual demo: leave all unchecked (you will click “Build Now”).
* For auto builds: check **Poll SCM** and use `H/2 * * * *` (poll every \~2 minutes), or configure a GitHub webhook and check **GitHub hook trigger for GITScm polling**.

## Build Steps → Execute shell (macOS/Linux)

Paste this script:

```bash
set -e

APP_DIR="$WORKSPACE/Session 2"
cd "$APP_DIR"

# Install Flask (no venv for simplicity)
# If 'pip3' is not found, use 'python3 -m pip' instead:
pip3 install --user -r requirements.txt || python3 -m pip install --user -r requirements.txt

# Stop any previous run of this app (best effort)
pkill -f "python3 app.py" || true

# Start Flask in background on :5000 and write a simple log
nohup python3 app.py > flask.log 2>&1 &
echo $! > flask.pid

echo "Flask app started."
echo "Open http://localhost:5000/ on the Jenkins machine."
```

Windows agent alternative (batch):

```bat
set "APP_DIR=%WORKSPACE%\Session 2"
cd /d "%APP_DIR%"

py -3 -m pip install --user -r requirements.txt

for /f "tokens=2" %%a in ('tasklist ^| find "python.exe"') do (
  rem best-effort stop, ignore errors
  taskkill /PID %%a /F >nul 2>&1
)

start /B py -3 app.py > flask.log 2>&1
rem Getting exact PID on Windows reliably needs extra steps; optional
echo App started. Open http://localhost:5000/
```

## Post-build Actions

* Archive the artifacts:

  ```
  **/flask.log, **/flask.pid
  ```

(Archiving is optional, but useful to show logs from each build.)

Click **Save**.

---

# 4) Run the build and view the app

1. Click **Build Now**.
2. Open **Console Output**. The last lines should say the app started and the URL.
3. On the Jenkins machine, open a browser to:
   `http://localhost:5000/`
4. To access from another device on the same network, replace `localhost` with the Jenkins machine’s IP address. On macOS, you can find the IP in System Settings → Network, or run `ipconfig getifaddr en0`.

---

# 5) Make a change and see it in Jenkins

How updates work:

* Jenkins does not detect changes you make locally in VS Code until you **push** those changes to GitHub (or you manually trigger a build).
* After you push:

  * If you enabled **Poll SCM** or **webhook**, Jenkins will start a new build automatically.
  * If you kept it manual, click **Build Now** yourself.

Example change:

```bash
# Edit 'Session 2/app.py' home() text, then:
git add "Session 2/app.py"
git commit -m "feat: tweak homepage message"
git push origin main
# wait for Jenkins to build (or click Build Now)
```

The build’s shell step stops any previous instance and starts the app again, so the new message appears when you refresh the page.

Important clarification:

* Running the Flask app directly from VS Code on your laptop does not update the Jenkins-run app. They are separate processes. Jenkins only reflects changes that you push to the repo and that a Jenkins build runs.
* If you want “live reload” while editing in VS Code, that is for local development (Flask’s debug mode). Jenkins is for CI/CD; it shows changes after a new build.

---

# 6) Common fixes

* `pip3: command not found`
  Use `python3 -m pip install --user -r requirements.txt`.
* Port already in use
  Something else is on 5000. Stop it or change the port in `app.py` and the message you print. Example: `app.run(host="0.0.0.0", port=5001)`.
* Can’t access from other devices
  Use the Jenkins machine’s IP instead of `localhost`, and make sure the firewall allows the port.

---

# 7) What to show in class

* GitHub repo with `Session 2/app.py` and `requirements.txt`.
* Jenkins job configuration:

  * Git SCM pointing to your repo and `main`.
  * Build step script.
  * (Optional) Post-build artifacts for logs.
* Build Now → Console Output shows steps.
* Browser: `http://localhost:5000/` shows the Flask page.
* Make a small change, push, re-build, refresh page to show the update.