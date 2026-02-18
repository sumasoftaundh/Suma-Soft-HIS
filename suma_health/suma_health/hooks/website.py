from __future__ import unicode_literals

def get_hooks():
    return {
        "app_include_js": [
            "healthcare.bundle.js",
            "/assets/suma_health/js/remove_icons.js",
            "/assets/suma_health/js/frappe_icons_remover.js",
            "/assets/suma_health/js/direct_icon_remover.js"
        ],
        "app_include_css": [
            "/assets/suma_health/css/custom_theme.css",
            "/assets/suma_health/css/navbar.css",
            "/assets/suma_health/css/remove_icons.css",
            "/assets/suma_health/css/header_fix.css"
        ],
        "website_context": {
            "favicon": "/assets/suma_health/images/healthcare-favicon.png",
            "splash_image": "/files/login_background.jpg"
        },
        # Override the default navbar login template
        "override_whitelisted_methods": {
            "frappe.www.navbar.get_navbar_settings": "healthcare.overrides.navbar.get_navbar_settings"
        }
    }
