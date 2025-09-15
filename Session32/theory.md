

# Step-by-Step Project Setup (Flask + Pytest + Jenkins Ready)

---

## **Step 1 — Create the folder structure**

```bash
mkdir "Session 2"
cd "Session 2"
mkdir tests
touch app.py requirements.txt .gitignore tests/test_app.py
```

Your structure should look like:

```
Session 2/
  app.py
  requirements.txt
  tests/
    test_app.py
  .gitignore
```

---

## **Step 2 — app.py**

Create **`app.py`** inside `Session 2/`:

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, DevOps Workshop with Flask!"

@app.route("/health")
def health():
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    # 0.0.0.0 so Jenkins/other machines can reach it; use 5001 to avoid clashes
    app.run(host="0.0.0.0", port=5001)
```

---

## **Step 3 — tests/test\_app.py**

Inside `Session 2/tests/`, create **`test_app.py`**:

```python
from app import app

def test_home_status():
    c = app.test_client()
    r = c.get("/")
    assert r.status_code == 200

def test_health_endpoint():
    c = app.test_client()
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json["status"] == "ok"
```

---

## **Step 4 — requirements.txt**

Inside `Session 2/`, create **`requirements.txt`**:

```
flask==3.0.3
gunicorn==22.0.0
pytest==8.2.0
coverage==7.6.1
```

---

## **Step 5 — .gitignore**

Inside `Session 2/`, create **`.gitignore`**:

```
venv/
__pycache__/
*.pyc
dist/
```

---

# macOS / Linux

## A. Create & activate venv, install deps

```bash
cd "Session 3 - 2"
python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## B. Run tests + coverage (you do NOT need to start the server)

```bash
coverage run -m pytest -q
coverage xml -o coverage.xml
coverage report
```

## C. If you want to run the app

If port 5001 is free:

```bash
python app.py
```

If port 5001 is busy, either kill the process or use another port.

* Find & kill what’s using 5001:

```bash
lsof -i :5001
kill -9 <PID>
```

* Or run on another port (see “Make port configurable” below):

```bash
PORT=5002 python app.py
```

---

# Windows (PowerShell or CMD)

## A. Create & activate venv, install deps

```bat
cd "Session 3 - 2"
py -3 -m venv venv
venv\Scripts\activate
py -3 -m pip install --upgrade pip
py -3 -m pip install -r requirements.txt
```

## B. Run tests + coverage (no server needed)

```bat
py -3 -m coverage run -m pytest -q
py -3 -m coverage xml -o coverage.xml
py -3 -m coverage report
```

## C. If you want to run the app

If port 5001 is free:

```bat
py -3 app.py
```

If 5001 is busy:

* Find & kill:

```bat
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

* Or run on another port (see next section):

```bat
set PORT=5002
py -3 app.py
```

---
Testing Result
---

### `2 passed in 0.14s`

* You wrote **2 test functions** in `tests/test_app.py`:

  * `test_home_status()`
  * `test_health_endpoint()`
* Both tests **ran successfully** (status code 200, JSON `"ok"`).
* They completed in **0.14 seconds**.

---

### `Wrote XML report to coverage.xml`

* Coverage was told to export results in **XML format** (because you ran `coverage xml -o coverage.xml`).
* This file is useful for CI tools like **Jenkins**, SonarQube, or GitHub Actions to parse test coverage reports.

---

### Coverage Table

```
Name                Stmts   Miss  Cover
---------------------------------------
app.py                 10      1    90%
tests/test_app.py      10      0   100%
---------------------------------------
TOTAL                  20      1    95%
```

* **Name** → the file/module being measured.
* **Stmts** → number of executable statements (lines of code that can run).
* **Miss** → how many statements were **not executed during tests**.
* **Cover** → percentage of statements executed.

---

#### File-wise:

1. **`app.py`**

   * Has **10 statements**.
   * **1 missed** → meaning 1 line of code in `app.py` was **never executed during tests**.
   * So coverage = **90%**.

   👉 Most likely, the missed line is the one inside:

   ```python
   if __name__ == "__main__":
       app.run(host="0.0.0.0", port=5001)
   ```

   Because in tests you never run the server, you just use `test_client()`.
   That’s normal and expected for Flask apps in CI — we don’t usually run the server during tests.

---

2. **`tests/test_app.py`**

   * Has **10 statements** (the test functions themselves).
   * **0 missed** → you ran everything inside them.
   * Coverage = **100%** 

---

3. **TOTAL**

   * Across all files: **20 statements**, **1 missed**.
   * Overall coverage = **95%**.

---

Got it 👍 Let’s go step by step to **connect Jenkins with Email (SMTP)** using an **App Password**.
This process works for **Gmail** (recommended) but is similar for Outlook or others.

---

## **Step 1: Generate an App Password**

1. Go to your **Google Account** → [myaccount.google.com](https://myaccount.google.com/).
2. Navigate to:

   ```
   Security → "Signing in to Google" → App Passwords
   ```
3. If you don’t see it:

   * Turn on **2-Step Verification** first (mandatory).
   * Then the "App Passwords" option will appear.
4. Create a new App Password:

   * Select app: **Mail**
   * Select device: **Other (Custom)** → type "Jenkins"
   * Click **Generate**
5. Google will give you a **16-character password** (e.g., `abcd efgh ijkl mnop`).

   * Copy it — this will be used instead of your real Gmail password.

---

## **Step 2: Configure Jenkins Mailer Plugin**

1. In Jenkins, go to:

   ```
   Manage Jenkins → System → E-mail Notification
   ```
2. Fill in:

   * **SMTP server**: `smtp.gmail.com`
   * **Use SMTP Authentication**: ✔️

     * Username: your Gmail address (`yourname@gmail.com`)
     * Password: the **App Password** you generated
   * **Use SSL**: ✔️
   * **SMTP Port**: `465` (or use `587` with TLS if SSL fails)
   * **Reply-To Address**: optional, usually your Gmail again
3. At the bottom, click **Test configuration** → enter your email.

   * If everything is correct, you’ll get a test email from Jenkins.

---

## **Step 3: Configure Extended E-mail Notification (optional but better)**

1. Still in **Manage Jenkins → System**, scroll to **Extended E-mail Notification** (from *Email Extension Plugin*).
2. Fill in the same Gmail details:

   * SMTP server: `smtp.gmail.com`
   * Port: `465`
   * Authentication: Gmail + App Password
   * Default content type: HTML (for better formatting)
   * Default recipients: e.g., `yourname@gmail.com`
3. Save.

---

## **Step 4: Add Email Step to Your Job**

In your **Freestyle Project** →

* Go to **Post-build Actions** →
* Select **E-mail Notification** or **Editable Email Notification**.
* Add your email (`yourname@gmail.com`).

Now, every build (or on failure/success depending on config) → Jenkins will send you an email.

---
Here’s the full, clean **Freestyle job** setup you just configured—written as a step-by-step runbook. I’ve also included the **Windows batch** version of your “Execute shell” step.

---

## 1) Create the Freestyle job

1. Jenkins → **New Item** → **Freestyle project** → name it (e.g., `Session32-FS`) → **OK**.

---

## 2) General

* **Description**: brief summary of what the job does (optional).
* **GitHub project**: check it and set
  `https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25/`
* Leave other General options as default unless you need them (e.g., Discard old builds).

---

## 3) Source Code Management

* **Git**

  * **Repository URL**:
    `https://github.com/KshitijSawant1/DevOps---Nirmala-College-SYIT-Workshop-25`
    (You can also use the `.git` suffix; both work.)
  * **Branches to build**: `*/main`
  * Leave **Credentials** empty if the repo is public.

