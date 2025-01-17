from flask import Flask
from flask_security import  Security
from flask_caching import Cache
from application.models import db,User,Role
from application.config import Config
# from application.books import api
from application.datastore import datastore
from werkzeug.security import generate_password_hash
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import user_reminder,admin_report

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
# api.init_app(app)
excel.init_excel(app)
app.security = Security(app, datastore)
celery_app = celery_init_app(app)


with app.app_context():
    import application.views

with app.app_context():
    db.create_all()

    datastore.find_or_create_role(name='admin',description='Admin role')
    datastore.find_or_create_role(name='user',description='User role')
    db.session.commit()

    if not datastore.find_user(email='admin@email.com'):
        datastore.create_user(email='admin@email.com',password=generate_password_hash('admin'),name='admin',roles=['admin'])
    
    db.session.commit()

@celery_app.on_after_configure.connect
def send_reminder_email_to_users(sender,**kwargs):
    sender.add_periodic_task(20.0, user_reminder.s('Daily Reminder - Books pending for return'),name='User Reminder') #crontab(hour=19, minute=00)

@celery_app.on_after_configure.connect
def send_activity_report_to_admin(sender,**kwargs):
    sender.add_periodic_task(20.0, admin_report.s('Monthly Activity Report - ClickReads'),name='Admin Report') #crontab(hour=08, minute=00, day_of_month=1)


if(__name__=='__main__'):
    app.run(debug=True)