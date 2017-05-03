from flask import Blueprint, Response
from flask_restful import Resource, Api, reqparse, abort
from models import User, Item, Category, select, db_session, Set, SetInstance,\
    ObjectNotFound
import json


api_bp = Blueprint('api', __name__)
api = Api(api_bp)


def _to_json_default(obj):
    if isinstance(obj, SetInstance):
        return [i.to_dict() for i in obj]
    else:
        return str(obj)


def to_json(obj):
    return json.dumps(obj, indent=4, sort_keys=True, default=_to_json_default)


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


class ItemRes(Resource):
    decorators = [db_session]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        input = reqparse.RequestParser()
        input.add_argument('title', type=str, help='Item title.')
        input.add_argument('description', type=str, help='Item description.')
        input.add_argument('categories', type=int, help='Item categories.')
        self.input = input

    def get(self, id=None):
        if id:
            try:
                items = [Item[id]]
            except ObjectNotFound as ex:
                abort(404)
        else:
            items = select(i for i in Item)[:]
        return Response(bytes(to_json([i.to_dict() for i in items]), 'utf8'), mimetype='application/json')

    def post(self):
        kwargs = self.input.parse_args()
        item = None
        kwargs['categories'] = [Category(title='none')]
        item = Item(**kwargs)
        return item.to_dict(), 201

    def put(self, id):
        if not id:
            abort(404)
        kwargs = self.input.parse_args()
        item = None
        with db_session:
            item = Item[id]
            item.set(**kwargs)
        return item.to_dict(), 201

    def delete(self, id):
        Item[id].delete()
        return '', 204


api.add_resource(UserRes, '/users/', '/users/<int:id>')
api.add_resource(ItemRes, '/items/', '/items/<int:id>')
