// Simple Direct Navbar Enhancement
console.log('Simple navbar script loading...');

// Wait for page to be fully loaded
$(document).ready(function() {
    console.log('Simple navbar: Document ready');
    
    // Multiple initialization attempts
    setTimeout(initSimpleNavbar, 500);
    setTimeout(initSimpleNavbar, 1500);
    setTimeout(initSimpleNavbar, 3000);
});

function initSimpleNavbar() {
    // Prevent duplicate initialization
    if ($('#simple-enhanced-navbar').length > 0) {
        console.log('Simple navbar already exists');
        return;
    }
    
    console.log('Initializing simple navbar...');
    
    // Find the header and existing profile/action area
    const $headerContainer = $('.page-head, .page-header, .navbar-header').first();
    const $pageTitle = $('.page-title').first();
    const $existingActions = $('.page-head .page-actions, .page-actions, .navbar-right').first();
    
    console.log('Looking for header elements...');
    console.log('Header container found:', $headerContainer.length);
    console.log('Page title found:', $pageTitle.length);
    console.log('Existing actions found:', $existingActions.length);
    
    if ($headerContainer.length === 0) {
        console.log('Header container not found, skipping navbar initialization');
        return;
    }
    
    console.log('Found header container, integrating with existing elements...');
    
    // Empty navbar HTML - notifications and quick actions removed
    const navbarHtml = ``;
    
    // Create a container for our navbar elements - positioned on the right side
    const $navbarContainer = $('<div class="enhanced-navbar-container" style="display: flex; align-items: center; margin-left: auto; order: 999;"></div>');
    $navbarContainer.html(navbarHtml);
    
    // Integrate with existing header actions or add to header
    // Position navbar elements before profile icon to ensure profile stays at the rightmost end
    if ($existingActions.length > 0) {
        // Insert before existing actions (like profile, settings) to keep profile at the end
        $existingActions.before($navbarContainer);
        console.log('Navbar integrated with existing actions');
        
        // Ensure profile icon stays at the rightmost position
        $existingActions.css({
            'order': '1000',
            'margin-left': '15px'
        });
    } else if ($pageTitle.length > 0) {
        // Insert after page title if no existing actions
        $pageTitle.after($navbarContainer);
        console.log('Navbar inserted after page title');
    } else {
        // Append to header container as fallback
        $headerContainer.append($navbarContainer);
        console.log('Navbar appended to header container');
    }
    
    // Find and position the profile dropdown at the rightmost end
    const $profileDropdown = $('.dropdown-navbar-user, .navbar-nav .dropdown:last-child');
    if ($profileDropdown.length > 0) {
        $profileDropdown.css({
            'order': '1001',
            'margin-left': '15px',
            'position': 'relative',
            'z-index': '1002'
        });
        console.log('Profile icon positioned at rightmost end');
    }
    
    // Make sure the header has proper flex layout with search on the right
    $headerContainer.css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        'flex-wrap': 'nowrap',
        'position': 'relative',
        'width': '100%'
    });
    
    // Ensure proper spacing and alignment - position navbar items to the right
    $('.enhanced-navbar-container').css({
        'display': 'flex',
        'align-items': 'center',
        'margin-left': 'auto',
        'margin-right': '10px',
        'order': '1000',
        'flex-shrink': '0',
        'position': 'relative',
        'z-index': '1001'
    });
    
    // Hover effects and button click handlers removed - no buttons present
    
    // Initialize functionality
    initializeNavbarFunctionality();
    
    console.log('Simple navbar initialized successfully!');
}

// Floating navbar function removed as per user request

function initializeNavbarFunctionality() {
    // Functionality removed - no notifications or quick actions buttons
}

// Search functions removed as per user request

// Notifications dropdown function removed

// Quick actions menu function removed

function showSearchDropdown(query) {
    const dropdown = $('#navbar-search-dropdown');
    
    // Sample search suggestions
    const suggestions = [
        { type: 'Patient', icon: 'fa-user', text: `Search patients for "${query}"`, action: () => frappe.set_route('List', 'Patient', {'name': ['like', '%' + query + '%']}) },
        { type: 'Appointment', icon: 'fa-calendar', text: `Search appointments for "${query}"`, action: () => frappe.set_route('List', 'Patient Appointment', {'patient': ['like', '%' + query + '%']}) },
        { type: 'Practitioner', icon: 'fa-user-md', text: `Search practitioners for "${query}"`, action: () => frappe.set_route('List', 'Healthcare Practitioner', {'practitioner_name': ['like', '%' + query + '%']}) }
    ];
    
    let dropdownHtml = '';
    suggestions.forEach(item => {
        dropdownHtml += `
            <div style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; border-bottom: 1px solid #eee; transition: background-color 0.2s;" 
                 onmouseover="this.style.backgroundColor='#f8f9fa'" 
                 onmouseout="this.style.backgroundColor='transparent'"
                 onclick="${item.action.toString().replace('() => ', '')}; $('#navbar-search-dropdown').hide();">
                <i class="fa ${item.icon}" style="width: 20px; margin-right: 10px; color: #4682b4;"></i>
                ${item.text}
            </div>
        `;
    });
    
    dropdown.html(dropdownHtml).show();
}

console.log('Simple navbar script loaded successfully');
