# This file makes the utils directory a Python package

# Import invoice utility functions for hooks access
from healthcare.healthcare.utils.invoice_utils import (
    manage_invoice_submit_cancel,
    set_invoiced,
    validate_invoiced_on_submit,
    manage_doc_for_appointment,
    manage_prescriptions,
    create_sample_collection_and_observation,
    create_multiple,
    create_lab_tests_from_invoice
)

# Define the manage_invoice_validate function directly here to avoid circular imports
def manage_invoice_validate(doc, method):
    if doc.service_unit and len(doc.items):
        for item in doc.items:
            if not item.service_unit:
                item.service_unit = doc.service_unit

def get_appointment_billing_item_and_rate(appointment, company=None):
    """Placeholder function for appointment billing item and rate"""
    # TODO: Implement actual logic
    return {"service_item": None, "practitioner_charge": 0}

def get_medical_codes(template_dt, template_dn, code_standard=None):
    """Placeholder function for getting medical codes
    
    Args:
        template_dt: Template doctype
        template_dn: Template docname
        code_standard: Code standard filter (optional)
    
    Returns:
        List of codification entries
    """
    # TODO: Implement actual logic
    return []



# Import necessary modules to avoid circular imports
import sys
import frappe

# Get reference to the parent utils module
_utils = sys.modules.get('healthcare.healthcare.utils')

# Safe dynamic import of common functions
def get_healthcare_services_to_invoice(*args, **kwargs):
    return _utils.get_healthcare_services_to_invoice(*args, **kwargs) if _utils else None

def validate_nursing_tasks(*args, **kwargs):
    """Validate that all mandatory nursing tasks are completed before submission"""
    # Direct implementation without recursive calls
    if frappe.db.get_single_value("Healthcare Settings", "validate_nursing_checklists"):
        filters = {
            "reference_name": kwargs.get('document').name if kwargs.get('document') else None,
            "mandatory": 1,
            "status": ["not in", ["Completed", "Cancelled"]],
        }
        tasks = frappe.get_all("Nursing Task", filters=filters)
        if tasks:
            from frappe import _
            from frappe.utils.data import get_link_to_form
            frappe.throw(
                _("Please complete linked Nursing Tasks before submission: {}").format(
                    ", ".join(get_link_to_form("Nursing Task", task.name) for task in tasks)
                )
            )
@frappe.whitelist()
def get_drugs_to_invoice(encounter, customer, link_customer=False):
    """Get drug prescription to generate invoice
    
    Args:
        encounter: Patient Encounter docname
        customer: Customer to be linked
        link_customer: If customer should be linked to patient
        
    Returns:
        List of medication requests with prescription details
    """
    encounter = frappe.get_doc("Patient Encounter", encounter)
    if link_customer:
        frappe.db.set_value("Patient", encounter.patient, "customer", customer)
    if encounter:
        patient = frappe.get_doc("Patient", encounter.patient)
        if patient:
            orders_to_invoice = []
            medication_requests = frappe.get_list(
                "Medication Request",
                fields=["*"],
                filters={
                    "patient": patient.name,
                    "order_group": encounter.name,
                    "billing_status": ["in", ["Pending", "Partly Invoiced"]],
                    "docstatus": 1
                }
            )
            for med_req in medication_requests:
                medication_request = frappe.get_doc("Medication Request", med_req.name)
                if medication_request:
                    description = ""
                    if hasattr(medication_request, 'dosage') and hasattr(medication_request, 'period'):
                        if medication_request.dosage and medication_request.period:
                            description = f"{medication_request.dosage} for {medication_request.period}"
                    
                    if hasattr(medication_request, 'medication_item'):
                        drug_code = medication_request.medication_item
                    else:
                        drug_code = ""
                        
                    qty = getattr(medication_request, 'quantity', 1)
                    
                    # Only add if we have a drug code
                    if drug_code:
                        orders_to_invoice.append({
                            "reference_type": "Medication Request",
                            "reference_name": medication_request.name,
                            "drug_code": drug_code,
                            "quantity": qty,
                            "description": description
                        })
            return orders_to_invoice
    return
