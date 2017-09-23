#!/usr/bin/python
# REF: http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/
import sys
import logging
from app import app as application


sys.path.insert(0,"/var/www/fsnd_p4_catalog/")
logging.basicConfig(stream=sys.stderr)
