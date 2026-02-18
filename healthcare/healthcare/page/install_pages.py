import frappe
import os
import json

def install_healthcare_pages():
    """Install all healthcare pages properly in the Frappe system"""
    
    # Get pages directory
    pages_path = os.path.join(frappe.get_app_path("healthcare"), "healthcare", "page")
    
    # Install each page
    for page_name in os.listdir(pages_path):
        # Skip __pycache__ and other non-directory entries
        if not os.path.isdir(os.path.join(pages_path, page_name)):
            continue
            
        json_path = os.path.join(pages_path, page_name, f"{page_name}.json")
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r') as f:
                    page_data = json.load(f)
                
                # Check if page exists
                if frappe.db.exists("Page", page_name):
                    print(f"Page {page_name} already exists, updating...")
                    page = frappe.get_doc("Page", page_name)
                    page.update(page_data)
                    page.save(ignore_permissions=True)
                    print(f"Page {page_name} updated successfully")
                else:
                    print(f"Creating new page: {page_name}")
                    page = frappe.get_doc(page_data)
                    page.insert(ignore_permissions=True)
                    print(f"Page {page_name} created successfully")
                    
                frappe.db.commit()
            except Exception as e:
                print(f"Error installing page {page_name}: {str(e)}")
    
    print("All healthcare pages installed successfully")
    
if __name__ == "__main__":
    install_healthcare_pages()
