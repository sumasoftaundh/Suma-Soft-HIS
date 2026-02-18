// Patient List Custom JS - Enforces Patient Portal Theme, Simplifies Navbar, and adds reliable Action Buttons
frappe.provide('healthcare');

// Override the Patient list settings
frappe.listview_settings['Patient'] = frappe.listview_settings['Patient'] || {};

// Store the original functions to be called later
const original_onload = frappe.listview_settings['Patient'].onload;
const original_refresh = frappe.listview_settings['Patient'].refresh;

/**
 * Main entry point for customizing the Patient list view.
 * This is called once when the list view is first loaded.
 */
frappe.listview_settings['Patient'].onload = function(listview) {
    if (original_onload) {
        original_onload(listview);
    }

    // Apply all our customizations
    applyPatientPortalTheme();
    setupSimplifiedNavbar();

    // Use a MutationObserver to reliably add action buttons whenever the list is updated.
    // This is more robust than overriding refresh or render_list.
    const observer = new MutationObserver((mutations) => {
        // We only need to know that something changed, so we can debounce the function call
        // to avoid running it too many times in a row.
        clearTimeout(listview.custom_render_timeout);
        listview.custom_render_timeout = setTimeout(() => {
            setupRowActions(listview);
        }, 50);
    });

    // Start observing the list container for any changes to its children (the rows)
    observer.observe(listview.result_area[0], { childList: true });

    // Initial setup
    setupRowActions(listview);
};

/**
 * This function is called whenever the list is manually refreshed.
 * We re-apply our customizations here to ensure they persist.
 */
frappe.listview_settings['Patient'].refresh = function(listview) {
    // Save navbar if it exists before refresh
    const $existingNavbar = $('.custom-patient-navbar').clone(true, true);
    
    // Call the original refresh function
    if (original_refresh) {
        original_refresh(listview);
    }
    
    // Re-apply our customizations
    applyPatientPortalTheme();
    
    // Give the DOM time to update after the refresh
    setTimeout(function() {
        // If we had a navbar before, try to restore it first
        if ($existingNavbar && $existingNavbar.length) {
            $('.page-head .page-actions').html('').append($existingNavbar);
            $('.page-head .page-actions').show();
        } else {
            // Otherwise set up a new one
            setupSimplifiedNavbar();
        }
        
        // Add a second timeout to ensure navbar is visible
        setTimeout(function() {
            if ($('.custom-patient-navbar').length === 0) {
                console.log('Navbar missing after refresh, re-creating...');
                setupSimplifiedNavbar();
            }
        }, 300);
    }, 150);
    
    // The observer from onload will handle re-running setupRowActions
};

/**
 * This function injects custom Edit, View, and Delete buttons into each patient row.
 * It's designed to be run multiple times, but it will only add the buttons once per row.
 */
