from flask import Blueprint
from flask_restful import Resource, Api
from pony.orm import show, select, db_session, Database, PrimaryKey, Required, Set


api_bp = Blueprint('api', __name__)
api = Api(api_bp)
db = Database()


class UserModel(db.Entity):
    username = Required(str)


class UserRes(Resource):
    def get(self, id=None):
        with db_session:
            return select(u for u in UserModel)[:]
        # return {'name': 'Dean Venture'}


api.add_resource(UserRes, '/users/', '/users/<int:id>')
