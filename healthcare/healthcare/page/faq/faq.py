import frappe

@frappe.whitelist()
def get_all_faqs():
    """Return a hardcoded list of FAQs and categories."""
    faq_data = {
        "categories": ["General", "Receptionist", "Doctor", "Pharmacist", "Lab Manager"],
        "faqs": [
            {
                "question": "How can I update a patient's demographic details?",
                "answer": "To update a patient's details, go to the Patient list, select the patient, and click on the 'Edit' button in their record. You can then change their name, contact information, and other details.",
                "category": "Receptionist"
            },
            {
                "question": "How to check for all the prescriptions?",
                "answer": "You can view all prescriptions by navigating to the 'Prescription' list from the desk. You can also find patient-specific prescriptions in the patient's medical record.",
                "category": "Doctor"
            },
            {
                "question": "How can I make a check-in for an existing patient?",
                "answer": "Search for the patient, open their record, and use the 'Create Appointment' button. During the appointment creation, you can set the status to 'Checked In'.",
                "category": "Receptionist"
            },
            {
                "question": "How can I change the consultant name after check-in?",
                "answer": "Once an appointment is checked in, the consultant can be changed by opening the appointment record and updating the 'Healthcare Practitioner' field.",
                "category": "Receptionist"
            },
            {
                "question": "How can I print the token?",
                "answer": "After creating a patient appointment, you can use the 'Print' button on the appointment screen to print a token slip.",
                "category": "General"
            },
            {
                "question": "How can I change the referred by name after check-in?",
                "answer": "The 'Referred By' field can be edited directly in the Patient Encounter or Patient Appointment document even after check-in.",
                "category": "Doctor"
            },
            {
                "question": "What is the procedure for lab test billing?",
                "answer": "Once a lab test is prescribed, the receptionist can create a Sales Invoice for the patient. The payment can be recorded against this invoice.",
                "category": "Lab Manager"
            },
            {
                "question": "How to manage medicine stock?",
                "answer": "Medicine stock is managed through the Stock module. You can create Material Requests and Purchase Orders to replenish stock, and view stock levels in the Stock Ledger.",
                "category": "Pharmacist"
            },
            {
                "question": "How do I view a patient's medical history?",
                "answer": "Navigate to the patient's record and click on the 'Medical Record' tab to see their complete history, including past diagnoses, treatments, and lab results.",
                "category": "Doctor"
            },
            {
                "question": "What is the process for a new patient registration?",
                "answer": "From the reception dashboard, click 'Add Patient'. Fill in the required details like name, date of birth, and contact information, then save the record.",
                "category": "Receptionist"
            },
            {
                "question": "How are lab test results delivered to patients?",
                "answer": "Once results are verified, they are automatically available in the patient's portal. Patients can also request a printed copy from the lab.",
                "category": "Lab Manager"
            }
        ]
    }
    return faq_data
