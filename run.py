import os
import webbrowser
import time
import subprocess
import socket
import requests
import sys
print("Started")
# Change the directory
os.chdir('/Users/carolynbowers/Desktop/Shattered-Realms')

# Run the python script using subprocess.Popen(), which runs the process in the background
process = subprocess.Popen(['python3', 'main.py'])

# Check if the server is listening on port 5000
def check_server(port=5000):
    try:
        # Try sending a request to the Flask server
        response = requests.get('http://127.0.0.1:5000')
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

# Wait until the server is up
start_time = time.time()
timeout = 30  # Timeout after 30 seconds if the server doesn't start
while not check_server() and time.time() - start_time < timeout:
    time.sleep(0.1)

# If the server hasn't started within the timeout, cancel the execution
if time.time() - start_time >= timeout:
    print("Server failed to start within the timeout. Terminating Automator execution.")
    process.terminate()  # This will stop the Flask server
    sys.exit(1)  # Exit with an error code

# Open the URL in a new browser tab
webbrowser.open_new_tab('http://192.168.1.27:5000')

# Monitor the server by checking if it is still responsive (not closed)
while True:
    if not check_server():  # If the server is no longer responding (page is closed)
        print("The server is no longer running. Terminating the background process.")
        process.terminate()  # Stop the Flask server
        sys.exit(0)  # Exit cleanly
    time.sleep(1)  # Check every second if the server is still running
