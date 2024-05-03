from flask import current_app as app,jsonify
from flask_security import auth_required, roles_required
from .models import Request,db

@app.get('/')
def home():
    return "Hello"

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