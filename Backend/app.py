# Using flask to make an api 
# import necessary libraries and functions 
from flask import Flask, jsonify, request 
from flask_cors import CORS
import pandas as pd

# creating a Flask app 
app = Flask(__name__) 
CORS(app)

# on the terminal type: curl http://127.0.0.1:5000/api/eco_react 
# returns "API Works" when we use GET. 
# returns the data that we send when we use POST. 
@app.route('/app/login', methods = ['GET', 'POST']) 
def input_form(): 
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email == "chandan@example.com" and password == "$2b$12$HashedPasswordHere":
        data = {'token': 'valid'}
    else:
        data = None

    return jsonify(data), 200
  
# driver function 
if __name__ == '__main__': 
    app.run(debug = True) 