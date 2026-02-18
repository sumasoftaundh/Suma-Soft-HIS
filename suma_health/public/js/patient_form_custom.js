// Patient Form Custom JS - Make navbar sticky and expand form width
frappe.provide('healthcare');

// This global style ensures the navbar is always sticky in patient forms with no top space
// and expands the form width to match the patient encounter form
$('<style id="patient-form-sticky-style">').
    prop('type', 'text/css').
    html(`
        /* Global styles for Patient form navbar - maximum specificity with no top space */
        .page-container[data-route^="Form/Patient"] .page-head,
        body[data-route^="Form/Patient"] .page-head,
        html body[data-route="Form/Patient/New"] .page-head,
        .patient-form-page .page-head {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 9999 !important;
            background-color: white !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
            margin: 0 !important;
            padding: 0 15px !important;
            height: auto !important;
        }

        /* Remove any additional spacing */
        .page-container[data-route^="Form/Patient"] .page-head .page-head-content,
        body[data-route^="Form/Patient"] .page-head .page-head-content,
        html body[data-route="Form/Patient/New"] .page-head .page-head-content {
            padding: 10px 0 !important;
            margin: 0 !important;
        }
        
        /* Remove unwanted margins/padding in navbar */
        .page-container[data-route^="Form/Patient"] .page-title,
        body[data-route^="Form/Patient"] .page-title,
        html body[data-route="Form/Patient/New"] .page-title {
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Adjust main content area to account for fixed header with proper spacing */
        .page-container[data-route^="Form/Patient"] .page-body,
        body[data-route^="Form/Patient"] .page-body,
        html body[data-route="Form/Patient/New"] .page-body,
        .patient-form-page .page-body {
            padding-top: 50px !important;
            margin-top: 0 !important;
        }

        /* Full width form expansion - similar to patient encounter */
        .page-container[data-route^="Form/Patient"] .form-layout,
        body[data-route^="Form/Patient"] .form-layout {
            width: 95% !important;
            max-width: none !important;
            margin: 0 auto !important;
        }
        
        /* Force wide form sections */
        .page-container[data-route^="Form/Patient"] .form-section,
        body[data-route^="Form/Patient"] .form-section {
            width: 100% !important;
            max-width: none !important;
        }

        /* Style buttons to match Patient Portal theme */
        .page-container[data-route^="Form/Patient"] .btn-primary,
        body[data-route^="Form/Patient"] .btn-primary,
        html body[data-route="Form/Patient/New"] .btn-primary {
            background-color: #4682b4 !important;
            border-color: #4682b4 !important;
        }

        /* Style form fields with steel blue focus */
        .page-container[data-route^="Form/Patient"] .frappe-control input:focus,
        .page-container[data-route^="Form/Patient"] .frappe-control select:focus,
        .page-container[data-route^="Form/Patient"] .frappe-control textarea:focus {
            border-color: #4682b4 !important;
        }
    `).
    appendTo('head');

// Apply custom styling to Patient form pages
$(document).ready(function() {
    // Wait for suma utils to be available
    setTimeout(function() {
        // Apply on document ready with safe route checking
        const route = window.suma ? suma.getRoute() : [];
        if (route.length >= 2 && route[0] === 'Form' && route[1] === 'Patient') {
            makeStickyNavbar();
        }
    }, 200);
    
    // Also apply when route changes
    $(document).on('route_change', function() {
        const route = window.suma ? suma.getRoute() : [];
        if (route.length >= 2 && route[0] === 'Form' && route[1] === 'Patient') {
            setTimeout(makeStickyNavbar, 100);
            // Apply again after a longer delay to catch slower rendering
            setTimeout(makeStickyNavbar, 500);
            setTimeout(makeStickyNavbar, 1000);
        }
    });
    
    // Apply on form render and refresh events
    $(document).on('form-refresh', function(e) {
        if (frappe.get_route()[0] === 'Form' && frappe.get_route()[1] === 'Patient') {
            makeStickyNavbar();
        }
    });
    
    // Also catch any new patient forms
    $(document).on('form-load', function() {
        if (frappe.get_route()[0] === 'Form' && frappe.get_route()[1] === 'Patient') {
            setTimeout(makeStickyNavbar, 100);
        }
    });
});

