from pony.orm import *
from pony.orm.core import SetInstance, ObjectNotFound
from pony.orm.serialization import to_json, to_dict
import json
from datetime import *


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

    def to_dict(self):
        return {key: attr.__get__(self) for key, attr in self._adict_.items()}
