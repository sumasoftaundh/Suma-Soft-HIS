// Fix for frappe.get_route() null errors
$(document).ready(function() {
    // Safely access frappe.get_route with null checks
    window.safe_get_route = function() {
        if (typeof frappe === 'undefined' || !frappe || !frappe.get_route) {
            console.log('Warning: frappe or frappe.get_route is not available');
            return null;
        }
        try {
            return frappe.get_route();
        } catch (e) {
            console.log('Error accessing frappe.get_route:', e);
            return null;
        }
    };

    // Safely check if route matches specific values
    window.is_route = function(route_segment, index, value) {
        const route = safe_get_route();
        if (!route || !Array.isArray(route) || route.length <= index) {
            return false;
        }
        return route[index] === value;
    };

    console.log('Frappe router safety utilities loaded');
});
