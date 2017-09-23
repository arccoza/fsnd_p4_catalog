#!/usr/bin/python
# REF: http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/
import sys
import logging
import locallib
sys.path.insert(0,"/var/www/fsnd_p4_catalog/")
logging.basicConfig(stream=sys.stderr)
from app import app as application
