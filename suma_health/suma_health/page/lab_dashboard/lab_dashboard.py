import frappe
from frappe.utils import getdate, nowdate

@frappe.whitelist()
def get_kpi_data():
    today = nowdate()

    # Total Lab Tests Today
    total_tests_today = frappe.db.count('Lab Test', {'creation': ['>=', today]})

    # Pending Tests
    pending_tests = frappe.db.count('Lab Test', {'status': 'Pending', 'creation': ['>=', today]})

    # Reports Ready for Review
    reports_ready = frappe.db.count('Lab Test', {'status': 'Completed', 'creation': ['>=', today]})

    # Reports Sent to Patients
    reports_sent = frappe.db.count('Lab Test', {'email_sent': 1, 'creation': ['>=', today]})

    # Upcoming Appointments
    upcoming_appointments = frappe.db.count('Patient Appointment', {'appointment_date': today, 'status': 'Scheduled'})

    # Overdue Tests
    overdue_tests = frappe.db.count('Lab Test', {
        'expected_result_date': ['<', today],
        'status': ['not in', ['Completed', 'Approved', 'Cancelled']]
    })

    return {
        'total_tests_today': total_tests_today,
        'pending_tests': pending_tests,
        'reports_ready': reports_ready,
        'reports_sent': reports_sent,
        'upcoming_appointments': upcoming_appointments,
        'overdue_tests': overdue_tests
    }

@frappe.whitelist()
def get_lab_test_queue():
    return frappe.db.sql("""
        SELECT
            name, patient_name, lab_test_name, status, employee_name as assigned_technician, expected_result_date
        FROM
            `tabLab Test`
        WHERE
            status NOT IN ('Completed', 'Approved', 'Cancelled', 'Rejected')
        ORDER BY
            creation DESC
        LIMIT 20
    """, as_dict=1)

@frappe.whitelist()
def get_technician_workload():
    technicians = frappe.get_all(
        "Has Role",
        filters={"role": "Lab Technician", "parenttype": "User"},
        fields=["parent as user_name"]
    )

    if not technicians:
        return []

    workload_data = []
    for tech in technicians:
        count = frappe.db.count(
            "Lab Test",
            filters={
                "employee": tech.user_name,
                "status": ["not in", ["Completed", "Approved", "Cancelled", "Rejected"]]
            }
        )
        workload_data.append({"technician": tech.user_name, "workload": count})

    return workload_data

@frappe.whitelist()
def get_sample_collection_data():
    today = nowdate()
    return frappe.db.sql("""
        SELECT
            lt.name, lt.patient_name, lt.status, ls.collected_by as collector
        FROM
            `tabLab Test` lt
        LEFT JOIN
            `tabSample Collection` ls ON lt.name = ls.reference_name
        WHERE
            lt.sample_collection_datetime LIKE %(today)s
        ORDER BY
            lt.sample_collection_datetime ASC
        LIMIT 20
    """, {'today': f"{today}%%"}, as_dict=1)

@frappe.whitelist()
def get_reports_for_delivery():
    return frappe.db.get_all(
        "Lab Test",
        filters={
            "status": "Completed",
            "email_sent": 0
        },
        fields=["name", "patient_name", "lab_test_name", "practitioner"],
        order_by="modified DESC",
        limit=20
    )

@frappe.whitelist()
def get_lab_tests_over_time_data():
    from frappe.utils import getdate, add_days

    today = getdate()
    start_date = add_days(today, -6)

    data = frappe.db.sql("""
        SELECT
            DATE(creation) as date, COUNT(*) as count
        FROM
            `tabLab Test`
        WHERE
            creation BETWEEN %(start_date)s AND %(end_date)s
        GROUP BY
            DATE(creation)
        ORDER BY
            date
    """, {'start_date': start_date, 'end_date': today}, as_dict=1)

    # Prepare data for charts
    chart_data = {
        'labels': [],
        'datasets': [
            {
                'name': 'Lab Tests',
                'values': []
            }
        ]
    }

    # Create a map of dates for quick lookup
    data_map = {getdate(row.date): row.count for row in data}

    # Fill in missing dates with 0 counts
    for i in range(7):
        date = add_days(start_date, i)
        chart_data['labels'].append(date.strftime('%b %d'))
        chart_data['datasets'][0]['values'].append(data_map.get(date, 0))

    return chart_data

@frappe.whitelist()
def get_alerts():
    from frappe.utils import nowdate, date_diff

    today = nowdate()
    overdue_tests = frappe.get_all(
        "Lab Test",
        filters={
            "expected_result_date": ["<", today],
            "status": ["not in", ["Completed", "Approved", "Cancelled", "Rejected"]]
        },
        fields=["name", "patient_name", "lab_test_name", "expected_result_date"]
    )

    alerts = []
    for test in overdue_tests:
        days_overdue = date_diff(today, test.expected_result_date)
        alerts.append({
            "title": f"Overdue: {test.lab_test_name}",
            "message": f"Test for {test.patient_name} is {days_overdue} day(s) overdue.",
            "test_name": test.name
        })
    
    return alerts
