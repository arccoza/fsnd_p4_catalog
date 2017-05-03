from pony.orm import *
from pony.orm.core import SetInstance, ObjectNotFound
from pony.orm.serialization import to_json, to_dict
import json
from datetime import *
import re


db = Database()


class Mixin(object):
    @classmethod
    def from_dict(cls, d, relation_handler=None):
        # print(dir(cls._attrs_[4]))
        kwargs = {}
        for attr in cls._attrs_:
            key = attr.name
            val = d.get(key, None)
            if val is not None:
                # if hasattr(attr, 'entity'):
                #     print(attr.is_relation)
                # if isinstance(attr, Set) and relation_handler:
                    # kwargs[key] = re.split('\s*,\s*', val)
                    # print(attr.entity)
                # print(attr.py_type)
                if attr.is_relation:
                    if relation_handler:
                        kwargs[key] = relation_handler(attr.py_type, val)
                else:
                    kwargs[key] = attr.py_type(val)
        return cls(**kwargs)

    def to_dict(self):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()}
        # ret = {}
        # for key, attr in self._adict_.items():
        #     try:
        #         attr = attr.to_dict()
        #     except AttributeError:
        #         attr = attr.__get__(self)
        #         if attr isinstance(SetInstance):
        #             attr = (i.to_dict() for i in attr)
        #     ret[key] = attr
        # return ret

    def to_json(self):
        return json.dumps(self.to_dict(), indent=4, sort_keys=True, default=str)


class Base(db.Entity):
    created = Optional(datetime)
    updated = Optional(datetime)

    def before_insert(self):
        self.created = datetime.now()

    def before_update(self):
        self.updated = datetime.now()


class User(db.Entity):
    username = Required(str)

    def to_dict(self):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()}
        # return {attr.name: val for attr, val in self._vals_.items()}

    def to_json(self):
        return json.dumps(self.to_dict())


class Category(Mixin, db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    title = Required(str)
    description = Optional(str, nullable=True)
    items = Set('Item', reverse='categories')


class Item(Mixin, db.Entity):
    created = Required(datetime, sql_default='CURRENT_TIMESTAMP')
    title = Required(str)
    description = Optional(str, nullable=True)
    categories = Set('Category', reverse='items', nullable=True)
