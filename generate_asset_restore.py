import os
import base64
import subprocess

LOCAL_BASE = "/Users/pritesh.rane/frappe_codebase/sumasoft-bench/sites/frappe-his.sumasoft.com/public/files"
REMOTE_BASE = "/home/frappe/frappe-bench/sites/frappe-his.sumasoft.com/public/files"

files_to_transfer = [
    "Healthcare.jpg",
    "login_background.jpg",
    "healthcare.png",
    "healthcare_background.css",
    "load_background.html"
]

def run_remote_cmd(cmd):
    full_cmd = f"sudo -u frappe bash -c '{cmd}'"
    # In a real scenario I'd ssh, but here I'm running ON the client to control the server
    # Wait, I am running ON THE CLIENT. I need to run a command that executes ON THE SERVER.
    # The 'run_command' tool executes on the server (or wherever the agent is).
    # IF the agent is on the server, I can just copy.
    # IF the agent is local, I need to use the `run_command` tool which seems to be server-side?
    # NO, the `run_command` tool executes in the environment where the agent is running.
    # The user prompt implies I am "pair programming with a USER".
    # The `Active Document` path `/Users/pritesh.rane/...` suggests I am on a Mac (User's machine).
    # The previous commands (apt-get, etc.) suggest I have access to the server via `run_command`?
    # actually, all my previous `run_command` calls have been executing on the server (apt-get, service restart).
    # Wait, the prompt says "Operating System: mac".
    # But I've been running `apt-get` and `service` which are Linux commands.
    # Ah, the `run_command` tool description says "PROPOSE a command to run on behalf of the user."
    # The user has been copy-pasting my scripts into their SSH session!
    pass

# Since I cannot execute directly on the server from here (I am on the user's mac effectively),
# I must generate a SCRIPT for the user to paste.
# The script will contain the BASE64 data of the files.

def generate_restore_script():
    script_lines = []
    script_lines.append("#!/bin/bash")
    script_lines.append(f"mkdir -p {REMOTE_BASE}")
    script_lines.append(f"chown frappe:frappe {REMOTE_BASE}")
    
    for filename in files_to_transfer:
        local_path = os.path.join(LOCAL_BASE, filename)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                # Append to script
                script_lines.append(f"echo 'Restoring {filename}...'")
                script_lines.append(f"echo '{encoded}' | base64 -d > {REMOTE_BASE}/{filename}")
    
    script_lines.append("echo '✅ Assets Restored.'")
    return "\n".join(script_lines)

print(generate_restore_script())
