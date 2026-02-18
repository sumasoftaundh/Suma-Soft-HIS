import base64
import os

IMAGE_PATH = "/Users/pritesh.rane/frappe_codebase/sumasoft-bench/sites/frappe-his.sumasoft.com/public/files/Healthcare.jpg"

def generate_css_injector():
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: {IMAGE_PATH} not found.")
        return

    with open(IMAGE_PATH, "rb") as img_file:
        b64_string = base64.b64encode(img_file.read()).decode('utf-8')

    css_content = f"""
/* Premium Logic Styles - Antigravity V2 */
body {{
    background-image: url('data:image/jpeg;base64,{b64_string}') !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
    font-family: 'Inter', sans-serif !important;
}}

/* Glassmorphism Card */
.page-card, .login-content {{
    background: rgba(255, 255, 255, 0.75) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37) !important;
    padding: 40px !important;
    max-width: 450px !important;
    width: 100% !important;
    margin: 0 auto !important;
}}

.btn-login {{
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
    border: none !important;
    color: white !important;
    border-radius: 8px !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}}

.btn-login:hover {{
    transform: translateY(-2px) !important;
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4) !important;
}}

/* Hide default Frappe navbar if distracting */
.navbar {{
    background: transparent !important;
    box-shadow: none !important;
}}
"""
    
    # Escape CSS for shell echo
    # We will write this to a file on the server
    
    script = f"""#!/bin/bash
# 1. Define the CSS Content
CSS_FILE="/home/frappe/frappe-bench/sites/frappe-his.sumasoft.com/public/files/custom_login_embedded.css"
mkdir -p $(dirname "$CSS_FILE")

cat << 'EOF' > "$CSS_FILE"
{css_content}
EOF

echo "✅ CSS File Created at $CSS_FILE"

# 2. Inject CSS INLINE into login.html template
# Found at: /home/frappe/frappe-bench/apps/frappe/frappe/www/login.html
LOGIN_TEMPLATE="/home/frappe/frappe-bench/apps/frappe/frappe/www/login.html"

# Remove old injections if any (both link and style)
sed -i '/custom_login_embedded.css/d' "$LOGIN_TEMPLATE"
sed -i '/Custom Login Styles injected by Antigravity/d' "$LOGIN_TEMPLATE"

# Prepare Inline CSS Content for Sed (Escape newlines and slashes)
# We will use a temporary file to hold the style block and then insert it
STYLE_BLOCK_FILE="/tmp/frappe_login_style.html"
cat << 'EOF_STYLE' > "$STYLE_BLOCK_FILE"
<style>
/* Custom Login Styles injected by Antigravity */
{css_content}
</style>
EOF_STYLE

# Inject the style block
if grep -q "{{% block head_include %}}" "$LOGIN_TEMPLATE"; then
    seed_key="{{% block head_include %}}"
    # Use python to insert the content because sed with multiline variables is painful in bash
    python3 -c "
import sys
with open('$LOGIN_TEMPLATE', 'r') as f: content = f.read()
with open('$STYLE_BLOCK_FILE', 'r') as f: style = f.read()
if style not in content:
    content = content.replace('$seed_key', '$seed_key\\n' + style)
    with open('$LOGIN_TEMPLATE', 'w') as f: f.write(content)
"
else
    # Fallback to </head>
    python3 -c "
import sys
with open('$LOGIN_TEMPLATE', 'r') as f: content = f.read()
with open('$STYLE_BLOCK_FILE', 'r') as f: style = f.read()
if style not in content:
    content = content.replace('</head>', style + '\\n</head>')
    with open('$LOGIN_TEMPLATE', 'w') as f: f.write(content)
"
fi

echo "✅ CSS Injected INLINE into login.html"

# 3. Clean Rebuild
cd /home/frappe/frappe-bench
sudo -u frappe ./env/bin/bench build --force
sudo service supervisor restart
sudo service nginx reload
sudo -u frappe ./env/bin/bench --site frappe-his.sumasoft.com clear-cache

echo "✅ DONE. Refresh your login page!"
"""
    # Write the script to a local file instead of printing
    output_file = "/Users/pritesh.rane/frappe_codebase/install_premium_theme.sh"
    with open(output_file, "w") as f:
        f.write(script)
    
    print(f"✅ Generated installer at: {output_file}")
    # Print a small snippet to confirm content
    print(script[:200] + "\n...[truncated]...\n" + script[-200:])

generate_css_injector()
