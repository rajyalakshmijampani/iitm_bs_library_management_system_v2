from app import app
from application.models import db, Role, User

with app.app_context():
    db.create_all()
    admin = Role(id='admin', name='admin',description='admin role')
    db.session.add(admin)
    user = Role(id='user', name='user',description='user role')
    db.session.add(user)

    try:
        db.session.commit()
    except:
        pass


