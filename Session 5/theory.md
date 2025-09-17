
---

# **Step 1 — Create Flask App & Environment**

### 1. Project Folder

Create a folder called **`Session 5/`** in your repo.

```
Session 5/
  app.py
  requirements.txt
  .gitignore
```

---

### 2. `app.py`

```python
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello from Session 5: Docker + Jenkins CI/CD!"

@app.route("/health")
def health():
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    # Default to port 5001, can be overridden by env variable
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
```

---

### 3. `requirements.txt`

```
flask==3.0.3
gunicorn==22.0.0
pytest==8.2.0
coverage==7.6.1
```

---

### 4. `.gitignore`

```
venv/
__pycache__/
*.pyc
*.log
.coverage
coverage.xml
dist/
```

---

### 5. Create Virtual Environment & Install Packages

#### macOS / Linux

```bash
cd "Session 5"
python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Windows (PowerShell / CMD)

```powershell
cd "Session 5"
py -3 -m venv venv
venv\Scripts\activate
py -3 -m pip install --upgrade pip
py -3 -m pip install -r requirements.txt
```

---

### 6. Run the App Locally

```bash
python app.py
```

Open in browser:

* [http://localhost:5001](http://localhost:5001)
* [http://localhost:5001/health](http://localhost:5001/health)

---


```bash
git add .
git commit -m "Add Session 5 Flask app and requirements"
git push origin main
```


---

### 1. **Build the Docker image**

```bash
docker build -t session5-flask:latest .
```

---

### 2. **Run the container (detached mode)**

```bash
docker run -d -p 5001:5001 --name session5 session5-flask:latest
```

Health check and logs:

```bash
curl -s http://localhost:5001/health
docker logs session5
```

Stop container:

```bash
docker stop session5
```

---

### 3. **Tag the image for Docker Hub**

```bash
docker tag session5-flask:latest kshitijsawant/session5-flask:1.0.0
docker tag session5-flask:latest kshitijsawant/session5-flask:latest
```

---

### 4. **Login to Docker Hub (with PAT)**

```bash
docker login -u kshitijsawant
# Enter PAT instead of password
```

---

### 5. **Push images to Docker Hub**

```bash
docker push kshitijsawant/session5-flask:1.0.0
docker push kshitijsawant/session5-flask:latest
```

---


##  Step 1: Enable 2FA on Docker Hub

1. Go to [Docker Hub → Security Settings](https://hub.docker.com/settings/security).
2. Enable **Two-Factor Authentication (2FA)**.

   * You’ll scan a QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.).
   * Save the backup codes somewhere safe.

After this, **your normal password will no longer work for `docker login`**. You must use a token (PAT).

---

## Step 2: Create a Personal Access Token (PAT)

1. Go to [Docker Hub → Access Tokens](https://hub.docker.com/settings/security).
2. Click **New Access Token**.
3. Give it a name (e.g., `jenkins-ci` or `macbook-dev`).
4. Set permissions:

   * **Read & Write** if you’ll push images.
   * **Read Only** if you just pull.
5. Click **Generate** and copy the token (you’ll see it only once!).

---

## Step 3: Use PAT instead of password

Now when you log in:

```bash
docker login -u kshitijsawant
```

Enter your **PAT** (not your Docker Hub password).

You should see:

```
Login Succeeded
```

---

## Step 4: Store PAT in Jenkins (for CI/CD)

1. In Jenkins, go to:

   * **Manage Jenkins → Credentials → Add Credentials**.
2. Choose **Username with password**:

   * Username: `kshitijsawant`
   * Password: (your **PAT**)
   * ID: `dockerhub-creds` (you’ll use this in pipelines)
3. Save.

Now your Jenkinsfile or Freestyle job can do:

```bash
echo $DH_PASS | docker login -u $DH_USER --password-stdin
```

(where `$DH_USER` and `$DH_PASS` come from credentials).

---

## 📄 `Dockerfile`

```dockerfile
# Use lightweight Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port (Flask default is configurable)
EXPOSE 5001

# Run using Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app"]
```

Notes:

* Uses **python:3.11-slim** → small, secure base image.
* Installs dependencies only once → efficient caching.
* Runs with **Gunicorn** (better than Flask dev server).
* Exposes port **5001** (matches your app).

---

## `.dockerignore`

```gitignore
# Ignore Python cache
__pycache__/
*.pyc
*.pyo
*.pyd

# Virtual environment
venv/
.env

# IDE/editor settings
*.vscode/
*.idea/
*.DS_Store

# Git
.git
.gitignore

# Logs
*.log

# Local files
*.sqlite3
```

This keeps your image **clean and small** by ignoring unnecessary files.

---