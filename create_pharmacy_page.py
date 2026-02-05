import frappe

def create_pharmacy_page():
    if not frappe.db.exists('Page', 'pharmacy-dashboard'):
        print("Creating pharmacy-dashboard page...")
        page = frappe.get_doc({
            'doctype': 'Page',
            'name': 'pharmacy-dashboard',
            'page_name': 'pharmacy-dashboard',
            'module': 'Healthcare',
            'standard': 'Yes',
            'content': '''<div class="pharmacy-dashboard">
    <div class="page-header">
        <h1>Pharmacy Dashboard</h1>
    </div>
    <div class="page-content">
        <!-- Your dashboard content will be loaded here -->
    </div>
</div>''',
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
    create_pharmacy_page()
