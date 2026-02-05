#!/usr/bin/env python3

import os
import json
import sys

# Add bench paths to sys.path
sys.path.insert(0, '/home/devuser/sumasoft-bench/apps/frappe')

# Import frappe after path setup
import frappe

def fix_appointment_page():
    """Fix the appointment page in the Frappe system"""
    
    # Initialize frappe
    site = frappe.init(site='all')
    frappe.connect()
    
    try:
        print("Checking if appointment page exists...")
        if frappe.db.exists("Page", "appointment"):
            print("Appointment page exists, updating...")
            page = frappe.get_doc("Page", "appointment")
            
            # Update page properties
            page.title = "Appointments"
            page.module = "Healthcare"
            page.standard = "Yes"
            
            # Clear existing roles and add new ones
            page.roles = []
            page.append("roles", {"role": "Healthcare Administrator"})
            page.append("roles", {"role": "Doctor"})
            page.append("roles", {"role": "Receptionist"})
            
            # Save the page
            page.save(ignore_permissions=True)
            frappe.db.commit()
            print("Appointment page updated successfully")
        else:
            print("Appointment page doesn't exist, creating...")
            
            # Create new page
            page = frappe.new_doc("Page")
            page.page_name = "appointment"
            page.name = "appointment"
            page.title = "Appointments"
            page.module = "Healthcare"
            page.standard = "Yes"
            
            # Add roles
            page.append("roles", {"role": "Healthcare Administrator"})
            page.append("roles", {"role": "Doctor"})
            page.append("roles", {"role": "Receptionist"})
            
            # Insert the page
            page.insert(ignore_permissions=True)
            frappe.db.commit()
            print("Appointment page created successfully")
        
        print("Done fixing appointment page!")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        frappe.destroy()

if __name__ == "__main__":
    fix_appointment_page()
