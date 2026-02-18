from __future__ import unicode_literals

def get_sidebar_items():
    """Add FAQ link to the website sidebar"""
    return [
        {
            "label": "FAQ",
            "icon": "fa fa-question-circle",
            "url": "/faq",
            "right": 1
        }
    ]
