// Main fixes for Suma Health application JavaScript errors
// This file loads before other scripts to provide safety utilities and error handling

// Handle basic errors gracefully
window.addEventListener('error', function(e) {
    console.log('Global error caught:', e.message, 'in', e.filename, 'line', e.lineno);
    // Prevent the error from breaking other scripts
    return true;
});

// Initialize Suma-specific namespace if not already defined
window.suma = window.suma || {};

// Safety wrapper for frappe functionality
suma.ensureFrappeReady = function(callback, maxAttempts = 10) {
    let attempts = 0;
    
    function checkFrappe() {
        if (typeof frappe !== 'undefined' && frappe) {
            // Add safety utilities to frappe
            if (!frappe.safe_get_route) {
                frappe.safe_get_route = function() {
                    try {
                        if (frappe.get_route && typeof frappe.get_route === 'function') {
                            return frappe.get_route() || [];
                        }
                    } catch (e) {
                        console.log('Error accessing frappe.get_route:', e);
                    }
                    return [];
                };
            }
            
            // Provide fallback for frappe.ready if needed
            if (!frappe.ready) {
                frappe.ready = function(callback) {
                    $(document).ready(function() {
                        setTimeout(callback, 100);
                    });
                };
                console.log('Added fallback for frappe.ready');
            }
            
            // Execute callback
            if (typeof callback === 'function') {
                setTimeout(callback, 0);
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkFrappe, 200);
        } else {
            console.log('Frappe not available after multiple attempts, using fallback functionality');
            // Provide basic fallback functionality
            window.frappe = window.frappe || {
                get_route: function() { return []; },
                ready: function(callback) {
                    $(document).ready(function() {
                        setTimeout(callback, 100);
                    });
                }
            };
            
            if (typeof callback === 'function') {
                setTimeout(callback, 0);
            }
        }
    }
    
    checkFrappe();
};

// Fix for "can't access property 0, frappe.get_route() is null" errors
$(document).ready(function() {
    console.log('Applying Suma Health JavaScript fixes...');
    
    // Ensure our suma utilities are initialized
    suma.ensureFrappeReady(function() {
        console.log('Frappe is ready, applying extended fixes');
        
        // Fix the list view setup_columns issue
        if (frappe.views && frappe.views.ListView) {
            const originalSetupColumns = frappe.views.ListView.prototype.setup_columns;
            frappe.views.ListView.prototype.setup_columns = function() {
                try {
                    if (!this.list_view_settings) {
                        console.log('Patching missing list_view_settings');
                        this.list_view_settings = { fields: [] };
                    }
                    return originalSetupColumns.apply(this, arguments);
                } catch (e) {
                    console.error('Error in setup_columns:', e);
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
    });
});

// Fix for CORS errors with socket.io
$(document).ready(function() {
    // Check if the socket error is happening
    if (typeof io === 'undefined' || !io) {
        console.log('Socket.io not detected, no fixes needed');
        return;
    }
    
    const originalConnect = io.connect;
    io.connect = function(url, options) {
        // Log attempts to connect
        console.log('Socket.io connect intercepted:', url);
        
        // Add safety options for CORS
        options = options || {};
        options.transports = ['websocket']; // Force websocket only to avoid polling issues
        options.withCredentials = true;     // Ensure credentials are sent for CORS
        
        // Add extra error handling
        try {
            return originalConnect.call(this, url, options);
        } catch (e) {
            console.error('Error in socket.io connect:', e);
            // Return a minimal socket-like object to prevent errors
            return {
                on: function() { return this; },
                emit: function() { return this; },
                connect: function() { return this; },
                disconnect: function() { return this; }
            };
        }
    };
    
    console.log('Socket.io connect patched to handle CORS errors');
});