// Function to make the Patient form navbar sticky
function makeStickyNavbar() {
    // Define theme variables for consistency with Patient Portal
    const theme = {
        accentColor: '#4682b4',    // Steel blue accent
        backgroundColor: '#f5f7fa', // Light grey background
        panelBgColor: '#ffffff',   // White panel background
    };
    
    // Direct DOM manipulation to ensure the navbar sticks at the top
    // First identify all possible patient form page heads
    const pageHeadSelectors = [
        '.page-container[data-route^="Form/Patient"] .page-head',
        'body[data-route^="Form/Patient"] .page-head',
        'html body[data-route="Form/Patient/New"] .page-head',
        '.page-head'
    ];
    
    // Find the first matching page head
    let $pageHead = null;
    for (const selector of pageHeadSelectors) {
        const $el = $(selector);
        if ($el.length) {
            $pageHead = $el;
            break;
        }
    }
    
    // If we found a page head, apply the styling
    if ($pageHead && $pageHead.length) {
        console.log('Found Patient form navbar, fixing it at the top');
        
        // Add a class to help identify it
        $pageHead.addClass('patient-form-fixed-navbar');
        
        // Force fixed positioning
        $pageHead.css({
            'position': 'fixed !important',
            'top': '0 !important',
            'left': '0 !important',
            'right': '0 !important',
            'width': '100% !important',
            'z-index': '9999 !important',
            'background-color': 'white !important',
            'box-shadow': '0 2px 5px rgba(0, 0, 0, 0.1) !important'
        });
        
        // Apply using attr style to override any conflicting styles with no top space
        $pageHead.attr('style', 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important; background-color: white !important; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important; margin: 0 !important; padding: 0 15px !important; height: auto !important;');
        
        // Remove any spacing in page-head-content
        $pageHead.find('.page-head-content').attr('style', 'padding: 10px 0 !important; margin: 0 !important;');
        
        // Remove spacing from page title
        $pageHead.find('.page-title').attr('style', 'padding: 0 !important; margin: 0 !important;');
        
        // Identify the page body
        const bodySelectors = [
            '.page-container[data-route^="Form/Patient"] .page-body',
            'body[data-route^="Form/Patient"] .page-body',
            '.page-body'
        ];
        
        // Find the first matching page body
        let $pageBody = null;
        for (const selector of bodySelectors) {
            const $el = $(selector);
            if ($el.length) {
                $pageBody = $el;
                break;
            }
        }
        
        // Adjust body padding to account for fixed header with minimal spacing
        if ($pageBody && $pageBody.length) {
            const headerHeight = $pageHead.outerHeight() || 45;
            $pageBody.css({
                'padding-top': headerHeight + 'px !important',
                'margin-top': '0px !important'
            });
            $pageBody.attr('style', 'padding-top: ' + headerHeight + 'px !important; margin-top: 0 !important;');
        }
        
        // Expand the form width to match the patient encounter form layout
        expandPatientFormWidth();
        
        // Also make primary buttons match the theme
        $('.btn-primary').css({
            'background-color': theme.accentColor + ' !important',
            'border-color': theme.accentColor + ' !important'
        });
        
        console.log('Patient form navbar is now fixed at the top');
    }
}

// Function to expand the patient form width to match the patient encounter form
function expandPatientFormWidth() {
    console.log('Expanding patient form width to match encounter form');
    
    // Target the form layout container
    const formSelectors = [
        '.page-container[data-route^="Form/Patient"] .form-layout',
        'body[data-route^="Form/Patient"] .form-layout',
        '.form-layout'
    ];
    
    // Find and expand the form layout
    let $formLayout = null;
    for (const selector of formSelectors) {
        const $el = $(selector);
        if ($el.length) {
            $formLayout = $el;
            break;
        }
    }
    
    if ($formLayout && $formLayout.length) {
        // Expand the form layout
        $formLayout.css({
            'width': '95% !important',
            'max-width': 'none !important',
            'margin': '0 auto !important'
        });
        
        // Force inline style to ensure it takes priority
        $formLayout.attr('style', 'width: 95% !important; max-width: none !important; margin: 0 auto !important;');
        
        // Also expand all form sections inside
        $formLayout.find('.form-section').css({
            'width': '100% !important',
            'max-width': 'none !important'
        }).attr('style', 'width: 100% !important; max-width: none !important;');
        
        // Apply specific styling to the patient demographics section
        $formLayout.find('.section-head:contains("Patient Demographics")').closest('.form-section').css({
            'width': '100% !important',
            'max-width': 'none !important'
        }).attr('style', 'width: 100% !important; max-width: none !important;');
        
        console.log('Patient form width expanded successfully');
    }
    
    // Also target any form controls to ensure they expand properly
    $('.frappe-control').css({
        'width': '100% !important',
        'max-width': 'none !important'
    });
    
    // Ensure form fields use full width too
    $('.frappe-control input, .frappe-control select, .frappe-control textarea').css({
        'width': '100% !important',
        'max-width': '100% !important'
    });
}
