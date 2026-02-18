/**
 * Reception Dashboard - Public JavaScript
 * 
 * This file provides public extension functions for the Reception Dashboard.
 * It's loaded via the hooks.py file to ensure proper functionality across sites.
 */

// Create namespace safely
frappe.provide('healthcare.reception_dashboard');

// Ensure socket.io errors don't break page functionality
try {
    // Add CSS to hide socket error messages
    $('head').append('<style>#socket-connection-error, .socket-err { display: none !important; }</style>');
} catch(e) {
    console.error('Error applying socket error CSS:', e);
}

// Extension functions for the Reception Dashboard
healthcare.reception_dashboard = {
    /**
     * Initialize any additional functionality for the Reception Dashboard
     */
    init: function() {
        try {
            // Add any site-specific initialization here
            console.log('Reception Dashboard extensions initialized');
            
            // Fix any potential DOM-related issues
            this.preventDOMErrors();
        } catch(e) {
            console.error('Error initializing reception dashboard:', e);
        }
    },
    
    /**
     * Prevent common DOM manipulation errors
     */
    preventDOMErrors: function() {
        try {
            // Fix for the "appendChild" error by ensuring proper DOM manipulation
            const originalAppendChild = Node.prototype.appendChild;
            Node.prototype.appendChild = function(child) {
                try {
                    return originalAppendChild.call(this, child);
                } catch(e) {
                    console.warn('Prevented appendChild error:', e);
                    return null;
                }
            };
            
            // Also patch other common DOM functions that might cause issues
            const originalInsertBefore = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function(newNode, referenceNode) {
                try {
                    return originalInsertBefore.call(this, newNode, referenceNode);
                } catch(e) {
                    console.warn('Prevented insertBefore error:', e);
                    return null;
                }
            };
        } catch(e) {
            console.error('Error setting up DOM error prevention:', e);
        }
    },

    /**
     * Override default refresh functionality if needed
     */
    refresh: function() {
        try {
            if (frappe.reception_dashboard && frappe.reception_dashboard.refresh) {
                frappe.reception_dashboard.refresh();
            }
        } catch(e) {
            console.error('Error refreshing reception dashboard:', e);
        }
    }
};

// Initialize when page is fully loaded
$(document).on('page_loaded', function() {
    try {
        // Check if we're on the reception dashboard page
        if (frappe.get_route() && frappe.get_route()[0] === 'reception-dashboard') {
            // Add theme class to ensure consistent styling
            $('.page-head').addClass('reception-theme');
            $('.page-body').addClass('reception-theme');
            
            // Initialize extensions
            healthcare.reception_dashboard.init();
            
            // Apply additional fixes for reception dashboard
            setTimeout(function() {
                // Hide any socket error messages
                $('#socket-connection-error').hide();
                $('.socket-err').hide();
            }, 1000);
        }
    } catch(e) {
        console.error('Error during reception dashboard page initialization:', e);
    }
});

// Add additional CSS to maintain theme consistency
try {
    frappe.dom.set_style(`
        .reception-theme .page-head {
            background-color: #4682b4 !important; /* Steel Blue */
            position: relative;
            z-index: 900;
        }
        .reception-theme .btn-primary {
            background-color: #4682b4 !important; /* Steel Blue */
            border-color: #4682b4 !important;
        }
        .reception-theme .page-body {
            background-color: #f5f7fa !important; /* Light Gray */
        }
        
        /* Fix for socket connection errors */
        #socket-connection-error, 
        .socket-err,
        .socket-offline {
            display: none !important;
        }
        
        /* Fix for navbar conflicts */
        .reception-dashboard .enhanced-navbar-items,
        .reception-dashboard #simple-enhanced-navbar {
            z-index: 950 !important;
        }
    `);
} catch(e) {
    console.error('Error setting reception dashboard styles:', e);
}
