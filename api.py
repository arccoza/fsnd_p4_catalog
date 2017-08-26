from flask import Blueprint, Response, request, url_for, session, current_app,\
    make_response
from flask_restful import Resource, Api, reqparse, abort
from models import User, File, Item, Category, select, db_session, commit, rollback,\
    Set, SetInstance, ObjectNotFound, DataError, Password, OAuth
import json
import re
from security import authorize
from base64 import b64decode


api_bp = Blueprint('api', __name__)
api = Api(api_bp)


def _to_json_default(obj):
    if isinstance(obj, SetInstance):
        return [i.id for i in obj]
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


class AuthRes(Resource):
    decorators = [authorize()]

    def get(self):
        return json_response(dict(session.items()))


class GenericRes(Resource):
    decorators = [db_session, authorize()]

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
            ids = re.split('\s*,\s*', id)
            try:
                # objs = [cls[id]]
                objs = select(i for i in cls if i.id in ids)[:]
            except (ObjectNotFound, DataError) as ex:
                abort(404)
        else:
            objs = select(i for i in cls)[:]

        return json_response(objs)

    def post(self):
        cls = self.model_class
        rvals = request.get_json() or request.values.to_dict()  # request data
        # rvals['content'] = b64decode(rvals['content'])
        print(rvals)

        # obj = cls.from_dict(rvals, self._relation_handler)
        # commit()

        # return json_response([obj])
        return json_response([])

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


class UserRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = User


class FileRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = File


class ItemRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = Item


class CategoryRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = Category


api.add_resource(AuthRes, '/auth/')
api.add_resource(UserRes, '/users/', '/users/<id>')
api.add_resource(FileRes, '/files/', '/files/<id>')
api.add_resource(ItemRes, '/items/', '/items/<id>')
api.add_resource(CategoryRes, '/categories/', '/categories/<id>')
