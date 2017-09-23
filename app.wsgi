#!/usr/bin/python
# REF: http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/
import sys
import logging
import os
print(os.getcwd())
sys.path.insert(0,"/var/www/fsnd_p4_catalog/")
sys.path.insert(1,"/var/www/fsnd_p4_catalog/lib/")
logging.basicConfig(stream=sys.stderr)

from app import app as application
