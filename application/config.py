class Config(object):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite3'
    SECRET_KEY = "2_2_F_3_0_0_2_9_8_6"
    SECURITY_PASSWORD_SALT = "I_I_T_M_B_S"
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    MAX_BOOKS_ALLOWED = 5
    MAX_DAYS_OF_ISSUE = 7
    SECURITY_JOIN_USER_ROLES = 'RolesUsers'
    # CACHE_TYPE = "RedisCache"
    # CACHE_REDIS_HOST = "localhost"
    # CACHE_REDIS_PORT = 6379
    # CACHE_REDIS_DB = 2
    # CACHE_DEFAULT_TIMEOUT = 3600