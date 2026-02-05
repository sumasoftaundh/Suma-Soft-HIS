import frappe

def check_page():
    # Check if the page exists in the database
    page_name = "doctor-dashboard"
    
    # Method 1: Using frappe.db.exists
    exists = frappe.db.exists('Page', page_name)
    print(f"Page {page_name} exists in database:", "Yes" if exists else "No")
    
    # Method 2: Try to get the page
    try:
        page = frappe.get_doc('Page', page_name)
        print("Page details:", page.as_dict())
    except frappe.DoesNotExistError:
        print(f"Page {page_name} does not exist in the database")
    except Exception as e:
        print(f"Error checking page: {str(e)}")

if __name__ == "__main__":
    frappe.init(site="healthcare.host")
    frappe.connect()
    check_page()
    frappe.destroy()
