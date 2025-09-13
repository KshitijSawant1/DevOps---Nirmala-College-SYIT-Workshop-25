from flask import Flask
app = Flask(__name__) # Double Underscore "_" Before and After name 

@app.route("/")
def home ():
    # return "Hello DevOps Session 2"
    return "<h1>Hello DevOps !!</h1><br><h2>Nirmala Collge SYIT | Day 2, 13th September 2025</h2><br><h2>Jenkins Setup & Basic CI/CD Pipeline</h2>"

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5001)