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
