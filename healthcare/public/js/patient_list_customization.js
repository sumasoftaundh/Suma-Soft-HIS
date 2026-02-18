frappe.views.ListView = class PatientListViewExtended extends frappe.views.ListView {
    setup_defaults() {
        super.setup_defaults();
        
        // If this is the Patient list view, modify the behavior
        if (this.doctype === 'Patient') {
            // Set no_sidebar to true to prevent sidebar rendering
            frappe.views.ListView.no_sidebar = true;
            
            // Load CSS file for patient list
            this.loadPatientListCSS();
            
            // Apply additional styling when the list view is rendered
            $(document).on('page-change', function() {
                if (frappe.get_route()[0] === 'List' && frappe.get_route()[1] === 'Patient') {
                    apply_custom_styling();
                }
            });
            
            // Also apply when list is refreshed
            $(document).on('list-refresh', function() {
                if (frappe.get_route()[0] === 'List' && frappe.get_route()[1] === 'Patient') {
                    apply_custom_styling();
                }
            });
        }
    }
    
    // Helper function to load the patient list CSS
    loadPatientListCSS() {
        const cssPath = '/assets/healthcare/css/patient_list.css';
        
        // Check if the CSS is already loaded
        if (!$('link[href="' + cssPath + '"]').length) {
            $('<link>')
                .appendTo('head')
                .attr({
                    type: 'text/css', 
                    rel: 'stylesheet',
                    href: cssPath
                });
            
            console.log('Patient list CSS loaded');
        }
    }
};

// Apply custom styling to the Patient list view
function apply_custom_styling() {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(function() {
        // Apply Patient Portal theme
        applyPatientPortalTheme();
        
        // Hide the sidebar container completely
        $('.page-container[data-page-route="List/Patient/List"] .layout-side-section').hide();
        
        // Make the main content area take full width
        $('.page-container[data-page-route="List/Patient/List"] .layout-main-section-wrapper').css({
            'width': '100%',
            'max-width': '100%',
            'padding': '0'
        });
        
        // Make the result list take full width
        $('.page-container[data-page-route="List/Patient/List"] .list-renderer-wrapper').css({
            'width': '100%',
            'max-width': '100%'
        });
        
        // Ensure the filter area takes full width
        $('.page-container[data-page-route="List/Patient/List"] .filter-section').css({
            'width': '100%',
            'max-width': '100%'
        });
        
        // Style the header with blue background and white text (matching reference image)
        $('.list-row-head').css({
            'background-color': '#4682b4',
            'color': 'white',
            'border-radius': '6px 6px 0 0'
        });
        
        // Make header text white
        $('.list-row-head .list-subject, .list-row-head .level-item, .list-row-head .list-col').css({
            'color': 'white'
        });
        
        // Make all list rows have black text
        $('.list-row .list-subject, .list-row .level-item, .list-row .list-col').css({
            'color': 'black'
        });
        
        // Style the Add Patient button with blue color
        $('[data-label="Add Patient"]').css({
            'background-color': '#4682b4',
            'border-color': '#4682b4',
            'color': 'white',
            'border-radius': '4px',
            'font-weight': '500'
        });
        
        // Apply white background to list container with light gray background
        $('.list-row-container').css({
            'background-color': 'white',
            'border-radius': '8px',
            'box-shadow': '0 1px 3px rgba(0,0,0,0.1)',
            'overflow': 'hidden'
        });
        
        // Set light gray background for entire list area (matching reference image)
        $('.page-container[data-page-route="List/Patient/List"] .layout-main-section').css({
            'background-color': '#f5f7fa',
            'padding': '20px'
        });
        
        // Fix any layout issues with the page container
        $('.page-container[data-page-route="List/Patient/List"]').css({
            'background-color': '#f5f7fa'
        });
        
        // Override the body class to prevent sidebar layout issues
        $('body').addClass('no-list-sidebar');
        
        console.log("Patient list view custom styling applied");
    }, 100);
}

// Function to apply the Patient Portal theme
function applyPatientPortalTheme() {
    // Define theme variables based on blue/gray color scheme from reference image
    const theme = {
        backgroundColor: '#f5f7fa',  // Light gray background
        panelBgColor: '#ffffff',     // White panel background
        accentColor: '#4682b4',      // Steel blue accent (matching header)
        textColor: '#333333',        // Dark text
        lightText: '#ffffff',        // White text for dark backgrounds
        borderColor: '#e2e8f0',      // Light border color
        hoverBg: '#f8fafb'           // Subtle hover background
    };
    
    // Apply background color to body - using the light gray theme
    $('body').css('background-color', theme.backgroundColor);
    
    // Apply styling to all buttons
    $('.btn-primary').css({
        'background-color': theme.accentColor,
        'border-color': theme.accentColor,
        'color': theme.lightText
    });
}

// Immediately invoke when script is loaded
if (frappe.get_route()[0] === 'List' && frappe.get_route()[1] === 'Patient') {
    apply_custom_styling();
}
