from flask import Blueprint, Response, request, url_for, session, current_app
from flask_restful import Resource, Api, reqparse, abort
from models import User, Item, Category, select, db_session, commit, rollback,\
    Set, SetInstance, ObjectNotFound, Password
import json
import re
from functools import wraps
import base64
import random
import string
from datetime import datetime
import requests


api_bp = Blueprint('api', __name__)
api = Api(api_bp)
client_secrets = json.load(open('client_secrets.json'))


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
            kind = None
            # Grab the session cookie if it exists.
            cookie = request.cookies.get(current_app.session_cookie_name, None)

            # Try get the Auth header data.
            try:
                auth = request.headers['Authorization']
                kind, _, value = auth.partition(' ')
                if kind == 'Basic':
                    value = base64.standard_b64decode(bytes(value, 'utf8'))
                    id, _, pw = str(value, 'utf8').partition(':')
                elif kind == 'Google' or kind == 'Facebook':
                    xtra = request.headers['X-Requested-With']
                # elif kind == 'Token':
            except (KeyError, base64.binascii.Error) as ex:
                # print(type(ex))
                return fn(*args, **kwargs)

            # If there was an Auth header, autheticate with that info,
            # and create a session.
            if kind == 'Basic':
                with db_session:
                    user = select(u for u in User
                                  if u.email == id or u.username == id)[:]
                if len(user) == 1 and Password.verify(pw, user[0].password):
                    pop = string.ascii_uppercase + string.digits
                    session['userid'] = user[0].id
                    session['state'] = ''.join(random.choice(pop) for _ in range(32))
                    session['timestamp'] = datetime.now().timestamp()
                else:
                    session.clear()
            elif kind in ('Google', 'Facebook') and xtra == 'Fetch':
                session.clear()
                kind = kind.lower()
                sec = client_secrets[kind]['web']
                sec['provider'] = kind
                sec['token'] = value
                value = upgradeToken(**sec)
                print(value)
            elif kind is not None:  # An unknown kind or kind 'None'
                session.clear()

            return fn(*args, **kwargs)
        return wrap
    return deco


def upgradeToken(**kwargs):
    '''
    Required args:
        provider
        token
        client_id
        client_secret
    '''
    provider = kwargs.pop('provider').lower()
    token = kwargs.pop('token')
    if provider == 'google':
        url = 'https://accounts.google.com/o/oauth2/token'
        kwargs['code'] = token
        kwargs['redirect_uri'] = 'postmessage'
        kwargs['grant_type'] = 'authorization_code'
        r = requests.Request(method='POST', url=url, data=kwargs)
    elif provider == 'facebook':
        kwargs['fb_exchange_token'] = token
        url = 'https://graph.facebook.com/oauth/access_token'
        kwargs['grant_type'] = 'fb_exchange_token'
        r = requests.Request(method='GET', url=url, params=kwargs)
    else:
        raise Exception('Unknown provider.')

    # print(r.url, r.status_code)
    r = r.prepare()
    with requests.Session() as s:
        r = s.send(r)
    try:
        r.raise_for_status()
    except requests.HTTPError as ex:
        ex.text = ex.response.text
        ex.json = ex.response.json()
        ex.status_code = ex.response.status_code
        raise
    return r.json()


class AuthRes(Resource):
    decorators = [basic_auth()]

    def get(self):
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
