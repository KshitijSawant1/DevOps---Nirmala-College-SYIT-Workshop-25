# 1) Base image 
FROM python:3.11-slim

# 2) Environment (faster Logs, no .pyc)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYHTONBUFFERED=1 \ 
    PORT=5001

# 3) Workdir
WORKDIR /app

# 4) Install Dependencies (layer-cached)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5) Copy App Source
COPY . .

# 6) Expose App Port 
EXPOSE 5001

# 7) Default start Command 
CMD ["python","app.py"]