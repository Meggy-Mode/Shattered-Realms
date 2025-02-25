import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

db = SQLAlchemy()

def create_app():
    logger.info("Starting application initialization")
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')

    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

    # Configure the database with fallback to SQLite
    database_url = os.environ.get("DATABASE_URL")
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    else:
        # Fallback to SQLite for development
        database_url = f"sqlite:///{os.path.join(app.instance_path, 'game.db')}"
        os.makedirs(app.instance_path, exist_ok=True)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True
    }

    logger.info(f"Database URL configured: {database_url}")
    logger.info("Initializing database...")

    try:
        db.init_app(app)
        logger.info("Database initialization successful")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    from game.routes import main
    app.register_blueprint(main)

    with app.app_context():
        try:
            logger.info("Creating database tables...")
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise

    return app