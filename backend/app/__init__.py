from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-here')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Set to False for development
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:5173", "http://localhost:5175", "http://localhost:3000"], 
         supports_credentials=True, 
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"])
    JWTManager(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.upload import upload_bp
    from app.routes.health_insights import health_insights_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(health_insights_bp, url_prefix='/api/health-insights')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Flask server is running'}
    
    return app