function setupRowActions(listview) {
    listview.result_area.find('.list-row-container').each(function() {
        const $row = $(this);
        // Check if we've already added buttons to this row
        if ($row.hasClass('custom-actions-added')) {
            return; // Skip if buttons are already there
        }

        const patientName = $row.attr('data-name');
        if (!patientName) return;

        // Create a container for our custom action buttons
        const $actionsContainer = $('<div class="patient-custom-actions"></div>').css({
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '5px',
            zIndex: 10
        });

        // Define button styles for consistency
        const btnBaseStyle = { backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc' };
        const btnHoverStyle = { backgroundColor: '#e0e0e0', borderColor: '#adadad' };
        const deleteBtnStyle = { backgroundColor: '#d9534f', color: 'white', border: '1px solid #d43f3a' };
        const deleteBtnHoverStyle = { backgroundColor: '#c9302c', borderColor: '#ac2925' };

        // Create the buttons
        const $editBtn = $('<button class="btn btn-xs">').attr('title', 'Edit Patient').html('<i class="fa fa-pencil"></i>').css(btnBaseStyle);
        const $viewBtn = $('<button class="btn btn-xs">').attr('title', 'View Patient').html('<i class="fa fa-eye"></i>').css(btnBaseStyle);
        const $deleteBtn = $('<button class="btn btn-xs">').attr('title', 'Delete Patient').html('<i class="fa fa-trash"></i>').css(deleteBtnStyle);

        // Add hover effects
        $editBtn.hover(() => $editBtn.css(btnHoverStyle), () => $editBtn.css(btnBaseStyle));
        $viewBtn.hover(() => $viewBtn.css(btnHoverStyle), () => $viewBtn.css(btnBaseStyle));
        $deleteBtn.hover(() => $deleteBtn.css(deleteBtnHoverStyle), () => $deleteBtn.css(deleteBtnStyle));

        // Add click handlers
        $editBtn.on('click', (e) => { e.stopPropagation(); frappe.set_route('Form', 'Patient', patientName); });
        $viewBtn.on('click', (e) => { e.stopPropagation(); frappe.set_route('Form', 'Patient', patientName); });
        $deleteBtn.on('click', (e) => {
            e.stopPropagation();
            frappe.confirm(__('Are you sure you want to delete patient {0}?', [patientName]), () => {
                frappe.model.delete_doc('Patient', patientName, () => listview.refresh());
            });
        });

        // Add buttons to the container and add it to the row
        $actionsContainer.append($editBtn, $viewBtn, $deleteBtn);
        $row.css('position', 'relative').append($actionsContainer).addClass('custom-actions-added');
    });
}

/**
 * Applies the 'Patient Portal' theme to the list view.
 */
function applyPatientPortalTheme() {
    const theme = {
        backgroundColor: '#f5f7fa',
        panelBgColor: '#ffffff',
        accentColor: '#4682b4',
        textColor: '#333333',
        lightText: '#ffffff'
    };

    $('body, .layout-main-section').css('background-color', theme.backgroundColor);

    $('.list-row-head').css({
        backgroundColor: theme.accentColor,
        color: theme.lightText,
        borderRadius: '6px 6px 0 0'
    });

    $('.list-row-head .list-subject, .list-row-head .level-item, .list-row-head .list-col').css('color', theme.lightText);

    $('.filter-list, .filter-section, .list-filters').css({
        backgroundColor: theme.panelBgColor,
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    });
}

/**
 * Hides the default Frappe navbar buttons and adds our custom, simplified icons.
 */
function setupSimplifiedNavbar() {
    // Force the page-head and page-actions to be visible
    $('.page-head').show();
    $('.page-head .page-actions').show();
    
    // Ensure page-actions has proper styling
    $('.page-head .page-actions').css({
        'display': 'flex',
        'visibility': 'visible',
        'opacity': '1'
    });
    
    // Hide other default header buttons and actions
    $('.page-head .custom-actions-menu-btn, .page-head .menu-btn-group').hide();

    // Check if our custom navbar already exists
    if ($('.custom-patient-navbar').length > 0) {
        return; // Already set up
    }

    const theme = { accentColor: '#4682b4', lightText: '#ffffff' };

    // Create a container for our custom icons
    const $navbarContainer = $('<div class="custom-patient-navbar"></div>').css({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'absolute',
        top: '8px',
        right: '15px'
    });

    // Create the icon buttons
    const $addPatientIcon = $('<button class="btn btn-default">').attr('aria-label', 'Add Patient').html('Add Patient');
    const $refreshIcon = $('<button class="btn btn-default">').attr('aria-label', 'Refresh').html('<i class="fa fa-refresh"></i>');

    // Style the icons
    [$addPatientIcon, $refreshIcon].forEach(($icon, index) => {
        $icon.css({
            backgroundColor: index === 0 ? theme.accentColor : '#f8f9fa', // Blue for add, light for refresh
            borderColor: index === 0 ? theme.accentColor : '#dee2e6',
            color: index === 0 ? theme.lightText : '#333',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        });
    });

    // Add hover effects
    $refreshIcon.css({
        'align-items': 'center',
        'justify-content': 'center',
        'margin-left': '10px',
        'position': 'relative',
        'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.2)'
    });
    
    // Add hover effect to add patient icon
    $addPatientIcon.hover(
        function() { $(this).css('background-color', '#3a6d97'); },  // Darker steel blue on hover
        function() { $(this).css('background-color', theme.accentColor); }  // Return to normal
    );
    
    // Add hover effect to refresh icon
    $refreshIcon.hover(
        function() { $(this).css('background-color', '#e9ecef'); },  // Slightly darker on hover
        function() { $(this).css('background-color', '#f8f9fa'); }  // Return to normal
    );
    
    // Create consistent tooltip style function
    function createTooltip(text) {
        const $tooltip = $('<div class="btn-tooltip">' + text + '</div>');
        $tooltip.css({
            'position': 'absolute',
            'top': '-30px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background-color': '#333',
            'color': '#fff',
            'padding': '4px 10px',
            'border-radius': '4px',
            'font-size': '12px',
            'white-space': 'nowrap',
            'z-index': 1000,
            'opacity': 0,
            'transition': 'opacity 0.2s ease',
            'pointer-events': 'none',
            'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
        });
        return $tooltip;
    }
    
    // Add tooltip functionality to Add Patient button
    $addPatientIcon.on('mouseenter', function() {
        const $tooltip = createTooltip('Add Patient');
        $(this).append($tooltip);
        setTimeout(() => $tooltip.css('opacity', 1), 10);
    }).on('mouseleave', function() {
        $(this).find('.btn-tooltip').remove();
    });
    
    // Add tooltip functionality to Refresh button
    $refreshIcon.on('mouseenter', function() {
        const $tooltip = createTooltip('Refresh List');
        $(this).append($tooltip);
        setTimeout(() => $tooltip.css('opacity', 1), 10);
    }).on('mouseleave', function() {
        $(this).find('.btn-tooltip').remove();
    });
    
    // Set click actions
    $addPatientIcon.on('click', function() {
        frappe.new_doc('Patient');
    });
    
    $refreshIcon.on('click', function() {
        // Refresh list and ensure visibility
        if (cur_list) {
            // First, save a reference to the custom navbar
            const $savedNavbarContainer = $('.custom-patient-navbar').detach();
            
            // Force a direct data load rather than just refresh
            if (typeof cur_list.get_data === 'function') {
                cur_list.get_data().then(() => {
                    if (typeof cur_list.render_list === 'function') {
                        cur_list.render_list();
                    }
                    
                    // Re-apply navbar and ensure it's visible
                    setTimeout(() => {
                        // If the navbar was removed during refresh, re-initialize it
                        if ($savedNavbarContainer && $savedNavbarContainer.length) {
                            $('.page-head .page-actions').html('').append($savedNavbarContainer);
                            $('.page-head .page-actions').show();
                        } else {
                            // If detaching failed, re-initialize completely
                            setupSimplifiedNavbar();
                        }
                        ensureListIsVisible();
                    }, 200);
                });
            } else {
                cur_list.refresh();
                
                // Re-apply navbar after refresh with a delay
                setTimeout(() => {
                    // If the navbar was removed during refresh, re-initialize it
                    if ($savedNavbarContainer && $savedNavbarContainer.length) {
                        $('.page-head .page-actions').html('').append($savedNavbarContainer);
                        $('.page-head .page-actions').show();
                    } else {
                        // If detaching failed, re-initialize completely
                        setupSimplifiedNavbar();
                    }
                    ensureListIsVisible();
                }, 300);
            }
        }
    });
    
    // Add everything to the navbar
    $navbarContainer.append($addPatientIcon);
    $navbarContainer.append($refreshIcon);
    
    // Hide all standard buttons and replace with our custom navbar
    $('.page-head .page-title .title-text').css('margin-right', '10px');
    $('.page-head .page-actions').html('').append($navbarContainer);
    
    // Also hide any other potential actions and ensure our customizations persist
    setTimeout(function() {
        $('.page-head button:not(.add-patient-icon):not(.refresh-icon)').hide();
        $('.page-head .btn-group').hide();
        $('.page-head .standard-actions, .page-head .custom-actions').hide();
        
        // Make sure our buttons are visible and properly positioned
        $('.add-patient-icon, .refresh-icon').show();
        $('.add-patient-icon').css('position', 'relative');
        $('.refresh-icon').css('position', 'relative');
        
        // This helps with Frappe's dynamic UI that might try to re-render elements
        $('.page-head .page-actions').html('').append($navbarContainer);
        
        // Force patient data to load every time the navbar is set up
        if (cur_list) {
            try {
                if (typeof cur_list.get_data === 'function') {
                    cur_list.get_data().then(() => {
                        if (typeof cur_list.render_list === 'function') {
                            cur_list.render_list();
                        }
                    });
                } else {
                    cur_list.refresh();
                }
            } catch (e) {
                console.warn('Error refreshing patient list:', e);
            }
        }
    }, 50);
    
    // Handle Frappe's refresh events that might reset our customizations
    $(document).on('list_render', function() {
        setTimeout(setupSimplifiedNavbar, 100);
    });
    
    // Style all primary buttons
    $('.btn-primary').css({
        'background-color': theme.accentColor,
        'border-color': theme.accentColor,
        'color': theme.lightText
    });
    
    // Style the list header
    $('.list-row-head').css({
        'background-color': theme.accentColor,
        'color': theme.lightText,
        'border-radius': '6px 6px 0 0'
    });
    
    // Make sure header text is white
    $('.list-row-head .list-subject, .list-row-head .level-item, .list-row-head .list-col').css({
        'color': theme.lightText
    });
    
    // Style filter area
    $('.filter-list, .filter-section, .list-filters').css({
        'background-color': theme.panelBgColor,
        'border-radius': '8px 8px 0 0',
        'box-shadow': '0 1px 3px rgba(0,0,0,0.1)'
    });
}
