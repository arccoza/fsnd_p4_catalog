import locallib
from flask import Flask
from api import api_bp
from models import db
import psycopg2 as psql


app = Flask(__name__)
app.register_blueprint(api_bp, url_prefix='/api')

# Ref: http://stackoverflow.com/questions/34484066/create-a-postgres-database-using-python
# Create the required database if it doesn't exist.
con = psql.connect(dbname='postgres')
con.autocommit = True
cur = con.cursor()
try:
    # cur.execute('DROP DATABASE catalog;')
    cur.execute('CREATE DATABASE catalog;')
except:
    pass

db.bind('postgres', database='catalog')
db.generate_mapping(create_tables=True)


@app.route("/")
def root():
    return "Hello World!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
