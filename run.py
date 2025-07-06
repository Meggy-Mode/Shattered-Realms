import os
import webbrowser
import time
import subprocess
import requests
import sys

print("Started")

# Step 1: Change to your game directory
os.chdir('/Users/carolynbowers/Desktop/Shattered-Realms')

# Step 2: Start Flask server in background
process = subprocess.Popen(['python3', 'main.py'])

# Step 3: Wait for Flask server to start
def check_server(port=5000):
    try:
        return requests.get('http://127.0.0.1:5000').status_code == 200
    except requests.exceptions.RequestException:
        return False

start_time = time.time()
timeout = 30
while not check_server() and time.time() - start_time < timeout:
    time.sleep(0.1)

if time.time() - start_time >= timeout:
    print("Server failed to start. Exiting.")
    process.terminate()
    sys.exit(1)

# Step 4: Open in browser
webbrowser.open_new_tab('http://127.0.0.1:5000')

# Step 5: Monitor server status
try:
    while True:
        if not check_server():
            print("Server stopped. Exiting.")
            process.terminate()
            sys.exit(0)
        time.sleep(1)
except KeyboardInterrupt:
    print("Interrupted. Shutting down.")
    process.terminate()
    sys.exit(0)
