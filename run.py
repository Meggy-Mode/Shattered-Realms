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

try:
    with open('directory.txt', 'r') as file:
        lines = file.readlines()
        if os.name == 'nt':
            path = lines[0].strip() if len(lines) > 0 else ''
            line = lines[2].strip() if len(lines) > 2 else ''
        elif os.name == 'posix':
            path = lines[0].strip() if len(lines) > 0 else ''
            line = lines[1].strip() if len(lines) > 1 else ''

    os.chdir(path)
except:
    print("Please ether add a file path in directory.txt, or the file is nonexistent")
    print("If this error keeps persisting please report an error at the GitHub repository")
    exit()

if not path: 
    exit()


process = subprocess.Popen(['python3', 'main.py'])

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

import subprocess
subprocess.run(['open', 'http://127.0.0.1:5000'])
