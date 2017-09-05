from flask import Blueprint, Response, request, url_for, session, current_app,\
    make_response
from flask_restful import Resource, Api, reqparse, abort
from models import User, File, Item, Category, select, db_session, commit, rollback,\
    Set, SetInstance, ObjectNotFound, DataError, Password, OAuth, TransactionIntegrityError
import json
import re
from security import authorize
from base64 import b64encode, b64decode
import binascii


api_bp = Blueprint('api', __name__)
api = Api(api_bp)


def _to_json_default(obj, exclude=()):
    if isinstance(obj, SetInstance):
        return [i.id for i in obj]
    try:
        return obj.to_dict(exclude)
    except AttributeError:
        return str(obj)


def to_json(obj, exclude=()):
    try:
        obj = obj.to_dict(exclude)
    except AttributeError:
        pass
    return json.dumps(obj, indent=4, sort_keys=True, default=lambda obj: _to_json_default(obj, exclude))


def json_response(obj, exclude=()):
    return Response(bytes(to_json(obj, exclude=exclude), 'utf8'), mimetype='application/json')

def bin_response(bin, mimetype='application/octet-stream'):
    return Response(bin, mimetype=mimetype)


class AuthRes(Resource):
    decorators = [authorize()]

    def get(self):
        return json_response(dict(session.items()))


class GenericRes(Resource):
    decorators = [db_session, authorize()]

    def _relation_handler(self, t, v):
        ret = []

        try:
            v = re.split('\s*,\s*', v)
        except TypeError:
            pass

        for i in v:
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

        obj = cls.from_dict(rvals, self._relation_handler)
        commit()

        return json_response({'id': obj.id})

    def put(self, id):
        cls = self.model_class

        try:
            obj = cls[id]
        except ObjectNotFound as ex:
            abort(404)

        rvals = request.get_json() or request.values.to_dict()  # request data

        obj.update(rvals, self._relation_handler)
        commit()

        return json_response({'id': obj.id})

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

    def getResData(self, id=None):
        cls = self.model_class

        if id is not None:
            ids = re.split('\s*,\s*', id)
            try:
                objs = select(i for i in cls if i.id in ids)[:]
            except (ObjectNotFound, DataError) as ex:
                abort(404)
        else:
            objs = select(i for i in cls)[:]

        return objs

    def get(self, blob=None, id=None):
        cls = self.model_class

        if blob == 'blob' and id is not None:
            objs = self.getResData(id)
            try:
                mimetype = objs[0].type or 'application/octet-stream'
                return bin_response(objs[0].blob, mimetype)
            except IndexError:
                abort(404)
        else:
            objs = self.getResData(id)

        return json_response(objs, exclude=('blob'))

    def getReqData(self):
        cls = self.model_class
        content_type = request.headers['Content-Type']

        if content_type == 'application/json':
            rvals = request.get_json()
            try:
                rvals['blob'] = b64decode(rvals['blob'])
            except (KeyError, binascii.Error):
                abort(400)
        elif content_type.startswith('multipart/form-data'):
            rvals = request.form.to_dict()
            files = request.files.to_dict()
            for n, f in files.items():
                rvals[n] = f.read()
        else:
            abort(400)

        return rvals

    def post(self):
        cls = self.model_class
        rvals = self.getReqData()

        obj = cls.from_dict(rvals, self._relation_handler)
        try:
            commit()
        except TransactionIntegrityError as ex:
            obj = select(i for i in cls if i.hash == obj.hash)[:][0]
            abort(409, id=obj.id)

        return json_response({'id': obj.id})

    def put(self, id):
        cls = self.model_class

        try:
            obj = cls[id]
        except ObjectNotFound as ex:
            abort(404)

        rvals = self.getReqData()

        obj.update(rvals, self._relation_handler)
        commit()

        return json_response({'id': obj.id})


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
api.add_resource(FileRes, '/files/', '/files/<id>', '/files/<blob>/<id>')
api.add_resource(ItemRes, '/items/', '/items/<id>')
api.add_resource(CategoryRes, '/categories/', '/categories/<id>')
