from flask import Flask ,jsonify 
import os 
# pip install os 

app = Flask(__name__) # Double Underscore name Double Underscore
@app.route("/")
def home():
    return "<h1>Hello DevOps Session 4 !!!!</h1><h2>Nirmala College SYIT</h2><h3>Name : Kshitij Sawant | Subject : Docker</h3>"

@app.route("/health")
def health():
    return jsonify(status="ok"),200

if __name__ == "__main__":
    # Make Port Configurable ; default:5001, 5000
    port = int(os.environ.get("PORT",5002))
    app.run(host="0.0.0.0",port=port)
