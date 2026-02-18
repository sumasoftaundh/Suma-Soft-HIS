/**
 * Direct icon removal script for Frappe core elements
 * This script specifically targets the bell and plus icons in the blue header
 * that are part of Frappe's core UI
 */

(function() {
    // Function to remove the icons
    function removeHeaderIcons() {
        // Wait for DOM to be ready
        $(document).ready(function() {
            // Function to remove specific elements
            function removeElements() {
                // Target Frappe's core navbar elements with various selectors
                const selectors = [
                    // Notifications (bell icon) and New (plus icon) in navbar
                    '.navbar [data-feature="notifications"]',
                    '.navbar [data-feature="new"]',
                    '.dropdown.dropdown-notifications',
                    '.dropdown-help',
                    
                    // Core navbar elements on right side
                    '.navbar-right .dropdown:has([data-label="Notifications"])',
                    '.navbar-right .dropdown:has([data-label="New"])',
                    
                    // Specific page-head elements
                    '.page-head .dropdown:has(.fa-bell)',
                    '.page-head .dropdown:has(.fa-plus)',
                    
                    // Any elements with bell or plus icons
                    '.navbar-right .fa-bell, .navbar-right .fa-bell-o',
                    '.navbar-right .fa-plus'
                ];
                
                // Hide each selector
                selectors.forEach(selector => {
                    $(selector).hide();
                    $(selector).css('display', 'none !important');
                    $(selector).addClass('removed-by-suma');
                });
                
                // Also try removing by direct attribute
                $('[data-navbar-default="notifications"]').hide();
                $('[data-navbar-default="new"]').hide();
                
                console.log('Removed bell and plus icons from header');
            }
            
            // Run immediately
            removeElements();
            
            // Also run after a slight delay to catch dynamically loaded elements
            setTimeout(removeElements, 500);
            setTimeout(removeElements, 1000);
            
            // Override Frappe's core navbar settings if possible
            if (typeof frappe !== 'undefined') {
                // Try to modify Frappe's navbar settings
                if (frappe.boot && frappe.boot.navbar_settings) {
                    // Remove notifications from navbar settings
                    if (frappe.boot.navbar_settings.settings_dropdown) {
                        let settings = frappe.boot.navbar_settings.settings_dropdown;
                        settings = settings.filter(item => 
                            item.name !== 'notification_settings' && 
                            item.name !== 'background_jobs'
                        );
                        frappe.boot.navbar_settings.settings_dropdown = settings;
                    }
                    
                    // Remove icons from navbar items
                    if (frappe.boot.navbar_settings.navbar_items) {
                        let items = frappe.boot.navbar_settings.navbar_items;
                        items = items.filter(item => 
                            item.item_label !== 'Notifications' && 
                            item.item_label !== 'New'
                        );
                        frappe.boot.navbar_settings.navbar_items = items;
                    }
                    
                    console.log('Modified Frappe navbar settings to remove notifications and new items');
                }
            }
        });
    }
    
    // Execute our function
    removeHeaderIcons();
    
    // Also add event handlers for route changes
    $(document).on('route_change', function() {
        setTimeout(removeHeaderIcons, 200);
    });
    
    // Set up mutation observer to handle dynamically added elements
    const observer = new MutationObserver(function() {
        removeHeaderIcons();
    });
    
    // Start observing once document body is available
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
