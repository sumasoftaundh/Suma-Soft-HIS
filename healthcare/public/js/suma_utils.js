// Suma Health Utility Functions
// A collection of helper functions to address common JavaScript errors
// and provide safe access to Frappe framework functions

(function() {
    // Create a global suma object if it doesn't exist
    window.suma = window.suma || {};
    
    // Safe access to frappe.get_route()
    suma.getRoute = function() {
        if (typeof frappe === 'undefined' || !frappe) {
            console.log('[Suma Utils] Warning: frappe is not defined');
            return [];
        }
        
        if (!frappe.get_route || typeof frappe.get_route !== 'function') {
            console.log('[Suma Utils] Warning: frappe.get_route is not a function');
            return [];
        }
        
        try {
            const route = frappe.get_route();
            return Array.isArray(route) ? route : [];
        } catch (e) {
            console.log('[Suma Utils] Error accessing frappe.get_route:', e);
            return [];
        }
    };
    
    // Safe route comparison
    suma.isRoute = function(segment, value) {
        const route = suma.getRoute();
        if (route.length <= segment) return false;
        return route[segment] === value;
    };
    
    // Safely check if current route matches a pattern
    suma.routeMatches = function(routePattern) {
        const route = suma.getRoute();
        if (route.length < routePattern.length) return false;
        
        for (let i = 0; i < routePattern.length; i++) {
            if (routePattern[i] !== '*' && routePattern[i] !== route[i]) {
                return false;
            }
        }
        return true;
    };
    
    // Safe document ready function that works even if frappe.ready is not available
    suma.ready = function(callback) {
        $(document).ready(function() {
            // Add a small delay to ensure Frappe is fully initialized
            setTimeout(function() {
                if (typeof callback === 'function') {
                    try {
                        callback();
                    } catch (e) {
                        console.error('[Suma Utils] Error in ready callback:', e);
                    }
                }
            }, 100);
        });
    };
    
    // Initialize safety patches
    suma.initSafetyPatches = function() {
        // Add safe frappe.ready if it doesn't exist
        if (typeof frappe !== 'undefined' && !frappe.ready) {
            frappe.ready = function(callback) {
                console.log('[Suma Utils] Using patched frappe.ready');
                suma.ready(callback);
            };
        }
        
        // Add list view safety
        if (typeof frappe !== 'undefined' && frappe.views && frappe.views.ListView) {
            const originalSetupColumns = frappe.views.ListView.prototype.setup_columns;
            frappe.views.ListView.prototype.setup_columns = function() {
                try {
                    if (!this.list_view_settings) {
                        console.log('[Suma Utils] Patching missing list_view_settings');
                        this.list_view_settings = { fields: [] };
                    }
                    return originalSetupColumns.apply(this, arguments);
                } catch (e) {
                    console.error('[Suma Utils] Error in setup_columns:', e);
                    // Set default columns if there's an error
                    this.columns = [
                        {
                            type: "Subject",
                            df: { fieldtype: "Data", label: "Name" }
                        }
                    ];
                }
            };
        }
    };
    
    // CSS utility to ensure style additions are non-conflicting
    suma.addCSS = function(id, cssText) {
        // Remove existing style element with same ID if it exists
        $('#' + id).remove();
        
        // Create and add new style element
        $('<style id="' + id + '"></style>')
            .prop('type', 'text/css')
            .html(cssText)
            .appendTo('head');
    };
    
    console.log('[Suma Utils] Initialized successfully');
})();

// Initialize safety patches when DOM is ready
$(document).ready(function() {
    if (window.suma && suma.initSafetyPatches) {
        suma.initSafetyPatches();
    }
});
