import frappe

def install_appointment_desk_page():
    """Create the appointment desk page if it doesn't exist"""
    if not frappe.db.exists("Desk Page", "appointment"):
        desk_page = frappe.get_doc({
            "doctype": "Desk Page",
            "name": "appointment",
            "label": "Appointments",
            "module": "Healthcare",
            "extends_another_page": 0,
            "category": "Modules",
            "is_standard": 1,
            "disable_user_customization": 0,
            "developer_mode_only": 0,
            "hide_custom": 0,
            "cards": [
                {
                    "hidden": 0,
                    "label": "Appointments",
                    "links": [
                        {
                            "type": "doctype",
                            "name": "Patient Appointment",
                            "label": "Patient Appointment",
                            "description": "Schedule and manage patient appointments",
                            "icon": "calendar",
                            "onboard": 0
                        },
                        {
                            "type": "doctype",
                            "name": "Appointment Type",
                            "label": "Appointment Type",
                            "description": "Appointment scheduling settings",
                            "icon": "setting",
                            "onboard": 0
                        },
                        {
                            "type": "doctype",
                            "name": "Practitioner Schedule",
                            "label": "Practitioner Schedule",
                            "description": "Healthcare practitioner schedule",
                            "icon": "note",
                            "onboard": 0
                        }
                    ]
                }
            ],
            "shortcuts": [
                {
                    "type": "DocType",
                    "link_to": "Patient Appointment",
                    "label": "Patient Appointments",
                    "color": "Blue",
                    "format": "{} Open",
                    "stats_filter": "{\"status\":[\"=\",\"Open\"]}"
                },
                {
                    "type": "DocType",
                    "link_to": "Patient Appointment",
                    "label": "Scheduled Appointments",
                    "color": "Green",
                    "format": "{} Scheduled",
                    "stats_filter": "{\"status\":[\"=\",\"Scheduled\"]}"
                },
                {
                    "type": "DocType",
                    "link_to": "Patient Appointment",
                    "label": "Pending Appointments",
                    "color": "Orange",
                    "format": "{} Pending",
                    "stats_filter": "{\"status\":[\"=\",\"Pending\"]}"
                }
            ],
            "charts": [
                {
                    "chart_name": "Appointment Status",
                    "label": "Appointment Status"
                }
            ]
        })
        desk_page.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Appointment desk page created successfully")
    else:
        print("Appointment desk page already exists")

if __name__ == "__main__":
    install_appointment_desk_page()
