from __future__ import unicode_literals

def get_hooks():
    return {
        "app_include_js": [
            "healthcare.bundle.js",
            "/assets/healthcare/js/remove_icons.js",
            "/assets/healthcare/js/frappe_icons_remover.js",
            "/assets/healthcare/js/direct_icon_remover.js"
        ],
        "app_include_css": [
            "/assets/healthcare/css/custom_theme.css",
            "/assets/healthcare/css/navbar.css",
            "/assets/healthcare/css/remove_icons.css",
            "/assets/healthcare/css/header_fix.css"
        ],
        "website_context": {
            "favicon": "/assets/healthcare/images/healthcare-favicon.png",
            "splash_image": "/files/login_background.jpg"
        },
        # Override the default navbar login template
        "override_whitelisted_methods": {
            "frappe.www.navbar.get_navbar_settings": "healthcare.overrides.navbar.get_navbar_settings"
        }
    }
