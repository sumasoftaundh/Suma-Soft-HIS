import frappe

def rebuild_doctor_dashboard():
    """
    Script to ensure doctor_dashboard page is properly installed in the site
    """
    # Check if page exists and delete if needed
    if frappe.db.exists("Page", "doctor_dashboard"):
        frappe.delete_doc("Page", "doctor_dashboard")
        print("Existing doctor_dashboard page deleted")
    
    # Create a new doctor_dashboard page
    page = frappe.new_doc("Page")
    page.page_name = "doctor_dashboard"
    page.title = "Doctor Dashboard"
    page.module = "Healthcare"
    
    # Add Doctor role to page
    page.append("roles", {"role": "Doctor"})
    
    # Save the page
    page.insert()
    frappe.db.commit()
    print("doctor_dashboard page created successfully")

if __name__ == "__main__":
    rebuild_doctor_dashboard()
