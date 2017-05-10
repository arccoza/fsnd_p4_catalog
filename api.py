from flask import Blueprint, Response, request, url_for, session
from flask_restful import Resource, Api, reqparse, abort
from models import User, Item, Category, select, db_session, commit, rollback,\
    Set, SetInstance, ObjectNotFound, Password
import json
import re
from functools import wraps
import base64


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


def basic_auth(upgrade=True):
    def deco(fn):
        @wraps(fn)
        def wrap(*args, **kwargs):
            try:
                auth = request.headers['Authorization']
                kind, value = auth.split(' ')
                value = base64.standard_b64decode(bytes(value, 'utf8'))
                id, pw = str(value, 'utf8').split(':')
            except:
                return fn(*args, **kwargs)
            # print(id, pw)
            with db_session:
                user = select(u for u in User if u.email == id or u.username == id)
                if len(user) == 1:
                    user = next(iter(user))
                    if Password.verify(pw, user.password):
                        session['userid'] = user.id
                        return fn(*args, **kwargs)
            session.clear()
            return fn(*args, **kwargs)
        return wrap
    return deco


# class UserRes(Resource):
#     decorators = [db_session]

#     def get(self, id=None):
#         if id is not None:
#             try:
#                 user = User[id]
#             except ObjectNotFound as ex:
#                 abort(404)
#         else:
#             user = select(i for i in User)[:]
#         return json_response(user)

#     def post(self):
#         rvals = request.get_json() or request.values.to_dict()  # request data
#         user = User.from_dict(rvals)
#         # user = User(email='bob@mail.com', password='1234')
#         rollback()
#         return json_response(
#             [{k: v for k, v in user.to_dict().items() if k != 'password'}])


class AuthRes(Resource):
    decorators = [basic_auth()]

    def get(self):
        # sess = current_app.open_session(request)
        # print(request.cookies.get(current_app.session_cookie_name, None))
        return json_response(dict(session.items()))


class GenericRes(Resource):
    decorators = [db_session, basic_auth()]

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


class UserRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = User


class ItemRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = Item


class CategoryRes(GenericRes):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model_class = Category


api.add_resource(AuthRes, '/auth/')
api.add_resource(UserRes, '/users/', '/users/<int:id>')
api.add_resource(ItemRes, '/items/', '/items/<int:id>')
api.add_resource(CategoryRes, '/categories/', '/categories/<int:id>')
