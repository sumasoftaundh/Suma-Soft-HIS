# File: apps/healthcare/healthcare/utils/boot_session.py
import frappe

def custom_boot_session(bootinfo):
    user = frappe.session.user
    roles = frappe.get_roles(user)

    role_route_map = {
        "Receptionist": "/app/reception-dashboard",
        "Doctor": "/app/doctor-dashboard",
        "Lab Manager": "/app/lab-manager-dashboard"
        # Add more roles as needed
    }

    for role in roles:
        route = role_route_map.get(role)
        if route:
            bootinfo.home_page = route
            frappe.logger().info(f"[Redirect] Role: {role}, Route: {route}")
            break




    return bootinfo
