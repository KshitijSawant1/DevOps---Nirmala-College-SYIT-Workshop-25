from flask import Flask,jsonify
app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Hello, DevOps Workshop Session 3</h1><h3>Freestyle Project + Email Notify + WebHook + TestCases<h3>"

@app.route("/health")
def health():
    return jsonify(status='ok'),200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)