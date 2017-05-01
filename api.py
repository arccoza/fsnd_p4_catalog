from flask import Blueprint, Response
from flask_restful import Resource, Api, reqparse
from pony.orm import show, select, db_session, Database, PrimaryKey, Required,\
    Optional, Set
from pony.orm.serialization import to_json, to_dict
import json
from datetime import *


api_bp = Blueprint('api', __name__)
api = Api(api_bp)
db = Database()


class User(db.Entity):
    username = Required(str)

    def to_dict(self):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()}
        # return {attr.name: val for attr, val in self._vals_.items()}

    def to_json(self):
        return json.dumps(self.to_dict())


class Category(db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    title = Required(str)
    description = Optional(str)
    items = Set('Item', reverse='categories')


class Item(db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    title = Required(str)
    description = Optional(str)
    categories = Set('Category', reverse='items')


class UserRes(Resource):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        input = reqparse.RequestParser()
        input.add_argument('username', type=str, help='User\'s handle.')
        self.input = input

    def get(self, id=None):
        with db_session:
            users = select(u for u in User)[:]

        print(users[0].to_dict())
        return [u.to_dict() for u in users]
        # return Response((bytes(u.to_json(), 'utf8') for u in users), mimetype='application/json')

    def post(self):
        kwargs = self.input.parse_args()
        user = None

        with db_session:
            user = User(**kwargs)

        return user.to_dict(), 201


api.add_resource(UserRes, '/users/', '/users/<int:id>')
