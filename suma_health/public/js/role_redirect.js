console.log("✅ Role redirect script loaded.");

$(document).ready(function() {
    console.log("Document ready triggered");
    
    // Only execute in desk context
    console.log("Checking authentication context...");
    if (frappe.boot && frappe.session && frappe.session.user && frappe.session.user !== 'Guest') {
        console.log("User authenticated as:", frappe.session.user);
        
        // Log current route information using safe access
let route = [];

// Safely get route - handle case where suma isn't loaded yet
try {
    if (typeof suma !== 'undefined' && suma && suma.getRoute) {
        route = suma.getRoute();
    } else if (typeof frappe !== 'undefined' && frappe && frappe.get_route) {
        route = frappe.get_route() || [];
    } else {
        // Fallback to window.location.pathname parsing
        const pathname = window.location.pathname;
        route = pathname.split('/').filter(Boolean);
        if (route.length > 0 && route[0] === 'app') {
            route = route.slice(1);  // Remove 'app' prefix if present
        }
    }
} catch (e) {
    console.warn("Error getting route:", e);
    route = [];
}

console.log("Current route object (safe):", route);
console.log("First route segment (safe):", route[0] || 'undefined');
console.log("Is route[0] === 'app'?", (route[0] || '') === 'app');
        
        // Check if we're on the home page or workspaces - redirect from there
        if ((route[0] || '') === 'app' || (route[0] || '') === 'Workspaces') {
            console.log("On app home page or workspaces, proceeding with role check");
            
            console.log("Getting user roles directly from frappe.user_roles");
            // We can access the user roles directly from frappe.user_roles
            // This avoids permission issues with querying the Has Role doctype
            const roles = frappe.user_roles || [];
            console.log("User roles:", roles);
            
            console.log("Checking for Doctor role:", roles.includes("Doctor"));
            if (roles.includes("Doctor")) {
                console.log("⏩ Redirecting to doctor_dashboard");
                frappe.set_route("doctor_dashboard");
            } else if (roles.includes("Receptionist")) {
                console.log("Checking for Receptionist role:", roles.includes("Receptionist"));
                console.log("⏩ Redirecting to reception-dashboard");
                frappe.set_route("reception-dashboard");
            } else if (roles.includes("Lab Manager")) {
                console.log("Checking for Lab Manager role:", roles.includes("Lab Manager"));
                console.log("⏩ Redirecting to lab_dashboard");
                frappe.set_route("lab_dashboard");
            } else if (roles.includes("Pharmacist")) {
                
                console.log("Checking for Pharmacist role:", roles.includes("Pharmacist"));
                console.log("⏩ Redirecting to medical_dashboard");
                frappe.set_route("medical_dashboard");
            } else if (roles.includes("Nurse")) {
                console.log("Checking for Nurse role:", roles.includes("Nurse"));
                console.log("⏩ Redirecting to nurse-dashboard");
                frappe.set_route("nurse-dashboard");
            } else if (roles.includes("Patient")) {
                console.log("Checking for Patient role:", roles.includes("Patient"));
                console.log("⏩ Redirecting to patient-dashboard");
                frappe.set_route("patient-dashboard");
            } else {
                console.log("No specific role match found for dashboard redirection");
            }
        } else {
            console.log("Not on app home page or workspaces, current route is: " + frappe.get_route()[0]);
            
            // Check roles even when not on app home page and redirect to appropriate dashboard with app/ prefix
            const roles = frappe.user_roles || [];
            console.log("User roles for redirect:", roles);
            
            if (roles.includes("Doctor")) {
                console.log("⏩ Redirecting to app/doctor_dashboard");
                frappe.set_route("app/doctor_dashboard");
            } else if (roles.includes("Receptionist")) {
                console.log("⏩ Redirecting to app/reception-dashboard");
                frappe.set_route("app/reception-dashboard");
            } else if (roles.includes("Lab Manager")) {
                console.log("⏩ Redirecting to app/lab_dashboard");
                frappe.set_route("app/lab_dashboard");
            } else if (roles.includes("Pharmacist")) {
                console.log("⏩ Redirecting to app/medical_dashboard");
                frappe.set_route("app/medical_dashboard");
            } else if (roles.includes("Nurse")) {
                console.log("⏩ Redirecting to app/nurse-dashboard");
                frappe.set_route("app/nurse-dashboard");
            } else if (roles.includes("Patient")) {
                console.log("⏩ Redirecting to app/patient-dashboard");
                frappe.set_route("app/patient-dashboard");
            } else {
                console.log("No specific role match found for dashboard redirection");
            }
        }
    } else {
        console.log("User not authenticated or is Guest");
    }
});
