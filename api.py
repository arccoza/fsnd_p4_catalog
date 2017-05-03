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
        # return [i.to_dict() for i in obj]  # TODO: fix recursion error.
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
            item = Item[id]
        except ObjectNotFound as ex:
            abort(404)

        rvals = request.get_json() or request.values.to_dict()  # request data

        def relation_handler(t, v):
            ret = []
            for i in re.split('\s*,\s*', v):
                try:
                    ret.append(t[i])
                except:
                    pass
            return ret

        item.update(rvals, relation_handler)
        commit()
        return json_response([item])

    def delete(self, id):
        Item[id].delete()
        return '', 204


class GenericRes(Resource):
    decorators = [db_session]

    def _relation_handler(self, t, v):
        ret = []
        for i in re.split('\s*,\s*', v):
            try:
                ret.append(t[int(i)])
            except ObjectNotFound:
                pass
        return ret

    def get(self, id=None):
        cls = self.model_class

        if id is not None:
            try:
                objs = [cls[id]]
            except ObjectNotFound as ex:
                abort(404)
        else:
            objs = select(i for i in cls)[:]

        return json_response(objs)

    def post(self):
        cls = self.model_class
        rvals = request.get_json() or request.values.to_dict()  # request data

        obj = cls.from_dict(rvals, self._relation_handler)
        commit()

        return json_response([obj])

    def put(self, id):
        cls = self.model_class

        try:
            obj = cls[id]
        except ObjectNotFound as ex:
            abort(404)

        rvals = request.get_json() or request.values.to_dict()  # request data

        obj.update(rvals, self._relation_handler)
        commit()
        return json_response([obj])

    def delete(self, id):
        cls = self.model_class
        cls[id].delete()
        return '', 204


# class CategoryRes(Resource):
#     decorators = [db_session]

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#     def get(self, id=None):
#         if id:
#             try:
#                 cats = [Category[id]]
#             except ObjectNotFound as ex:
#                 abort(404)
#         else:
#             cats = select(i for i in Category)[:]
#         return Response(bytes(to_json([i.to_dict() for i in cats]), 'utf8'), mimetype='application/json')

class CategoryRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = Category


api.add_resource(UserRes, '/users/', '/users/<int:id>')
api.add_resource(ItemRes, '/items/', '/items/<int:id>')
api.add_resource(CategoryRes, '/categories/', '/categories/<int:id>')
