import frappe

def create_pharmacy_dashboard():
    """Create Pharmacy Dashboard page if it doesn't exist"""
    if not frappe.db.exists('Page', 'pharmacy-dashboard'):
        print("Creating pharmacy-dashboard page...")
        page = frappe.get_doc({
            'doctype': 'Page',
            'name': 'pharmacy-dashboard',
            'page_name': 'pharmacy-dashboard',
            'module': 'Healthcare',
            'standard': 'Yes',
            'roles': [
                {'role': 'Pharmacist'}
            ]
        })
        page.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Pharmacy dashboard page created successfully!")
    else:
        print("Pharmacy dashboard page already exists")

if __name__ == "__main__":
    create_pharmacy_dashboard()
