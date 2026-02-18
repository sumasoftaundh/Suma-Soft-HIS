frappe.provide("frappe.healthcare");

// Define the router for the appointment page
frappe.healthcare.AppointmentRouter = class AppointmentRouter {
    constructor() {
        this.make_routes();
    }

    make_routes() {
        // Register the route for the appointment page
        frappe.views.pageview.add({
            route: "appointment",
            parent_route: "healthcare",
            path_prefix: "/app/",
            label: "Appointments",
            type: "link",
            doctype: "Patient Appointment",
            icon: "calendar",
            color: "#4682b4"  // Steel blue theme color
        });
    }
};

// Initialize the router
$(document).ready(function() {
    if (frappe.boot && frappe.boot.modules && frappe.boot.modules["Healthcare"]) {
        frappe.healthcare.appointment_router = new frappe.healthcare.AppointmentRouter();
    }
});
