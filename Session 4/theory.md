## 1) Create the project folder

Pick a clean name for Session 4:

```bash
mkdir "session4-flask"
cd "session4-flask"
```

## 2) Create files

You need two files for now.

**requirements.txt**

```
flask==3.0.3
gunicorn==22.0.0
```

**app.py**

```python
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello from Session 4 (Docker + Jenkins)!"

@app.route("/health")
def health():
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    # Make port configurable; default 5001
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
```

## 3) Create and activate a virtual environment, then install deps

### macOS / Linux

```bash
python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Windows (PowerShell or CMD)

```bat
py -3 -m venv venv
venv\Scripts\activate
py -3 -m pip install --upgrade pip
py -3 -m pip install -r requirements.txt
```

## 4) Run the app locally

### macOS / Linux

```bash
python app.py
# open http://localhost:5001 and http://localhost:5001/health
```

### Windows

```bat
py -3 app.py
REM open http://localhost:5001 and http://localhost:5001/health
```

If port 5001 is busy, run on another port:

* macOS/Linux:

  ```bash
  PORT=5002 python app.py
  ```
* Windows:

  ```bat
  set PORT=5002
  py -3 app.py
  ```

---

## Step 2 — Add Docker files

### A) `Dockerfile` (place next to `app.py`)

```dockerfile
# 1) Base image
FROM python:3.11-slim

# 2) Environment (faster logs, no .pyc)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5001

# 3) Workdir
WORKDIR /app

# 4) Install dependencies (layer-cached)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5) Copy app source
COPY . .

# 6) Expose app port
EXPOSE 5001

# 7) Default start command
CMD ["python", "app.py"]
```

### B) `.dockerignore`

```
venv/
__pycache__/
*.pyc
*.pyo
.coverage
coverage.xml
test-results/
dist/
.git
.gitignore
```

---

## Step 3 — Build the image

### macOS / Linux

```bash
# Run these from the session4-flask folder (where Dockerfile is)
docker build -t session4-flask:latest .
```

### Windows (PowerShell/CMD)

```bat
docker build -t session4-flask:latest .
```

---

## Step 4 — Run the container locally

### A) Foreground (good for first run)

```bash
docker run --rm -p 5001:5001 -e PORT=5001 --name session4 session4-flask:latest
```

* Visit: `http://localhost:5001/` and `/health`
* Stop with `Ctrl+C`


Perfect question 👍 Let’s carefully split the process for **macOS/Linux** and **Windows PowerShell**, since the commands differ slightly.

---

## **On macOS / Linux**

```bash
# 1) Start the container in background (detached mode)
docker run -d -p 5001:5001 --name session4 session4-flask:latest

# 2) Quick health check (uses curl)
curl -s http://localhost:5001/health

# 3) View logs
docker logs session4

# 4) Stop the container
docker stop session4
```

✔️ Notes:

* `curl` is pre-installed on macOS/Linux, so you can test endpoints directly.
* Logs stream the output your Flask app writes.

---

## **On Windows PowerShell**

```powershell
# 1) Start the container in background
docker run -d -p 5001:5001 --name session4 session4-flask:latest

# 2) Quick health check (PowerShell equivalent of curl)
Invoke-WebRequest -UseBasicParsing http://localhost:5001/health

# 3) View logs
docker logs session4

# 4) Stop the container
docker stop session4
```

✔️ Notes:

* In PowerShell, `curl` exists but is aliased to `Invoke-WebRequest` (not always friendly).
* That’s why we explicitly use `Invoke-WebRequest`.

---


## Step 1 — Verify your Docker username

```bash
docker info | grep Username
```

Example output:

```
 Username: kshitijsawant
```

If nothing shows, you’re not logged in — do:

```bash
docker login -u kshitijsawant
```

---

## Step 2 — Re-login cleanly (optional but safer)

```bash
docker logout
docker login -u kshitijsawant
# enter password or personal access token if 2FA enabled
```

---

## Step 3 — Tag your image correctly (use your username)

### Build it first (inside your `Session 4/` folder, where your `Dockerfile` is):

```bash
docker build -t session4-flask:latest .
```

```bash
docker tag session4-flask:latest kshitijsawant/session4-flask:1.0.0
docker tag session4-flask:latest kshitijsawant/session4-flask:latest
```

---

## Step 4 — Push the tags to Docker Hub

```bash
docker push kshitijsawant/session4-flask:1.0.0
docker push kshitijsawant/session4-flask:latest
```

---

## Step 5 — Sanity check

```bash
docker images | grep session4-flask
```

You should see:

```
session4-flask                 latest    <image-id>  
kshitijsawant/session4-flask   1.0.0     <image-id>  
kshitijsawant/session4-flask   latest    <image-id>
```

---
