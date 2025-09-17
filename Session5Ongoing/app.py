from flask import Flask,jsonify
import os 
app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>DevOps Session 5 !!!</h1><h2>Nirmala College | SYIT</h2><h3>Kshitij K Sawant</h3>"

@app.route("/health")
def health():
    return jsonify(status="ok"),200


if __name__ == "__main__":
    port = int (os.environ.get("PORT",5002))
    app.run(host="0.0.0.0",port=port)