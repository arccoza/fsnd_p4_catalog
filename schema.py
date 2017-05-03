from marshmallow import Schema, fields, pprint


class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str()
    description = fields.Str()
    items = fields.Nested(lambda: ItemSchema())


class ItemSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str()
    description = fields.Str()
    categories = fields.Nested(CategorySchema())