---

## 4) Triggers

Choose one:

* **GitHub hook trigger for GITScm polling** (recommended if you set a GitHub webhook).
  Then, in GitHub → repo **Settings → Webhooks → Add webhook**:

  * Payload URL: `https://<your-public-jenkins>/github-webhook/`
  * Content type: `application/json`
  * Event: “Just the push event”
* Or **Poll SCM** with a schedule like `H/2 * * * *` if you don’t have a webhook.

> Ensure **Manage Jenkins → System → Jenkins URL** is set to your public/tunnel URL if using webhooks.

---

## 5) Build Steps

### macOS/Linux — “Execute shell”

(What you pasted, using `session32` as the app folder)

```bash
set -e

APP_DIR="session32"
cd "$APP_DIR"

python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

mkdir -p test-results
coverage run -m pytest -q --junitxml=test-results/pytest.xml
coverage xml -o coverage.xml

echo "== Generated files =="
ls -la
ls -la test-results
```

### Windows — “Execute Windows batch command”

(Equivalent commands)

```bat
setlocal enabledelayedexpansion
set APP_DIR=session32
cd "%APP_DIR%"

REM Create and activate venv
py -3 -m venv venv
call venv\Scripts\activate

py -3 -m pip install --upgrade pip
py -3 -m pip install -r requirements.txt

REM Run tests and produce JUnit + coverage XML
if not exist test-results mkdir test-results
py -3 -m coverage run -m pytest -q --junitxml=test-results\pytest.xml
py -3 -m coverage xml -o coverage.xml

echo == Generated files ==
dir
dir test-results
endlocal
```

> If Python is `python` instead of `py -3` on your Windows agent, replace `py -3` with `python`.

---

## 7) Post-build Actions

1. **Publish JUnit test result report**

   * **Test report XMLs**:
     `**/test-results/*.xml`
   * Leave other settings default (uncheck “Allow empty results” so missing reports fail the build).

2. **Archive the artifacts**

   * **Files to archive**:
     `**/coverage.xml`
   * This makes coverage.xml downloadable from the build.

3. **Editable Email Notification** (Email Extension plugin)

   * **Project From**: `jenkins@example.com` (or your SMTP sender)
   * **Project Recipient List**: `sawantkshitij1@gmail.com`
   * **Project Reply-To List**: `no-reply@example.com` (optional)
   * **Content Type**: `HTML (text/html)`
   * **Default Subject**:
     `Build $JOB_NAME - #$BUILD_NUMBER - $BUILD_STATUS`
   * **Default Content** (your template is fine):

     ```
     Build Status: $BUILD_STATUS
     Project: $JOB_NAME
     Build Number: #$BUILD_NUMBER
     Build URL: $BUILD_URL

     Started by: $CAUSE
     Changes:
     $CHANGES
     Console Log:
     $BUILD_LOG
     ```
   * **Attachments**: `**/coverage.xml`
   * **Attach Build Log**: check if you want logs in the email.
   * **Advanced Settings → Triggers**: add **Always** if you want mail on every build (success/failure/unstable).

> Make sure **Manage Jenkins → System → (Extended) E-mail Notification** is configured with your Gmail SMTP + App Password (you already tested this successfully).

---

## 8) Save and Run

* Click **Save**, then **Build Now**.
* Check **Console Output** for venv creation, installs, tests, and file listing.
* The build page will show:

  * **Test Result** with counts and trend after a few runs.
  * **Artifacts**: `coverage.xml`.
  * Email sent based on your trigger (Always or Success/Failure).

---