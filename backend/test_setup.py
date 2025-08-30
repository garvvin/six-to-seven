#!/usr/bin/env python3
"""
Simple test script to verify the Flask app setup
"""

try:
    from app import create_app
    print("✓ Flask app imported successfully")
    
    app = create_app()
    print("✓ Flask app created successfully")
    
    with app.app_context():
        print("✓ App context works")
        print("✓ All routes registered:")
        for rule in app.url_map.iter_rules():
            print(f"  - {rule.rule} [{', '.join(rule.methods)}]")
    
    print("\n✓ Setup verification completed successfully!")
    print("You can now run 'python run.py' to start the server")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("Make sure all dependencies are installed: pip install -r requirements.txt")
except Exception as e:
    print(f"✗ Setup error: {e}")
    print("Check your configuration and try again")
