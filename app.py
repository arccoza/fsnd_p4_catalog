import locallib
from flask import Flask, render_template, url_for
from api import api_bp
from models import db
import psycopg2 as psql


app = Flask(__name__, static_folder='pub')
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
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
