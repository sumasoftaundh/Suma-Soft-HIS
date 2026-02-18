import frappe

def install_appointment_page():
    """Install the appointment page and workspace properly"""
    
    # Check if Page exists, create if not
    if not frappe.db.exists("Page", "appointment"):
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
        
        page.save(ignore_permissions=True)
        frappe.db.commit()
        print("Appointment Page created successfully")
    else:
        print("Appointment Page already exists")
    
    # Check if Workspace exists, create if not
    if not frappe.db.exists("Workspace", "Appointment"):
        # Import workspace from JSON file
        workspace_path = frappe.get_app_path("healthcare", "healthcare", "workspace", "appointment", "appointment.json")
        try:
            with open(workspace_path, 'r') as f:
                workspace_data = frappe.parse_json(f.read())
                
            workspace = frappe.new_doc("Workspace")
            workspace.update(workspace_data)
            workspace.save(ignore_permissions=True)
            frappe.db.commit()
            print("Appointment Workspace created successfully")
        except Exception as e:
            print(f"Error creating workspace: {str(e)}")
    else:
        print("Appointment Workspace already exists")

def execute():
    install_appointment_page()
    
if __name__ == "__main__":
    execute()
