from flask import current_app as app,jsonify,request,render_template
from flask_security import auth_required, roles_required
from .models import Request,db
from .datastore import datastore
from werkzeug.security import check_password_hash

@app.get('/')
def home():
    return render_template("index.html")

@app.get("/admin")
@auth_required("token")
@roles_required("admin")
def admin():
    return "Welcome admin"

@app.get("/approve/<int:req_id>")
@auth_required("token")
@roles_required("admin")
def approve(req_id):
    req = Request.query.get(id=req_id)
    if not req:
        return jsonify({"message":"Request not found"}),404
    else:
        req.status = "APPROVED"
        db.session.commit()
        return jsonify({"message":"Request Approved"}),404

@app.post('/user_login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message":"Email is required"}),400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"User not found"}),404
    if check_password_hash(user.password,data.get("password")):
        return jsonify({"email":user.email,"role":user.roles[0].name,
                        "token":user.get_auth_token()})
    else:
        return jsonify({"message":"Incorrect password"}),400
