import os
import webbrowser
import time
import subprocess
import sys
import http.client
import tkinter as tk
from tkinter import filedialog
import platform
from itertools import islice
print(f"current os: {os.name}")
print("Started")

def kill_processes_on_port(port=5000):
    try:
        # Get list of PIDs using the port
        pids = subprocess.check_output(f"lsof -ti :{port}", shell=True).decode().strip().split('\n')
        
        for pid in pids:
            if pid:  # avoid empty strings
                print(f"Killing process {pid} on port {port}")
                subprocess.run(['kill', '-9', pid])
        print("Done.")
    except subprocess.CalledProcessError:
        print(f"No processes found on port {port}.")

if __name__ == "__main__":
    kill_processes_on_port(5000)

with open('directory.txt', 'r') as file:
    lines = file.readlines()
    if os.name == 'nt':
        path = lines[0].strip() if len(lines) > 0 else ''
        line = lines[2].strip() if len(lines) > 2 else ''
    elif os.name == 'posix':
        path = lines[0].strip() if len(lines) > 0 else ''
        line = lines[1].strip() if len(lines) > 1 else ''

if not path: 
    print("No path selected: go to directory.txt and add path of your Shattered-Realms folder")
    exit()

# Step 1: Change to your game directory
os.chdir(path)

# Step 2: Start Flask server in background
process = subprocess.Popen(['python3', 'main.py'])

# Step 3: Wait for Flask server to start
def check_server(port=5000):
    try:
        conn = http.client.HTTPConnection("127.0.0.1", port, timeout=1)
        conn.request("GET", "/")
        response = conn.getresponse()
        conn.close()
        return response.status == 200
    except Exception:
        return False

start_time = time.time()
timeout = 30
while not check_server() and time.time() - start_time < timeout:
    time.sleep(0.1)

if time.time() - start_time >= timeout:
    print("Server failed to start. Exiting.")
    process.terminate()
    sys.exit(1)

# Step 4: Open in browser (using macOS 'open' command for reliability)
import subprocess
subprocess.run(['open', 'http://127.0.0.1:5000'])

# Step 5: (Optional) Remove monitoring loop if not needed in Automator
# Commenting it out so script ends here
# try:
#     while True:
#         if not check_server():
#             print("Server stopped. Exiting.")
#             process.terminate()
#             sys.exit(0)
#         time.sleep(1)
# except KeyboardInterrupt:
#     print("Interrupted. Shutting down.")
#     process.terminate()
#     sys.exit(0)
