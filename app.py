from flask import Flask
from flask_security import  Security
from application.models import db,User,Role
from application.config import Config
# from application.books import api
from application.datastore import datastore
from werkzeug.security import generate_password_hash
from application.worker import celery_init_app

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
# api.init_app(app)

with app.app_context():
    db.create_all()

    datastore.find_or_create_role(name='admin',description='Admin role')
    datastore.find_or_create_role(name='user',description='User role')
    db.session.commit()

    if not datastore.find_user(email='admin@email.com'):
        datastore.create_user(email='admin@email.com',password=generate_password_hash('admin'),name='admin',roles=['admin'])
    if not datastore.find_user(email='user1@email.com'):
        datastore.create_user(email='user1@email.com',password=generate_password_hash('user1'),name='user1',roles=['user'])
    
    db.session.commit()

app.security = Security(app, datastore)

with app.app_context():
    import application.views

celery_app = celery_init_app(app)

if(__name__=='__main__'):
    app.run(debug=True)