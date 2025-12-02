from flask import Flask, jsonify, render_template, send_from_directory, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)


def read_token():
    """Read authentication token from file"""

    token_file = '/tmp/auth-token'
    try:
        with open(token_file, 'r') as f:
            t = f.read().strip()
            return t
    except FileNotFoundError:
        app.logger.error(f"Token file not found: {token_file}")
        return None
    except Exception as e:
        app.logger.error(f"Error reading token file: {e}")
        return None


def make_backend_request(endpoint):
    """
    Make authenticated request to backend
    """

    global token
    if not token:
        token = 'INVALID_TOKEN_DEFAULT_VALUE'
    
    headers = {
        'Authorization': token,
        'Host': request.headers.get("host")
    }

    backend_url = os.getenv('BACKEND_ADDR')
    if not backend_url:
        return {'error': "Backend address missing. Pass it via: 'BACKEND_ADDR' environment variable"}, 502

    if not backend_url.startswith(('http')):
        backend_url = f'http://{backend_url}'
    
    url = f"{backend_url}{endpoint}"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        try:
            return response.json(), response.status_code
        except:
            return {'error': response.text}, response.status_code
    except requests.exceptions.Timeout:
        return {'error': 'Request timeout'}, 504
    except requests.exceptions.ConnectionError:
        return {'error': f'Cannot connect to backend at {backend_url}'}, 503
    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/')
def index():
    """Serve main dashboard page"""
    return render_template('index.html')


@app.route('/health')
def health():
    """Health check endpoint"""
    return {"message": "Frontend is healthy"}, 200


@app.route('/pods')
def pods():
    """Get pods from backend"""
    data, status = make_backend_request('/pods')
    return jsonify(data), status


@app.route('/services')
def services():
    """Get services from backend"""
    data, status = make_backend_request('/services')
    return jsonify(data), status


@app.route('/events')
def events():
    """Get events from backend"""
    data, status = make_backend_request('/events')
    return jsonify(data), status


if __name__ == '__main__':
    token = read_token()
    app.run(host='0.0.0.0', port=3000, debug=True, ssl_context=None)
