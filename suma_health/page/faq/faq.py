import frappe

@frappe.whitelist()
def get_all_faqs():
    # This is a temporary solution.
    # Ideally, this data should come from a custom DocType to be managed from the desk.
    
    faqs = [
        {
            "question": "What is the appointment scheduling process?",
            "answer": "You can schedule an appointment through the patient portal, by calling our reception, or directly at the clinic. You will receive a confirmation message once the appointment is booked.",
            "category": "Appointments"
        },
        {
            "question": "How can I access my medical records?",
            "answer": "Your medical records are available through the secure patient portal. You can log in to view your history, test results, and prescriptions.",
            "category": "Patient Portal"
        },
        {
            "question": "What are the clinic's opening hours?",
            "answer": "The clinic is open from 9:00 AM to 6:00 PM, Monday to Saturday. We are closed on Sundays and public holidays.",
            "category": "General"
        },
        {
            "question": "How do I pay my bills?",
            "answer": "Bills can be paid online through the patient portal, or at the reception desk using cash, credit/debit card, or other digital payment methods.",
            "category": "Billing"
        }
    ]
    
    categories = ["All", "Appointments", "Patient Portal", "General", "Billing"]
    
    return {
        "faqs": faqs,
        "categories": categories
    }
