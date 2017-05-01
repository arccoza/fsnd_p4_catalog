from flask import Blueprint
from flask_restful import Resource, Api, reqparse
from pony.orm import show, select, db_session, Database, PrimaryKey, Required,\
    Optional, Set
from pony.orm.serialization import to_json, to_dict
import json


api_bp = Blueprint('api', __name__)
api = Api(api_bp)
db = Database()


class UserModel(db.Entity):
    username = Required(str)


class CatagoryModel(db.Entity):
    title = Required(str)
    # description = Optional(str)


class ItemModel(db.Entity):
    title = Required(str)
    # description = Optional(str)


# with db.permissions_for(UserModel, CatagoryModel, ItemModel):
#     allow('view', group='anybody')


class UserRes(Resource):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        input = reqparse.RequestParser()
        input.add_argument('username', type=str, help='User\'s handle.')
        self.input = input

    def get(self, id=None):
        with db_session:
            users = select(u for u in UserModel)[:]

        print(to_dict(users[0]))
        return to_json(users)

    def post(self):
        kwargs = self.input.parse_args()
        user = None

        with db_session:
            user = UserModel(**kwargs)

        return to_json(user), 201


api.add_resource(UserRes, '/users/', '/users/<int:id>')
