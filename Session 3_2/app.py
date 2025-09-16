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
    app.run(host="0.0.0.0", port=5002)
