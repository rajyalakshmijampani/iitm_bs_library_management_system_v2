from flask import Flask
from application.models import db
from application.config import Config
from application.books import api

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
api.init_app(app)

with app.app_context():
    import application.views

if(__name__=='__main__'):
    app.run(debug=True)