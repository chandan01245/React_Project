import paramiko
from dotenv import load_dotenv
import os

load_dotenv()

hostname = os.getenv("LDAP_SERVER_IP")
port = int(os.getenv("LDAP_SERVER_PORT"))
username = os.getenv("LDAP_USERNAME")
password = os.getenv("LDAP_PASSWORD")
remote_path = os.getenv("LDAP_PATH").replace("<DUMMY_USERNAME>",username)
new_content = "This is new data to append.\n"

print(hostname,port,username,password,remote_path)
print(type(hostname),type(port),type(username),type(password),type(remote_path))

# Step 1: Connect
transport = paramiko.Transport((hostname, port))
print("Connected")
transport.connect(username=username, password=password)
sftp = paramiko.SFTPClient.from_transport(transport)

# Step 2: Read existing file content
try:
    with sftp.file(remote_path, 'r') as remote_file:
        existing_content = remote_file.read().decode()
except IOError:
    existing_content = ''  # If file doesn't exist, treat as empty

print("Existing content:-\n",existing_content)

# Step 3: Append new content
combined_content = existing_content + new_content

# Step 4: Write it all back (overwrite mode)
with sftp.file(remote_path, 'w') as remote_file:
    remote_file.write(combined_content)

print("New content:-\n",combined_content)

# Cleanup
sftp.close()
transport.close()
