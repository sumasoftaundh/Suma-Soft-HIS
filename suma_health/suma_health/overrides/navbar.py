from __future__ import unicode_literals
import frappe

def get_navbar_settings():
    """Override the default navbar settings to include our custom FAQ link"""
    # Get the default navbar settings
    settings = frappe.get_hooks("navbar_settings")[0]()
    
    # Add FAQ link to the navbar
    if 'help_dropdown' not in settings:
        settings['help_dropdown'] = []
    
    # Add FAQ link if it doesn't exist
    faq_exists = any(item.get('label') == 'FAQ' for item in settings['help_dropdown'])
    if not faq_exists:
        settings['help_dropdown'].append({
            'label': 'FAQ',
            'url': '/faq',
            'icon': 'question-circle'
        })
    
    return settings
