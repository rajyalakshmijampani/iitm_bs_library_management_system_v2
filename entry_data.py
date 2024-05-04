from app import app
from application.datastore import datastore
from application.models import db, Role, User
from werkzeug.security import generate_password_hash

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

