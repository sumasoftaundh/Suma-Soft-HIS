
import frappe
try:
    if frappe.db.exists('Medication Request', 'HMR-00087'):
        doc = frappe.get_doc('Medication Request', 'HMR-00087')
        if doc.docstatus == 1:
            doc.cancel()
            print("Cancelled Medication Request")
        frappe.delete_doc('Medication Request', 'HMR-00087')
        print("Deleted Medication Request")
    
    if frappe.db.exists('Patient', 'test test'):
        frappe.delete_doc('Patient', 'test test')
        print("Deleted Patient test test")
    else:
        print("Patient test test not found")
        
    frappe.db.commit()
except Exception as e:
    print(f"Error: {e}")
    frappe.db.rollback()
