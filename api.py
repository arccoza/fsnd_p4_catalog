from flask import Blueprint, Response, request
from flask_restful import Resource, Api, reqparse, abort
from models import User, Item, Category, select, db_session, commit, Set,\
    SetInstance, ObjectNotFound
import json
import re


api_bp = Blueprint('api', __name__)
api = Api(api_bp)


def _to_json_default(obj):
    if isinstance(obj, SetInstance):
        pass
        # return [i.to_dict() for i in obj]
    try:
        return obj.to_dict()
    except AttributeError:
        return str(obj)


def to_json(obj):
    try:
        obj = obj.to_dict()
    except AttributeError:
        pass
    return json.dumps(obj, indent=4, sort_keys=True, default=_to_json_default)


def json_response(obj):
    return Response(bytes(to_json(obj), 'utf8'), mimetype='application/json')


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
        if id is not None:
            try:
                items = [Item[id]]
            except ObjectNotFound as ex:
                abort(404)
        else:
            items = select(i for i in Item)[:]
        return json_response(items)

    def post(self):
        # kwargs = self.input.parse_args()
        # item = {}
        # if kwargs.get('categories', -1) is None:
        #     del kwargs['categories']
        # item = Item(**kwargs)
        # commit()
        # print(kwargs)
        # Category(title='Test1', description='')
        # commit()
        rvals = request.get_json() or request.values.to_dict()  # request data

        def relation_handler(t, v):
            ret = []
            for i in re.split('\s*,\s*', v):
                try:
                    ret.append(t[int(i)])
                except ObjectNotFound:
                    pass
            return ret

        item = Item.from_dict(rvals, relation_handler)
        commit()
        return json_response([item])

    def put(self, id):
        try:
            items = [Item[id]]
        except ObjectNotFound as ex:
            abort(404)
        # if not id:
        #     abort(404)
        # kwargs = self.input.parse_args()
        # item = Item[id]
        # if kwargs.get('categories', -1) > 0:
        #     try:
        #         kwargs['categories'] = Category[kwargs['categories']]
        #     except:
        #         pass
        # else:
        #     del kwargs['categories']
        # item.set(**kwargs)
        # return json_response([item])
        # print(Category[1])
        rvals = request.get_json() or request.values.to_dict()  # request data

        def relation_handler(t, v):
            ret = []
            for i in re.split('\s*,\s*', v):
                try:
                    ret.append(t[i])
                except:
                    pass
            return ret

        item = Item.from_dict(rvals, relation_handler)
        return json_response([item])

    def delete(self, id):
        Item[id].delete()
        return '', 204


class CategoryRes(Resource):
    decorators = [db_session]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        input = reqparse.RequestParser()
        input.add_argument('title', type=str, help='Category title.')
        input.add_argument('description', type=str, help='Category description.')
        input.add_argument('items', type=int, help='Items in category.')
        self.input = input

    def get(self, id=None):
        if id:
            try:
                cats = [Category[id]]
            except ObjectNotFound as ex:
                abort(404)
        else:
            cats = select(i for i in Category)[:]
        return Response(bytes(to_json([i.to_dict() for i in cats]), 'utf8'), mimetype='application/json')


api.add_resource(UserRes, '/users/', '/users/<int:id>')
api.add_resource(ItemRes, '/items/', '/items/<int:id>')
api.add_resource(CategoryRes, '/categories/', '/categories/<int:id>')
