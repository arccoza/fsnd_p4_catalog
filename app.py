import locallib
from flask import Flask
from api import api_bp, db


app = Flask(__name__)
app.register_blueprint(api_bp, url_prefix='/api')
db.bind('postgres', database='catalog')
db.generate_mapping(create_tables=True)


@app.route("/")
def root():
    return "Hello World!"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
