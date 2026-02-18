// Direct DOM injection to force patient list navbar to appear
// This script forcefully injects the navbar buttons directly into the DOM

frappe.provide("healthcare.patient_list");

healthcare.patient_list.forceNavbar = function() {
    console.log("Forcing patient navbar injection");
    
    // Create a standalone navbar that doesn't depend on Frappe's containers
    const createFloatingNavbar = function() {
        console.log("Creating floating navbar");
        
        // Remove any existing floating navbar
        $(".floating-patient-navbar").remove();
        
        // Create container
        const $navbar = $("<div class='floating-patient-navbar'></div>").css({
            "position": "fixed",
            "top": "72px", // Below the main header
            "right": "20px",
            "z-index": "9999",
            "display": "flex",
            "gap": "10px",
            "background-color": "#f8f9fa",
            "padding": "8px",
            "border-radius": "4px",
            "box-shadow": "0 2px 5px rgba(0,0,0,0.1)"
        });
        
        // Create buttons
        const $addButton = $("<button class='btn btn-primary'></button>")
            .html("Add Patient")
            .css({
                "background-color": "#4682b4",
                "border-color": "#4682b4"
            });
            
        const $refreshButton = $("<button class='btn btn-default'></button>")
            .html("<i class='fa fa-refresh'></i> Refresh");
        
        // Add button actions
        $addButton.click(function() {
            frappe.new_doc("Patient");
        });
        
        $refreshButton.click(function() {
            if (cur_list) {
                cur_list.refresh();
            } else {
                location.reload();
            }
        });
        
        // Add buttons to navbar
        $navbar.append($addButton).append($refreshButton);
        
        // Add to document body
        $("body").append($navbar);
        
        return $navbar;
    };
    
    // Check if we're on the patient list page
    const isPatientListPage = function() {
        try {
            // Check URL
            const url = window.location.href.toLowerCase();
            if (url.includes("/app/patient") && !url.includes("/patient/view/")) {
                return true;
            }
            
            // Check route
            if (frappe.get_route && Array.isArray(frappe.get_route())) {
                const route = frappe.get_route();
                if (route[0] === "List" && route[1] === "Patient") {
                    return true;
                }
            }
            
            // Check breadcrumbs
            if ($(".breadcrumb-item:contains('Patient')").length > 0) {
                return true;
            }
            
            return false;
        } catch(e) {
            console.error("Error checking patient list page:", e);
            return false;
        }
    };
    
    // Main function to ensure navbar is visible
    const ensureNavbarVisible = function() {
        if (!isPatientListPage()) {
            $(".floating-patient-navbar").hide();
            return;
        }
        
        if ($(".floating-patient-navbar").length === 0) {
            createFloatingNavbar();
        } else {
            $(".floating-patient-navbar").show();
        }
    };
    
    // Call immediately
    ensureNavbarVisible();
    
    // Set up events
    $(document).on("route_change page_change list_render", function() {
        setTimeout(ensureNavbarVisible, 300);
    });
    
    // Check periodically
    setInterval(ensureNavbarVisible, 1000);
};

// Initialize immediately
$(document).ready(function() {
    // Run immediately
    healthcare.patient_list.forceNavbar();
    
    // Run again after delay to catch any race conditions
    setTimeout(healthcare.patient_list.forceNavbar, 1000);
    setTimeout(healthcare.patient_list.forceNavbar, 3000);
});

// Fallback - set up a MutationObserver to watch for DOM changes
(function() {
    const observer = new MutationObserver(function(mutations) {
        // Check if we need to inject the navbar
        if (window.location.href.includes("/app/patient")) {
            if ($(".floating-patient-navbar").length === 0) {
                if (typeof healthcare !== "undefined" && 
                    healthcare.patient_list && 
                    healthcare.patient_list.forceNavbar) {
                    healthcare.patient_list.forceNavbar();
                }
            }
        }
    });
    
    // Start observing once DOM is ready
    $(document).ready(function() {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();
