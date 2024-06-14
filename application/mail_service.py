from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'no-reply@clickreads.com'
SENDER_PASSWORD = ''

def send_message(to,subject,body):
    msg =MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg.attach(MIMEText(body,'html'))
    email_server = SMTP(host=SMTP_HOST,port=SMTP_PORT)
    email_server.send_message(msg=msg)
    email_server.quit()