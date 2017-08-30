from pony.orm import *
from pony.orm.core import SetInstance, ObjectNotFound, DataError
from pony.orm.serialization import to_json, to_dict
import json
from datetime import *
import re
from passlib.hash import pbkdf2_sha256 as pw_hasher
from hashlib import md5
from base64 import urlsafe_b64encode as b64encode


db = Database()


class Mixin(object):
    def update(self, d, relation_handler=None):
        for attr in self.__class__._attrs_:
            key = attr.name
            val = d.get(key, None)
            if val is not None:
                if val is '':
                    setattr(self, key, '')
                elif attr.is_relation:
                    if relation_handler:
                        setattr(self, key, relation_handler(attr.py_type, val))
                else:
                    setattr(self, key, attr.py_type(val))
        return self

    @classmethod
    def from_dict(cls, d, relation_handler=None):
        kwargs = {}
        for attr in cls._attrs_:
            key = attr.name
            val = d.get(key, None)
            if val is not None:
                if attr.is_relation:
                    if relation_handler:
                        kwargs[key] = relation_handler(attr.py_type, val)
                else:
                    kwargs[key] = attr.py_type(val)
            elif not (isinstance(attr, Required)):
                kwargs[key] = None if attr.nullable else ''
        return cls(**kwargs)

    # def to_dict(self):
    #     return {key: attr.__get__(self) for key, attr in self._adict_.items()}
    #     # ret = {}
    #     # for key, attr in self._adict_.items():
    #     #     try:
    #     #         attr = attr.to_dict()
    #     #     except AttributeError:
    #     #         attr = attr.__get__(self)
    #     #         if attr isinstance(SetInstance):
    #     #             attr = (i.to_dict() for i in attr)
    #     #     ret[key] = attr
    #     # return ret

    def to_dict(self, exclude=()):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()
                if key not in exclude}

    def to_json(self):
        return json.dumps(self.to_dict(), indent=4, sort_keys=True, default=str)


class Base(db.Entity):
    created = Optional(datetime)
    updated = Optional(datetime)

    def before_insert(self):
        now = datetime.now()
        self.created = now
        self.updated = now

    def before_update(self):
        self.updated = datetime.now()


class Password(Optional):
    def __init__(self, *args, **kwargs):
        super().__init__(str, *args, **kwargs)

    # def __set__(attr, obj, new_val, undo_funcs=None):
    #     super().__set__(attr, obj, new_val, undo_funcs)

    def validate(self, val, obj=None, entity=None, from_db=False):
        val = super().validate(val, obj, entity, from_db)
        if not(val == '' or pw_hasher.identify(val)):
            val = pw_hasher.hash(val)
        return val

    @classmethod
    def hash(cls, password):
        return pw_hasher.hash(password)

    @classmethod
    def verify(cls, password, hash):
        return pw_hasher.verify(password, hash)


class User(Mixin, db.Entity):
    name = Optional(str)
    email = Optional(str, unique=True, index=True, nullable=True)
    username = Optional(str, unique=True, index=True, nullable=True)
    password = Password()
    fbid = Optional(str, unique=True, index=True, nullable=True)
    ggid = Optional(str, unique=True, index=True, nullable=True)
    oauth = Set('OAuth', reverse='user')

    def before_insert(self):
        if not ((self.email and self.password) or self.oauth):
            raise Exception('Must provide email and password, or oauth.')

    def before_update(self):
        if not ((self.email and self.password) or self.oauth):
            raise Exception('Must provide email and password, or oauth.')

    def to_dict(self, exclude=()):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()
                if key not in exclude}
        # return {attr.name: val for attr, val in self._vals_.items()}

    def to_json(self):
        return json.dumps(self.to_dict())


class OAuth(Mixin, db.Entity):
    provider = Required(str, index=True)
    puid = Required(str, unique=True, index=True, nullable=True)
    access_token = Optional(str)
    refresh_token = Optional(str)
    user = Required(User)


# class FileAlias(Mixin, db.Entity):
#     name = Required(str, index=True)
#     files = Set(File)


class File(Mixin, db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    name = Required(str, index=True)
    blob = Optional(bytes)
    hash = Optional(str, unique=True, nullable=True, index=True)
    mimetype = Optional(str, nullable=True)

    def hasher(self):
        if len(self.blob) > 0:
            self.hash = b64encode(md5(self.blob).digest()).decode('utf-8')
        else:
            self.hash = None

    def before_insert(self):
        self.hasher()

    def before_update(self):
        self.hasher()


class Category(Mixin, db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    title = Required(str)
    description = Optional(str, nullable=True)
    items = Set('Item', reverse='categories')


class Item(Mixin, db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    image = Optional(int, nullable=True)
    title = Required(str)
    description = Optional(str, nullable=True)
    categories = Set('Category', reverse='items', nullable=True)
