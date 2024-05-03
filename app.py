from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security
from application.models import db,User,Role
from application.config import Config
from application.books import api

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
api.init_app(app)
datastore  = SQLAlchemyUserDatastore(db,User,Role)
app.security = Security(app, datastore)

with app.app_context():
    import application.views

if(__name__=='__main__'):
    app.run(debug=True)