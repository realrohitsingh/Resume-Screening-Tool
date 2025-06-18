from flask import jsonify, request
import json
import os
import hashlib
import uuid
from datetime import datetime

# Get the absolute path to the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to the server directory
server_dir = os.path.dirname(current_dir)
# Path to store users data
users_path = os.path.join(server_dir, 'users.json')

# Load or create users file
if os.path.exists(users_path):
    with open(users_path, 'r') as f:
        users = json.load(f)
else:
    users = {}

def hash_password(password):
    """Hash a password for storing."""
    salt = uuid.uuid4().hex
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    salt = stored_password.split(':')[1]
    stored_hash = stored_password.split(':')[0]
    return stored_hash == hashlib.sha256(salt.encode() + provided_password.encode()).hexdigest()

def init_auth_routes(app):
    @app.route('/api/auth/signup', methods=['POST'])
    def signup():
        try:
            data = request.json
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            role = data.get('role', 'individual')
            
            if not all([email, password, name]):
                return jsonify({'error': 'Missing required fields'}), 400
                
            if email in users:
                return jsonify({'error': 'Email already registered'}), 400
                
            # Create user object
            user = {
                'id': str(uuid.uuid4()),
                'email': email,
                'password': hash_password(password),
                'name': name,
                'role': role,
                'created_at': datetime.now().isoformat(),
                'profile_pic': '/src/assets/default-avatar.svg'
            }
            
            # Save user
            users[email] = user
            with open(users_path, 'w') as f:
                json.dump(users, f)
                
            # Return user data without password
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'status': 'success',
                'user': user_data
            })
            
        except Exception as e:
            print(f"Error in signup: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.json
            email = data.get('email')
            password = data.get('password')
            
            if not all([email, password]):
                return jsonify({'error': 'Missing email or password'}), 400
                
            if email not in users:
                return jsonify({'error': 'Invalid email or password'}), 401
                
            user = users[email]
            if not verify_password(user['password'], password):
                return jsonify({'error': 'Invalid email or password'}), 401
                
            # Return user data without password
            user_data = {k: v for k, v in user.items() if k != 'password'}
            return jsonify({
                'status': 'success',
                'user': user_data
            })
            
        except Exception as e:
            print(f"Error in login: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/auth/check', methods=['GET'])
    def check_auth():
        try:
            # This would normally check a session or token
            # For now, we'll just return success
            return jsonify({'status': 'success'})
        except Exception as e:
            print(f"Error checking auth: {e}")
            return jsonify({'error': str(e)}), 500 