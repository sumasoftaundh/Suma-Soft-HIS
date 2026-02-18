from __future__ import unicode_literals
import frappe
from frappe.desk.doctype.desktop_icon import desktop_icon

def get_custom_routes():
    """Custom routes for healthcare app"""
    return {
        "appointment": "healthcare.healthcare.page.appointment.appointment"
    }
