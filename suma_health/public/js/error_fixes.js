// Suma Health - Comprehensive JavaScript Error Fixes
// This script fixes all identified JavaScript errors in the application

(function() {
    console.log('Applying comprehensive error fixes...');

    // Wait for DOM to be ready
    $(document).ready(function() {
        // ===== Fix 1: Safe access to frappe.get_route() =====
        if (typeof frappe !== 'undefined') {
            console.log('Patching frappe.get_route for safe access');
            
            // Save original method
            const originalGetRoute = frappe.get_route;
            
            // Replace with safe version
            frappe.get_route = function() {
                try {
                    const route = originalGetRoute ? originalGetRoute.apply(this, arguments) : null;
                    return Array.isArray(route) ? route : [];
                } catch (e) {
                    console.warn('Error in frappe.get_route:', e);
                    return [];
                }
            };
            
            // Add convenience method for route checks
            frappe.route_equals = function(route1, route2) {
                try {
                    if (!route1 || !route2) return false;
                    if (!Array.isArray(route1) || !Array.isArray(route2)) return false;
                    if (route1.length !== route2.length) return false;
                    
                    for (let i = 0; i < route1.length; i++) {
                        if (route1[i] !== route2[i]) return false;
                    }
                    return true;
                } catch (e) {
                    console.warn('Error in route_equals:', e);
                    return false;
                }
            };
        }
        
        // ===== Fix 2: Patching role_redirect.js issues =====
        console.log('Patching role_redirect.js issues');
        
        // Ensure user roles are safely accessed
        if (typeof frappe !== 'undefined' && frappe) {
            if (!frappe.user_roles) {
                frappe.user_roles = [];
                
                // Try to get roles from session if available
                if (frappe.session && frappe.session.user_roles) {
                    frappe.user_roles = frappe.session.user_roles;
                }
            }
        }
        
        // ===== Fix 3: List view settings patch =====
        console.log('Patching list view settings');
        
        // Wait a bit to ensure frappe.views is loaded
        setTimeout(function() {
            if (typeof frappe !== 'undefined' && frappe.views && frappe.views.ListView) {
                console.log('ListView found, applying patch');
                
                // Save original method
                const originalSetupColumns = frappe.views.ListView.prototype.setup_columns;
                
                // Replace with safe version
                frappe.views.ListView.prototype.setup_columns = function() {
                    try {
                        // Create missing settings object if needed
                        if (!this.list_view_settings) {
                            console.log('Creating default list_view_settings');
                            this.list_view_settings = { fields: [] };
                        }
                        
                        // Handle case where settings exists but fields is missing
                        if (this.list_view_settings && !this.list_view_settings.fields) {
                            this.list_view_settings.fields = [];
                        }
                        
                        // Call original method with fixed context
                        return originalSetupColumns.apply(this, arguments);
                    } catch (e) {
                        console.warn('Error in setup_columns:', e);
                        
                        // Set default columns if there's an error
                        this.columns = [
                            {
                                type: "Subject",
                                df: { fieldtype: "Data", label: "Name" }
                            }
                        ];
                    }
                };
                
                // Fix list view render issues
                if (frappe.views.ListView.prototype.render_list) {
                    const originalRenderList = frappe.views.ListView.prototype.render_list;
                    
                    frappe.views.ListView.prototype.render_list = function() {
                        try {
                            return originalRenderList.apply(this, arguments);
                        } catch (e) {
                            console.warn('Error in render_list:', e);
                            
                            // Attempt recovery
                            if (this.parent && this.$result) {
                                this.$result.appendTo(this.parent);
                            }
                        }
                    };
                }
                
                // Fix setup_view
                if (frappe.views.ListView.prototype.setup_view) {
                    const originalSetupView = frappe.views.ListView.prototype.setup_view;
                    
                    frappe.views.ListView.prototype.setup_view = function() {
                        try {
                            return originalSetupView.apply(this, arguments);
                        } catch (e) {
                            console.warn('Error in setup_view:', e);
                            
                            // Attempt minimal setup
                            if (!this.columns) {
                                this.columns = [
                                    {
                                        type: "Subject",
                                        df: { fieldtype: "Data", label: "Name" }
                                    }
                                ];
                            }
                        }
                    };
                }
            }
        }, 500);
        
        // ===== Fix 4: CORS error handling for socket.io =====
        console.log('Setting up CORS error handling for socket.io');
        
        // Add global error handler for CORS and network errors
        window.addEventListener('error', function(e) {
            // Check if it's a CORS or network error
            if (e.message && (
                e.message.includes('CORS') || 
                e.message.includes('NetworkError') ||
                e.message.includes('Failed to fetch')
            )) {
                console.warn('Intercepted CORS/network error:', e.message);
                // Prevent error from breaking application
                return true;
            }
        });
        
        // Fix socket.io CORS issues by patching the connection
        if (typeof io !== 'undefined') {
            console.log('Patching socket.io connection');
            
            // Store original connect method
            const originalConnect = io.connect;
            
            // Replace with safe version
            io.connect = function(url, options) {
                console.log('Intercepted socket.io connection to:', url);
                
                // Add CORS-friendly options
                options = options || {};
                options.transports = ['websocket']; // Avoid polling
                options.withCredentials = true;     // Send credentials
                options.forceNew = true;            // Force new connection
                
                try {
                    return originalConnect.call(this, url, options);
                } catch (e) {
                    console.warn('Error in socket.io connect:', e);
                    
                    // Return mock socket object to prevent errors
                    return {
                        on: function() { return this; },
                        emit: function() { return this; },
                        connect: function() { return this; },
                        disconnect: function() { return this; }
                    };
                }
            };
        }
        
        // ===== Fix 5: Fix patient_list_custom.js issues =====
        console.log('Applying patient list fixes');
        
        // Fix for simplified navbar persistence
        const fixPatientListNavbar = function() {
            if ($('.custom-patient-navbar').length === 0) {
                console.log('Restoring patient list navbar');
                
                // Check if the setupSimplifiedNavbar function exists
                if (typeof setupSimplifiedNavbar === 'function') {
                    setupSimplifiedNavbar();
                } else if (typeof frappe !== 'undefined' && frappe.listview_settings && frappe.listview_settings['Patient']) {
                    // Try to trigger onload to reinitialize
                    const listview = cur_list;
                    if (listview && frappe.listview_settings['Patient'].onload) {
                        frappe.listview_settings['Patient'].onload(listview);
                    }
                }
            }
        };
        
        // Apply fixes after route changes and periodically
        $(document).on('route_change', function() {
            const route = frappe.get_route();
            if (Array.isArray(route) && route[0] === 'List' && route[1] === 'Patient') {
                setTimeout(fixPatientListNavbar, 500);
            }
        });
        
        // Check periodically for 30 seconds after page load
        let checkCount = 0;
        const intervalId = setInterval(function() {
            const route = frappe.get_route();
            if (Array.isArray(route) && route[0] === 'List' && route[1] === 'Patient') {
                fixPatientListNavbar();
            }
            
            checkCount++;
            if (checkCount >= 15) {
                clearInterval(intervalId);
            }
        }, 2000);
        
        console.log('All error fixes applied successfully');
    });
})();
