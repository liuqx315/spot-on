## The database id of the demonstration
use_demo = False
demo_id = None

## Here store custom and secret settings
RECAPTCHA_USE = False ## Set to True to check for CAPTCHA.
RECAPTCHA_PUBLIC = "" 
RECAPTCHA_SECRET = ""
## https://www.google.com/recaptcha/admin (to administrate them)

## Email settings
EMAIL_USE = False
EMAIL_USE_TLS = True
EMAIL_HOST = ''
EMAIL_PORT = 587
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''

## Default parameters to compute the jump length distribution
compute_params = {'BinWidth' : 0.01,
                  'GapsAllowed' : None,
                  'TimePoints' : 8,
                  'JumpsToConsider' : 4,
                  'MaxJump' : 3,
                  'TimeGap' : 4.477}