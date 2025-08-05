from flask import Blueprint, jsonify, request
import random
import string

test_bp = Blueprint('generate', __name__)

def test_api() -> str:
    """You are great"""
    timestamp = ''.join(random.choices(string.digits, k=4))
    word = ''.join(random.choices(string.ascii_uppercase, k=8))
    return f"TEST-{timestamp}-{word}"


@test_bp.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'message': test_api()}), 200