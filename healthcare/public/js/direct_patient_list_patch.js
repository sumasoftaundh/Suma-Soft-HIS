// Direct Patient List Patch - Forces navbar to appear consistently
// This script directly modifies Frappe's core ListView rendering for the Patient doctype

$(document).ready(function() {
    console.log('Applying direct patient list patch...');
    
    // 1. Override the original Patient ListView to force our navbar
    if (frappe.listview_settings && frappe.listview_settings['Patient']) {
        // Store the original render function if it exists
        const originalOnload = frappe.listview_settings['Patient'].onload;
        
        // Override with our enhanced version
        frappe.listview_settings['Patient'].onload = function(listview) {
            console.log('Patient list view onload triggered');
            
            // Call the original onload if it exists
            if (originalOnload) {
                originalOnload.call(this, listview);
            }
            
            // Force our navbar to be created after a small delay
            setTimeout(function() {
                forceNavbarVisibility();
            }, 100);
            
            // Also monitor for list refresh events
            if (listview) {
                if (listview.$result) {
                    // Watch for changes to the list items
                    const observer = new MutationObserver(function() {
                        forceNavbarVisibility();
                    });
                    
                    observer.observe(listview.$result[0], { 
                        childList: true, 
                        subtree: true 
                    });
                }
                
                // Hook into the refresh method
                if (listview.refresh && typeof listview.refresh === 'function') {
                    const originalRefresh = listview.refresh;
                    listview.refresh = function() {
                        const result = originalRefresh.apply(this, arguments);
                        setTimeout(forceNavbarVisibility, 200);
                        return result;
                    };
                }
            }
        };
        
        // Also override the refresh callback
        const originalRefresh = frappe.listview_settings['Patient'].refresh;
        frappe.listview_settings['Patient'].refresh = function(listview) {
            console.log('Patient list view refresh triggered');
            
            // Call the original refresh if it exists
            if (originalRefresh) {
                originalRefresh.call(this, listview);
            }
            
            // Force our navbar to be visible
            setTimeout(forceNavbarVisibility, 200);
        };
    }
    
    // 2. Function to force navbar visibility
    function forceNavbarVisibility() {
        console.log('Forcing navbar visibility...');
        
        // First check if we're on the patient list page
        if (!isPatientListPage()) {
            return;
        }
        
        // Remove any existing suma-forced-navbar to avoid duplicates
        $('.suma-forced-navbar').remove();
        
        // Create navbar container
        const $navbar = $('<div class="suma-forced-navbar"></div>').css({
            'display': 'flex',
            'gap': '10px',
            'position': 'absolute',
            'top': '8px',
            'right': '15px',
            'z-index': '100'
        });
        
        // Create the icon buttons
        const $addPatientButton = $('<button class="btn btn-primary"></button>')
            .attr('title', 'Add Patient')
            .html('Add');
        
        const $refreshButton = $('<button class="btn btn-default"></button>')
            .attr('title', 'Refresh List')
            .html('<i class="fa fa-refresh"></i> Refresh');
        
        // Style buttons with steel blue theme
        $addPatientButton.css({
            'background-color': '#4682b4',
            'border-color': '#4682b4',
            'color': 'white',
            'padding': '6px 12px',
            'border-radius': '4px'
        });
        
        $refreshButton.css({
            'background-color': '#f8f9fa',
            'border-color': '#dee2e6',
            'color': '#333',
            'padding': '6px 12px',
            'border-radius': '4px'
        });
        
        // Add hover effects
        $addPatientButton.hover(
            function() { $(this).css('background-color', '#3a6d97'); },
            function() { $(this).css('background-color', '#4682b4'); }
        );
        
        $refreshButton.hover(
            function() { $(this).css('background-color', '#e9ecef'); },
            function() { $(this).css('background-color', '#f8f9fa'); }
        );
        
        // Add click actions
        $addPatientButton.on('click', function() {
            try {
                frappe.new_doc('Patient');
            } catch(e) {
                console.error('Error creating new patient:', e);
                window.location.href = '/app/patient/new';
            }
        });
        
        $refreshButton.on('click', function() {
            try {
                if (typeof cur_list !== 'undefined' && cur_list) {
                    cur_list.refresh();
                } else {
                    location.reload();
                }
            } catch(e) {
                console.error('Error refreshing list:', e);
                location.reload();
            }
        });
        
        // Add buttons to navbar
        $navbar.append($addPatientButton);
        $navbar.append($refreshButton);
        
        // First try to add to the page-actions container
        const $pageActions = $('.page-head .page-actions');
        if ($pageActions.length) {
            $pageActions.html('').append($navbar);
            $pageActions.show();
        } else {
            // Fallback - add directly to page-head
            const $pageHead = $('.page-head');
            if ($pageHead.length) {
                $pageHead.append($navbar);
            } else {
                // Last resort - add to body with fixed positioning
                $navbar.css({
                    'position': 'fixed',
                    'top': '72px',
                    'right': '20px',
                    'z-index': '9999'
                });
                $('body').append($navbar);
            }
        }
        
        console.log('Navbar visibility enforced');
    }
    
    // 3. Function to check if we're on the patient list page
    function isPatientListPage() {
        try {
            // Method 1: Check Frappe route
            if (frappe && frappe.get_route) {
                const route = frappe.get_route();
                if (Array.isArray(route) && route.length >= 2 && 
                    route[0] === 'List' && route[1] === 'Patient') {
                    return true;
                }
            }
            
            // Method 2: Check URL
            const url = window.location.href.toLowerCase();
            if ((url.includes('/app/patient') && !url.includes('/patient/')) || 
                url.includes('#list/patient')) {
                return true;
            }
            
            // Method 3: Check page title
            const pageTitle = $('.page-title .title-text').text().trim();
            if (pageTitle === 'Patient') {
                return true;
            }
            
            return false;
        } catch(e) {
            console.warn('Error checking if on patient list page:', e);
            return false;
        }
    }
    
    // 4. Monitor route changes to enforce navbar visibility
    $(document).on('route_change', function() {
        setTimeout(function() {
            if (isPatientListPage()) {
                forceNavbarVisibility();
            }
        }, 300);
    });
    
    // 5. Initialize immediately if on patient list page
    if (isPatientListPage()) {
        forceNavbarVisibility();
    }
    
    // 6. Periodically check navbar visibility
    setInterval(function() {
        if (isPatientListPage() && $('.suma-forced-navbar').length === 0) {
            forceNavbarVisibility();
        }
    }, 2000);
    
    console.log('Direct patient list patch applied');
});
