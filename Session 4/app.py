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
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
