
import os
import zipfile

def zip_files(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Add file to zip with relative path inside 'public/files'
            arcname = os.path.relpath(file_path, os.path.join(path, "..")) 
            ziph.write(file_path, arcname)

# Create zip of essential public files
with zipfile.ZipFile('files_fix.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    base_path = 'sites/frappe-his.sumasoft.com/public/files'
    if os.path.exists(base_path):
        zip_files(base_path, zipf)
        print(f"Created files_fix.zip from {base_path}")
    else:
        print(f"Path not found: {base_path}")
