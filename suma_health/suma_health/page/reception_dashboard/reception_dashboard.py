import frappe
from frappe.utils import nowdate, get_time, get_datetime, time_diff_in_hours
from datetime import datetime, timedelta

@frappe.whitelist()
def get_appointments(practitioner=None, department=None, status=None):
    today = nowdate()
    filters = {"appointment_date": today}
    if practitioner:
        filters["practitioner"] = practitioner
    if department:
        filters["department"] = department
    if status and status != "All":
        filters["status"] = status

    appointments = frappe.get_list("Patient Appointment",
        filters=filters,
        fields=["name", "patient", "patient_name", "practitioner", "practitioner_name", "department", "appointment_time", "status", "duration", "appointment_date"],
        order_by="appointment_time")
    return appointments

@frappe.whitelist()
def check_in_patient(appointment_id):
    try:
        appointment = frappe.get_doc("Patient Appointment", appointment_id)
        appointment.status = "Checked In"
        appointment.save(ignore_permissions=True)
        return {"status": "success", "message": f"Appointment {appointment_id} checked in."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Check-in Failed")
        return {"status": "error", "message": str(e)}

def calculate_percentage_change(current, previous):
    """Calculate percentage change between two values"""
    if previous is None or previous == 0:
        return "+100%" if current > 0 else "--"
    if current is None:
        current = 0
    
    change = ((current - previous) / previous) * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.1f}%"

@frappe.whitelist()
def get_stats():
    today = nowdate()
    yesterday = frappe.utils.add_days(today, -1)

    # Totals - Ensure we count all existing records with proper error handling
    try:
        # Use SQL COUNT for more reliable results
        total_patients = frappe.db.sql("""SELECT COUNT(*) FROM `tabPatient`""")[0][0] or 0
        total_doctors = frappe.db.sql("""SELECT COUNT(*) FROM `tabHealthcare Practitioner`""")[0][0] or 0
    except Exception as e:
        frappe.log_error(f"Error counting totals: {str(e)}")
        total_patients = 0
        total_doctors = 0
    
    # Yesterday's Totals for comparison
    try:
        yesterday_total_patients = frappe.db.sql("""SELECT COUNT(*) FROM `tabPatient` WHERE creation < %s""", today)[0][0] or 0
        yesterday_total_doctors = frappe.db.sql("""SELECT COUNT(*) FROM `tabHealthcare Practitioner` WHERE creation < %s""", today)[0][0] or 0
    except Exception as e:
        frappe.log_error(f"Error counting yesterday totals: {str(e)}")
        yesterday_total_patients = 0
        yesterday_total_doctors = 0

    # Today's Stats
    try:
        total_appointments = frappe.db.count("Patient Appointment", {"appointment_date": today}) or 0
        checked_in = frappe.db.count("Patient Appointment", {"appointment_date": today, "status": "Checked In"}) or 0
        missed_cancelled = frappe.db.count("Patient Appointment", {"appointment_date": today, "status": ["in", ["Cancelled", "Missed"]]}) or 0
        completed = frappe.db.count("Patient Appointment", {"appointment_date": today, "status": "Completed"}) or 0
    except Exception as e:
        frappe.log_error(f"Error counting today's appointments: {str(e)}")
        total_appointments = checked_in = missed_cancelled = completed = 0

    # Yesterday's Stats
    try:
        yesterday_appointments = frappe.db.count("Patient Appointment", {"appointment_date": yesterday}) or 0
        yesterday_checked_in = frappe.db.count("Patient Appointment", {"appointment_date": yesterday, "status": "Checked In"}) or 0
        yesterday_missed_cancelled = frappe.db.count("Patient Appointment", {"appointment_date": yesterday, "status": ["in", ["Cancelled", "Missed"]]}) or 0
    except Exception as e:
        frappe.log_error(f"Error counting yesterday's appointments: {str(e)}")
        yesterday_appointments = yesterday_checked_in = yesterday_missed_cancelled = 0

    # Calculate Percentage Changes
    patients_change = calculate_percentage_change(total_patients, yesterday_total_patients)
    doctors_change = calculate_percentage_change(total_doctors, yesterday_total_doctors)
    appointments_change = calculate_percentage_change(total_appointments, yesterday_appointments)
    checkin_change = calculate_percentage_change(checked_in, yesterday_checked_in)
    missed_change = calculate_percentage_change(missed_cancelled, yesterday_missed_cancelled)

    checked_in_appointments = frappe.db.count('Patient Appointment', {'appointment_date': today, 'status': 'Checked In'})
    completed_appointments = frappe.db.count('Patient Appointment', {'appointment_date': today, 'status': 'Completed'})

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "checked_in": checked_in,
        "missed_cancelled": missed_cancelled,
        "completed": completed,
        "checked_in_appointments": checked_in_appointments,
        "completed_appointments": completed_appointments,
        "patients_change": patients_change,
        "doctors_change": doctors_change,
        "appointments_change": appointments_change,
        "checkin_change": checkin_change,
        "missed_change": missed_change,
    }

@frappe.whitelist()
def get_doctor_availability():
    """Simplified function to return practitioner availability.
    Returns a basic set of doctor information without complex schedule lookups.
    """
    today = nowdate()
    current_time = get_time(datetime.now())
    
    practitioners = frappe.get_all("Healthcare Practitioner", 
        fields=["name", "practitioner_name", "department", "mobile_phone"])
    
    result = []
    for pract in practitioners:
        # Count upcoming appointments
        upcoming_count = frappe.db.count("Patient Appointment", {
            "practitioner": pract["name"],
            "appointment_date": today,
            "status": ["in", ["Scheduled", "Open"]],
            "appointment_time": [">", current_time]
        })
        
        # Calculate status based on appointments
        current_appointment = frappe.db.exists("Patient Appointment", {
            "practitioner": pract["name"],
            "appointment_date": today,
            "status": "In Progress"
        })
        
        if current_appointment:
            status = "With Patient"
        elif upcoming_count > 0:
            status = "Available"
        else:
            status = "Not Scheduled"
        
        # Add to results
        pract_data = {
            "name": pract["name"],
            "practitioner_name": pract["practitioner_name"],
            "department": pract["department"],
            "status": status,
            "upcoming_appointments": upcoming_count,
            "contact": pract["mobile_phone"] or "",
            "schedule": []
        }
        result.append(pract_data)
    
    return result

# Waiting Area functionality has been removed

# Function moved to top of file

@frappe.whitelist()
def check_out_patient(appointment_id):
    try:
        appointment = frappe.get_doc("Patient Appointment", appointment_id)
        appointment.status = "Completed"
        appointment.save(ignore_permissions=True)
        return {"status": "success", "message": f"Patient {appointment.patient_name} checked out."}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Check-out Failed")
        return {"status": "error", "message": str(e)}

# Token Queue Management functionality has been removed as requested
