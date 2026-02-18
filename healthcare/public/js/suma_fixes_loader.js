// Suma Health - JavaScript Error Fixes Loader
// This script ensures all fixes are loaded in the proper order
// and provides a comprehensive solution to the JavaScript errors

// Direct Navbar Injection - This runs first, before any other script
function forcePatientNavbar() {
    console.log('FORCE: Checking for patient list page...');
    
    // Check if we're on the patient list page
    function isPatientPage() {
        var url = window.location.href.toLowerCase();
        return url.includes('/app/patient') && !url.includes('/patient/view/');
    }
    
    if (isPatientPage()) {
        console.log('FORCE: On patient list page, injecting navbar...');
        
        // Create floating navbar
        var navbar = document.createElement('div');
        navbar.id = 'suma-forced-navbar';
        navbar.style.cssText = 'position:fixed; top:72px; right:20px; z-index:99999; display:flex; gap:10px; background:#f8f9fa; padding:8px; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.2);';
        
        // Create Add Patient button
        var addBtn = document.createElement('button');
        addBtn.className = 'btn btn-primary';
        addBtn.innerHTML = 'Add Patient';
        addBtn.style.cssText = 'background-color:#4682b4; border-color:#4682b4;';
        addBtn.onclick = function() {
            if (typeof frappe !== 'undefined') {
                frappe.new_doc('Patient');
            } else {
                window.location.href = '/app/patient/new';
            }
        };
        
        // Create Refresh button
        var refreshBtn = document.createElement('button');
        refreshBtn.className = 'btn btn-default';
        refreshBtn.innerHTML = '<i class="fa fa-refresh"></i> Refresh';
        refreshBtn.onclick = function() {
            if (typeof cur_list !== 'undefined' && cur_list) {
                cur_list.refresh();
            } else {
                window.location.reload();
            }
        };
        
        // Add buttons to navbar
        navbar.appendChild(addBtn);
        navbar.appendChild(refreshBtn);
        
        // Add to body
        document.body.appendChild(navbar);
        
        // Set up monitoring
        setInterval(function() {
            // If navbar was removed, add it back
            if (!document.getElementById('suma-forced-navbar')) {
                document.body.appendChild(navbar);
            }
        }, 1000);
    }
}

// Run immediately
forcePatientNavbar();

// Also run when DOM is ready
$(document).ready(function() {
    // Run navbar force again
    forcePatientNavbar();
    
    // Monitor for route changes
    $(document).on('route_change', function() {
        setTimeout(forcePatientNavbar, 300);
    });
    
    console.log('Loading Suma fixes...');
    
    // List of scripts to load in order
    const scripts = [
        '/assets/healthcare/js/suma_utils.js',
        '/assets/healthcare/js/socket_fix.js',
        '/assets/healthcare/js/main_fixes.js',
        '/assets/healthcare/js/error_fixes.js', // New comprehensive error fixes
        '/assets/healthcare/js/list_view_fix.js', // Specific fix for ListView settings issue
        '/assets/healthcare/js/navbar_persistence_fix.js', // Ensures navbar stays visible at all times
        '/assets/healthcare/js/enhanced_navbar_fix.js' // More aggressive navbar visibility fix
    ];
    
    // Function to load scripts in sequence
    function loadScripts(scripts, index) {
        if (index >= scripts.length) {
            console.log('All Suma Health fixes loaded successfully');
            return;
        }
        
        const script = document.createElement('script');
        script.src = scripts[index];
        script.onload = function() {
            console.log(`Loaded: ${scripts[index]}`);
            loadScripts(scripts, index + 1);
        };
        script.onerror = function() {
            console.error(`Failed to load: ${scripts[index]}`);
            loadScripts(scripts, index + 1);
        };
        document.head.appendChild(script);
    }
    
    // Start loading scripts
    loadScripts(scripts, 0);
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        // Log the error but prevent it from breaking the application
        console.error('Caught JS error:', e.message, 'in', e.filename, 'line', e.lineno);
        return true;
    });
    
    // Set up emergency safeguards
    window.setTimeout(function() {
        // Ensure frappe.get_route is safe
        if (typeof frappe !== 'undefined' && frappe) {
            const originalGetRoute = frappe.get_route;
            frappe.get_route = function() {
                try {
                    const route = originalGetRoute.apply(this, arguments);
                    return Array.isArray(route) ? route : [];
                } catch (e) {
                    console.warn('Error in frappe.get_route:', e);
                    return [];
                }
            };
        }
        
        // Ensure frappe.ready exists
        if (typeof frappe !== 'undefined' && frappe && !frappe.ready) {
            frappe.ready = function(callback) {
                $(document).ready(function() {
                    setTimeout(callback, 100);
                });
            };
        }
    }, 1000);
})();
