class Config(object):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite3'
    SECRET_KEY = "2_2_F_3_0_0_2_9_8_6"                      # For signed session cookies
    SECURITY_LOGIN_URL = "/#/"                              # Redirecting Flask-Security login to application login
    WTF_CSRF_ENABLED = False                                
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    MAX_BOOKS_ALLOWED = 5
    MAX_DAYS_OF_ISSUE = 7
    SECURITY_JOIN_USER_ROLES = 'RolesUsers'