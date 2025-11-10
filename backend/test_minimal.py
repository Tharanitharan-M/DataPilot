#!/usr/bin/env python3
"""
Quick test to verify the API works in minimal mode (without DATABASE_URL)
This simulates what Vercel sees when DATABASE_URL is not set
"""

import os
import sys

# Simulate Vercel environment without DATABASE_URL
if 'DATABASE_URL' in os.environ:
    print("⚠️  DATABASE_URL is set - unsetting for minimal mode test")
    del os.environ['DATABASE_URL']

print("Testing API in minimal mode (no DATABASE_URL)...\n")

try:
    # Import the app
    from api.index import app
    
    print("✅ SUCCESS! App loaded without crashing")
    print("\nChecking app status:")
    
    # Check what got loaded
    from api.index import SETTINGS_LOADED, ROUTES_LOADED, ROUTE_LOAD_ERROR
    
    print(f"  Settings loaded: {SETTINGS_LOADED}")
    print(f"  Routes loaded: {ROUTES_LOADED}")
    
    if not ROUTES_LOADED:
        print(f"  Route load error: {ROUTE_LOAD_ERROR}")
        print("\n📝 This is EXPECTED when DATABASE_URL is not set")
        print("   The app will show setup instructions at /setup endpoint")
    
    print("\n✅ Minimal mode test PASSED!")
    print("   The app will now work on Vercel even without DATABASE_URL")
    print("   Visit /setup endpoint for configuration instructions")
    
    sys.exit(0)
    
except Exception as e:
    print(f"\n❌ FAILED! App crashed during import:")
    print(f"   {e}")
    import traceback
    traceback.print_exc()
    print("\n   This means the app will crash on Vercel")
    sys.exit(1)

