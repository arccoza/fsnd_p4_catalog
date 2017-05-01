from flask import Blueprint, Response
from flask_restful import Resource, Api, reqparse
from models import User, Item, Category, select, db_session


api_bp = Blueprint('api', __name__)
api = Api(api_bp)


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
        # return Response((bytes(u.to_json(), 'utf8') for u in users), mimetype='application/json')

    def post(self):
        kwargs = self.input.parse_args()
        user = None

        with db_session:
            user = User(**kwargs)

        return user.to_dict(), 201


api.add_resource(UserRes, '/users/', '/users/<int:id>')
