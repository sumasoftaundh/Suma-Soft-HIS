
// Refresh the dashboard when the page is shown
frappe.pages['doctor_dashboard'].add_dashboard_footer = function(page) {
    // Remove any existing footer to prevent duplicates
    $('.reception-dashboard-footer').remove();

    // Get current year and user info
    const currentYear = new Date().getFullYear();
    const user = frappe.session.user;
    const sitename = frappe.boot.sitename || 'Healthcare App';
    const version = frappe.boot.version || '1.0.0';

    // Create footer - further simplified structure with less padding
    const footer_html = `
        <footer class="reception-dashboard-footer">
            <div class="footer-main-content">
                <div class="footer-column">
                    <h5>Site Information</h5>
                    <ul>
                        <li><i class="fa fa-user"></i> ${frappe.session.user_fullname || frappe.session.user}</li>
                        <li><i class="fa fa-building"></i> ${frappe.defaults.get_default('Company') || 'Suma Health'}</li>
                        <li id="footer-user-roles"><i class="fa fa-shield"></i> ${frappe.session.user_roles && Array.isArray(frappe.session.user_roles) ? frappe.session.user_roles.join(', ') : 'User'}</li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h5>Useful Links</h5>
                    <ul>
                        <li><a href="/app/patient-appointment"><i class="fa fa-calendar"></i> All Appointments</a></li>
                        <li><a href="/app/patient"><i class="fa fa-users"></i> Patient List</a></li>
                        <li><a href="/app/healthcare-practitioner"><i class="fa fa-user-md"></i> Practitioners</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h5>Resources</h5>
                    <ul>
                        <li><a href="#"><i class="fa fa-book"></i> Documentation</a></li>
                        <li><a href="#"><i class="fa fa-question-circle"></i> Help Center</a></li>
                        <li><a href="#"><i class="fa fa-comments"></i> Support</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h5>Social</h5>
                    <div class="social-links">
                        <a href="#" class="social-icon"><i class="fa fa-facebook"></i></a>
                        <a href="#" class="social-icon"><i class="fa fa-twitter"></i></a>
                        <a href="#" class="social-icon"><i class="fa fa-linkedin"></i></a>
                        <a href="#" class="social-icon"><i class="fa fa-youtube"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="copyright">  ${new Date().getFullYear()} Suma Health. All rights reserved.</div>
            </div>
        </footer>
    `;

    // CSS for the footer
    const footer_style = `
        .reception-dashboard-footer {
            background-color: #f2f5fa;
            color: #444;
            font-size: 13px;
            padding: 8px 0;
            margin-top: 8px;
            border-top: 1px solid #e1e8f0;
            width: 100%;
        }
        .footer-main-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding: 6px;
        }
        .footer-column {
            flex: 1;
            padding: 0 8px;
            min-width: 180px;
        }
        .footer-column h5 {
            font-weight: bold;
            color: #343a40; /* Darker heading */
            margin-bottom: 15px;
        }
        .footer-column ul {
            list-style: none;
            padding: 0;
        }
        .footer-column ul li {
            margin-bottom: 8px;
        }
        .footer-column a {
            color: #495057;
            text-decoration: none;
        }
        .footer-column a:hover {
            color: #007bff; /* Primary blue on hover */
            text-decoration: underline;
        }
        .social-links a {
            font-size: 24px;
            margin-right: 15px;
        }
        .powered-by {
            margin-top: 15px;
        }
        .powered-by p {
            margin: 0;
            font-size: 12px;
        }
    `;

    // Append style and HTML to the page
    if ($('#reception-dashboard-footer-styles').length === 0) {
        $('head').append('<style id="reception-dashboard-footer-styles">' + footer_style + '</style>');
    }
    $(page.body).append(footer_html);

    // Safely populate user roles, handling race condition
    if (frappe.session.user_roles && Array.isArray(frappe.session.user_roles)) {
        $('#footer-user-roles').html('<i class="fa fa-shield"></i> ' + (frappe.session.user_roles ? frappe.session.user_roles.join(', ') : 'User'));
    } else {
        // Retry after a short delay, as session data might still be loading
        setTimeout(() => {
            if (frappe.session.user_roles && Array.isArray(frappe.session.user_roles)) {
                $('#footer-user-roles').html('<i class="fa fa-shield"></i> ' + (frappe.session.user_roles ? frappe.session.user_roles.join(', ') : 'User'));
            } else {
                $('#footer-user-roles').html('<i class="fa fa-shield"></i> Could not load roles.');
            }
        }, 1500);
    }
};

frappe.pages['doctor_dashboard'].on_page_show = function() {
    frappe.doctor_dashboard.refresh_data();
};

frappe.pages['doctor_dashboard'].on_page_load = function(wrapper) {
    // Add the glass effect CSS
    frappe.require('/assets/suma_health/css/doctor_dashboard.css');

    // Add splash screen effect if available
    if (typeof showLoadingSplash === 'function') {
        showLoadingSplash();
    }
    let user_name = frappe.session.user_fullname || frappe.session.user;
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Hi, ' + user_name,  // Empty title, we'll set custom greeting
        single_column: true
    });

    // Add the container class for the glass effect
    $(page.wrapper).find('.page-content').addClass('doctor-dashboard-container');
    
    // // Get current user's name
    // const userFullName = frappe.session.user_fullname;
    // const firstName = userFullName.split(' ')[0];
    
    // // Create custom greeting title with professional styling
    // const currentTime = new Date();
    // const hour = currentTime.getHours();
    // let greeting = "Welcome";
    
    // // Time-appropriate greeting
    // if (hour < 12) {
    //     greeting = "Good morning";
    // } else if (hour < 18) {
    //     greeting = "Good afternoon";
    // } else {
    //     greeting = "Good evening";
    // }
    
    // const $customTitle = $(`
    //     <div class="professional-greeting">
    //         <div class="greeting-text">${greeting},</div>
    //         <div class="user-name">${firstName}</div>
    //     </div>
    // `);
    
    // // Add the custom title to the page header
    // setTimeout(() => {
    //     $('.page-title h3').first().empty().append($customTitle);
    // }, 100);
    
    frappe.doctor_dashboard = frappe.doctor_dashboard || {};
    
    // Setup navbar action buttons - responsive for all mobile views
    function setup_action_buttons() {
        // Add action buttons for quick actions
        const $btnGroup = $(`<div class="reception-buttons"></div>`);
        
        // Add new consultation button
        const $newConsultationBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn btn-new-consultation" title="New Consultation" aria-label="Create new consultation">
            <i class="fa fa-stethoscope"></i>
        </button>`).on('click', function() {
            frappe.new_doc('Patient Encounter');
        });
        $btnGroup.append($newConsultationBtn);
        
        // Add Order Lab Test button
        const $labTestBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn btn-lab-test" title="Order Lab Test" aria-label="Order lab test">
            <i class="fa fa-flask"></i>
        </button>`).on('click', function() {
            frappe.new_doc('Lab Test');
        });
        $btnGroup.append($labTestBtn);
        
        // Add Write Prescription button
        const $prescriptionBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn btn-prescription" title="Write Prescription" aria-label="Write prescription">
            <i class="fa fa-book"></i>
        </button>`).on('click', function() {
            frappe.new_doc('Drug Prescription');
        });
        $btnGroup.append($prescriptionBtn);
        
        // Add Record Vitals button
        const $vitalsBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn btn-vitals" title="Record Vitals" aria-label="Record vital signs">
            <i class="fa fa-heartbeat"></i>
        </button>`).on('click', function() {
            frappe.new_doc('Vital Signs');
        });
        $btnGroup.append($vitalsBtn);
        
        // Add refresh button
        const $refreshBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn btn-refresh" title="Refresh Dashboard" aria-label="Refresh dashboard">
            <i class="fa fa-refresh"></i>
        </button>`).on('click', function() {
            frappe.doctor_dashboard.refresh_data();
        });
        
        // Add the button group to the page header with mobile-specific class
        $('.page-head .page-actions').prepend($btnGroup);
        $btnGroup.addClass('desktop-only-buttons');
        
        // Add hamburger menu for mobile views
        const $mobileMenuBtn = $(`<button class="btn btn-primary btn-sm mobile-menu-btn reception-icon-btn" title="Menu" aria-label="Menu">
            <i class="fa fa-bars"></i>
        </button>`).on('click', function() {
            // Toggle mobile navigation
            $('.mobile-nav-overlay').toggleClass('active');
        });
        
        // Create mobile navigation overlay
        if ($('.mobile-nav-overlay').length === 0) {
            const $mobileNav = $(`<div class="mobile-nav-overlay">
                <div class="mobile-nav-container">
                    <div class="mobile-nav-header">
                        <div class="mobile-nav-title">Doctor Dashboard</div>
                        <button class="close-nav"><i class="fa fa-times"></i></button>
                    </div>
                    <div class="mobile-nav-items">
                        <a href="#" class="mobile-nav-item" data-action="profile">
                            <i class="fa fa-user"></i> Profile
                        </a>
                        <a href="#" class="mobile-nav-item" data-action="search">
                            <i class="fa fa-search"></i> Search
                        </a>
                        <a href="#" class="mobile-nav-item" data-action="new-consultation">
                            <i class="fa fa-stethoscope"></i> New Consultation
                        </a>
                        <a href="#" class="mobile-nav-item" data-action="refresh">
                            <i class="fa fa-refresh"></i> Refresh Dashboard
                        </a>
                    </div>
                </div>
            </div>`);
            
            // Close button functionality
            $mobileNav.find('.close-nav').on('click', function() {
                $('.mobile-nav-overlay').removeClass('active');
            });
            
            // Setup mobile nav item clicks
            $mobileNav.find('.mobile-nav-item').on('click', function(e) {
                e.preventDefault();
                const action = $(this).data('action');
                
                // Close the mobile navigation
                $('.mobile-nav-overlay').removeClass('active');
                
                // Perform action based on data-action
                if (action === 'profile') {
                    frappe.set_route('user-profile');
                } else if (action === 'search') {
                    frappe.ui.toolbar.search.show();
                } else if (action === 'new-consultation') {
                    frappe.new_doc('Patient Encounter');
                } else if (action === 'refresh') {
                    if (frappe.doctor_dashboard && typeof frappe.doctor_dashboard.refresh_data === 'function') {
                        frappe.doctor_dashboard.refresh_data();
                    } else {
                        location.reload();
                    }
                }
            });
            
            // Add to body
            $('body').append($mobileNav);
            
            // Add mobile menu button to header - on left side in mobile view
            $('.page-head .page-actions').prepend($mobileMenuBtn);
            // Add CSS class for positioning
            $mobileMenuBtn.addClass('mobile-menu-left');
        }
    }
        // Apply styling to search and profile buttons
    function style_navbar_icons() {
        // Update search button and add functionality
        $('.search-btn')
            .addClass('reception-icon-btn')
            .attr('title', 'Search')
            .removeClass('btn-default icon-btn')
            .off('click')
            .on('click', function() {
                frappe.ui.toolbar.search.show();
            });
            
        // Update profile button with animated avatar - enhanced visibility
        $('.page-head .profile-btn, .navbar .profile-btn')
            .addClass('reception-icon-btn animated-avatar')
            .attr('title', 'Profile')
            .removeClass('btn-default icon-btn')
            .css({
                'display': 'flex !important',
                'visibility': 'visible !important',
                'opacity': '1 !important',
                'z-index': '999',
                'position': 'relative',
                'overflow': 'visible'
            });
        
        // Create animated avatar
        const userName = frappe.session.user_fullname || frappe.session.user;
        const userInitial = userName.charAt(0).toUpperCase();
        const avatarColor = '#4682b4'; // Using steel blue as per theme
        
        // Use a more specific selector and ensure the avatar is visible
        setTimeout(function() {
            $('.page-head .profile-btn .avatar, .navbar .profile-btn .avatar')
                .html(`
                    <div class="animated-avatar-inner">
                        <span class="avatar-text">${userInitial}</span>
                        <div class="avatar-ring"></div>
                    </div>
                `)
                .css({
                    'background-color': avatarColor,
                    'display': 'flex !important',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'position': 'relative',
                    'overflow': 'visible',
                    'z-index': '999',
                    'border-radius': '50%',
                    'width': '36px',
                    'height': '36px',
                    'visibility': 'visible !important',
                    'opacity': '1 !important'
                });
        }, 100); // Small delay to ensure DOM is ready
        
        // Handle the mobile responsiveness for the navbar
        $(window).on('resize', function() {
            adjustNavbarForScreenSize();
        });
        
        // Initial call for screen size adjustment
        adjustNavbarForScreenSize();
        
        function adjustNavbarForScreenSize() {
            const windowWidth = $(window).width();
            
            if (windowWidth <= 768) {
                $('.page-head-content').addClass('mobile-view');
                $('.mobile-menu-btn').css('display', 'flex');
                // Move buttons to make them more accessible on mobile
                rearrangeMobileButtons();
            } else {
                $('.page-head-content').removeClass('mobile-view');
                $('.mobile-menu-btn').css('display', 'none');
                // Reset button arrangement
                resetButtonArrangement();
            }
        }
        
        // Function to optimize button arrangement for mobile view
        function rearrangeMobileButtons() {
            // Ensure buttons have proper spacing and order
            $('.reception-buttons').css({
                'display': 'flex',
                'justify-content': 'center',
                'margin-top': '8px'
            });
        }
        
        // Function to reset button arrangement
        function resetButtonArrangement() {
            $('.reception-buttons').css({
                'display': '',
                'justify-content': '',
                'margin-top': ''
            });
        }
    }
    
    // Apply navbar styling with delay to ensure DOM is ready
    setTimeout(() => {
        setup_action_buttons();
        style_navbar_icons();
        
        // Fix navbar spacing
        $('.page-head-content')
            .addClass('row flex-nowrap align-center justify-between')
            .css('padding-top', '0');
    }, 300);
    
    // Add action buttons under the navbar
    frappe.run_serially([
        () => frappe.timeout(0.5), // Increased timeout for reliability
        () => {
            // Clear any existing custom buttons
            $('.custom-header-buttons').remove();
            
            // Create container for custom buttons - positioned on the right side
            const $buttonContainer = $('<div class="custom-header-buttons" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0 10px 0; justify-content: flex-end;"></div>');
            
            // Add the button container to the page
            $(page.main).prepend($buttonContainer);
            
            // Create buttons with clear labels - using the Patient Portal theme
            // Removed Order Lab Test, Write Prescription, and Record Vitals buttons from UI (kept in navbar)
            const buttons = [
                // No buttons in the custom header area
            ];
            
            buttons.forEach(btn => {
                const $button = $('<button class="btn btn-default action-btn" style="margin-right: 8px; margin-bottom: 8px;">' +
                    '<i class="' + btn.icon + ' mr-2"></i> ' + __(btn.label) +
                    '</button>');
                
                $button.click(() => {
                    frappe.new_doc(btn.action);
                });
                
                $button.appendTo($buttonContainer);
            });
        }
    ]);
    
    // Add CSS
    frappe.doctor_dashboard.add_css = function() {
        // Custom style for header buttons to match steel blue theme
        $('.custom-primary-actions .btn-primary').css({
            'background-color': '#4682b4',
            'border-color': '#4682b4',
            'margin-left': '10px'
        });
        
        // Add comprehensive styling to match reception dashboard
        // Add consistent color variables for the healthcare system
        $('<style>' +
            ':root {' +
            '    --primary-color: #4682b4; /* Steel blue as per theme */' +
            '    --primary-hover: #3a6d96; /* Darker steel blue for hover */' +
            '    --success: #4caf50;' +
            '    --info: #03a9f4;' +
            '    --warning: #ff9800;' +
            '    --danger: #f44336;' +
            '    --secondary: #666666;' +
            '    --white: #ffffff;' +
            '    --black: #000000;' +
            '    --purple-card: #f1eaff;' +
            '    --blue-card: #e9f5ff;' +
            '    --yellow-card: #f6ff9a;' +
            '    --yellow-bright: #fcff64;' +
            '    --light-gray: #f5f7fa; /* Light gray as per theme */' +
            '    --font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
            '}' +
        '</style>').appendTo('head');
        $('<style>' +
            /* Navbar and general styling */
            '.page-head { background-color: white !important; border-bottom: 1px solid #eaeaea; padding: 0 !important; margin: 0 !important; position: fixed !important; top: 0 !important; left: 102px !important; right: 0 !important; transition: all 0.3s; box-sizing: border-box; }' +
            '.sidebar-toggle-btn, #navbar-breadcrumbs { display: none !important; }' +
            '.navbar .navbar-home { position: fixed; top: 0; left: 0; width: 80px; z-index: 10000; }' +
            '.page-container { padding-top: 40px !important; padding-left: 0 !important; margin-left: 0 !important; }' +
            '.layout-side-section { position: fixed !important; top: 0 !important; left: 0 !important; height: 100vh !important; width: 60px !important; z-index: 10001 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }' +
            '.desk-sidebar { width: 60px !important; }' +
            '.layout-main-section-wrapper { margin-left: 0 !important; }' +
            '.page-title { padding-left: 0 !important; }' +
            '.layout-main { padding-left: 0 !important; }' +
            
            /* Dashboard Main Styles - Clean Background */
            '#doctor-dashboard { padding: 24px 16px; background: #f5f7fa; font-family: var(--font-family); }' +
            
            /* Stats Card Layout - Clean Design */
            '.stats-card-container { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-bottom: 20px; width: 100%; }' +
            '.dashboard-card-title { margin: 0; font-weight: 600; white-space: nowrap; }' +
            '.stats-icon { font-size: 20px; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; color: var(--black); }' +
            '.stats-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 15px; margin-bottom: 24px; }' +
            '.stats-card { background-color: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 15px 18px; position: relative; flex: 1; min-width: 0; margin-right: 0; transition: all 0.2s ease; }' +
            '.stats-card:hover { transform: translateY(-3px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }' +
            '.stats-card:nth-child(1) { background: #f1eaff; }' + /* Light purple */
            '.stats-card:nth-child(2) { background: #e9f5ff; }' + /* Light blue */
            '.stats-card:nth-child(3) { background: #f6ff9a; }' + /* Light yellow */
            '.stats-card:nth-child(4), .stats-card:nth-child(5) { background: white; }' + /* White for other cards */
            '.stats-title { font-size: 13px; font-weight: 500; color: #666666; margin-top: 8px; margin-bottom: 3px; }' +
            '.stats-value { font-size: 24px; font-weight: 700; color: var(--black); margin: 0; }' +
            
            /* Dashboard Card Styles - Clean Design */
            '.dashboard-card { background-color: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 15px; margin-bottom: 20px; position: relative; }' +
            '.dashboard-card:hover { transform: translateY(-2px); box-shadow: 0 3px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; }' +
            '.dashboard-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }' +
            '.dashboard-card-header h3 { font-size: 16px; font-weight: 600; color: var(--black); margin: 0; }' +
            '.dashboard-card-header .actions { display: flex; gap: 8px; }' +
            '.dashboard-card-header .actions button { background: #f5f7fa; border: 1px solid #eaeaea; border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; }' +
            '.dashboard-card-header .actions button:hover { background: #eaeaea; }' +
            '.dashboard-card-body { padding: 20px; overflow-x: auto; background-color: rgba(255, 255, 255, 0.5); }' +
            
            /* Table Styles - Clean Design */
            '.dashboard-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 15px; }' +
            '.dashboard-table th { background: #f5f7fa; text-align: left; padding: 12px 15px; font-size: 13px; font-weight: 600; color: var(--black); border-bottom: 1px solid #eaeaea; }' +
            '.dashboard-table td { padding: 12px 15px; font-size: 13px; border-bottom: 1px solid #eaeaea; color: var(--black); background: white; }' +
            '.dashboard-table tr:hover td { background: #f9f9f9; }' +
            '.dashboard-table tr:last-child td { border-bottom: none; }' +
            '.empty-state { text-align: center; padding: 30px 20px; color: #666; }' +
            
            /* Doctor Status Cards - Clean Design */
            '.doctor-status-card { display: flex; align-items: center; background: white; border-radius: 16px; padding: 15px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }' +
            '.doctor-status-card:hover { transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); }' +
            '.doctor-status-card .doctor-info { flex-grow: 1; }' +
            '.doctor-status-card .doctor-name { font-size: 14px; font-weight: 600; margin: 0 0 5px 0; }' +
            '.doctor-status-card .doctor-department { font-size: 12px; color: #666; margin: 0; }' +
            '.doctor-status-card .status { background: #f5f7fa; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }' +
            '.doctor-status-card .status.available { background: #e8f5e9; color: #2e7d32; }' +
            '.doctor-status-card .status.unavailable { background: #ffebee; color: #c62828; }' +
            '.not-scheduled { background: #ffebee; color: #c62828; border-radius: 20px; padding: 5px 12px; font-size: 12px; display: inline-block; }' +
            '.doctor-status-card .status.busy { background: #fff3e0; color: #ef6c00; }' +
            
            /* Filter Styles */
            '.filter-container { display: flex; flex-direction: row; align-items: center; gap: 8px; flex-grow: 1; }' +
            '.filter-select { flex: 1; min-width: 90px; max-width: 140px; font-size: 12px; height: 30px; padding: 0 8px; border-radius: 4px; border-color: #e0e0e0; background-color: #f9f9f9; }' +
            
            /* Button Styling - Clean Design */
            '.doctor-buttons .btn { margin-right: 5px; background-color: #4682b4; border-color: transparent; color: var(--white); border-radius: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }' +
            '.doctor-buttons .btn:hover { background-color: #3a6d96; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); }' +
            '.doctor-buttons .btn:active { transform: translateY(0); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }' +
            '.doctor-buttons .btn-sm { padding: 0.2rem 0.6rem; font-size: 0.75rem; }' +
            
            /* Status Styles - Clean Design */
            '.status-pill { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 500; text-align: center; }' +
            '.status-scheduled { background-color: #e3f2fd; color: #0277bd; }' +
            '.status-checked-in { background-color: #fff3e0; color: #ef6c00; }' +
            '.status-in-progress { background-color: #f3e5f5; color: #7b1fa2; }' +
            '.status-completed { background-color: #e8f5e9; color: #2e7d32; }' +
            '.status-cancelled { background-color: #ffebee; color: #c62828; }' +
            '.status-absent { background-color: #f5f5f5; color: #616161; }' +
            
            /* Doctor Status Cards - Clean Design */
            '.doctor-card { background-color: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); padding: 15px; margin-bottom: 15px; display: flex; position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease; }' +
            '.doctor-card:hover { transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); }' +
            '.doctor-card-left { margin-right: 15px; }' +
            '.doctor-card-right { flex-grow: 1; }' +
            '.doctor-name { font-size: 16px; font-weight: 600; margin-bottom: 2px; color: var(--black); }' +
            '.doctor-specialty { font-size: 13px; color: #666666; margin-bottom: 8px; }' +
            '.doctor-info { font-size: 13px; color: #666666; margin-bottom: 3px; }' +
            '.doctor-availability { display: flex; align-items: center; margin-top: 10px; }' +
            '.doctor-availability .status-indicator { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }' +
            '.doctor-availability .status-indicator.available { background-color: #4caf50; }' +
            '.doctor-availability .status-indicator.unavailable { background-color: #f44336; }' +
            '.doctor-availability .status-indicator.busy { background-color: #ff9800; }' +
            '.doctor-availability .status-text { font-size: 13px; font-weight: 500; }' +
            '.doctor-availability .status-text.available { color: #2e7d32; }' +
            '.doctor-availability .status-text.unavailable { color: #c62828; }' +
            '.doctor-availability .status-text.busy { color: #ef6c00; }' +
            '.not-scheduled { background: #ffebee; color: #c62828; border-radius: 20px; padding: 5px 12px; font-size: 12px; display: inline-block; }' +
            
            /* Appointment Card Styles - Clean Design */
            '.appointment-card { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); padding: 15px; margin-bottom: 15px; position: relative; transition: all 0.2s ease; }' +
            '.appointment-card:hover { transform: translateY(-2px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); }' +
            '.appointment-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }' +
            '.appointment-time { font-size: 14px; font-weight: 600; color: #4682b4; }' +
            '.appointment-patient { font-size: 15px; font-weight: 600; margin-bottom: 5px; }' +
            '.appointment-type { font-size: 13px; color: #666666; margin-bottom: 8px; }' +
            '.appointment-actions { margin-top: 10px; display: flex; justify-content: flex-end; }' +
            
            /* Media queries for responsive design */
            '@media (max-width: 1024px) { ' +
                '.layout-side-section { width: 0 !important; } ' +
                '.page-head { left: 0 !important; width: 100% !important; } ' +
                '.layout-main-section-wrapper { margin-left: 0 !important; } ' +
                '.stats-card-container { flex-direction: column; } ' +
            '}' +
            '@media (max-width: 768px) { ' +
                '.page-head-content { height: auto !important; min-height: 58px; padding: 8px 10px !important; flex-wrap: wrap !important; } ' +
                '.page-title { width: 100% !important; margin-bottom: 8px !important; text-align: center !important; } ' +
                '.page-actions { width: 100% !important; justify-content: center !important; padding: 0 !important; position: relative !important; } ' +
                '.professional-greeting { width: 100% !important; justify-content: left !important; padding: 8px 0; }' +
                '.dashboard-card-header { flex-direction: column; align-items: flex-start; }' +
                '.header-with-icon { margin-bottom: 10px; margin-right: 0; }' +
                '.header-right { width: 100%; }' +
                '.filter-container { flex-wrap: wrap; gap: 8px; }' +
                '.filter-select { min-width: 0; width: 100%; max-width: none; margin-bottom: 5px; }' +
                '.greeting-text, .user-name { font-size: 15px; text-align: center; display: inline-block; margin-bottom: 0; }' +
            '}' +
            '@media (max-width: 480px) { ' +
                '.professional-greeting { width: 100% !important; flex-direction: row; }' +
                '.greeting-text, .user-name { font-size: 14px; margin: 0 2px; }' +
            '}' +
            
            /* Icon buttons styling */
            '.reception-buttons .btn { margin-right: 8px; }' +
            '.reception-icon-btn, .page-head .search-btn.reception-icon-btn, .page-head .profile-btn.reception-icon-btn { ' +
                'padding: 6px 10px; margin-right: 5px; background-color: #4682b4 !important; border-color: #4682b4 !important; ' +
                'border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; ' +
                'transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); color: white !important; ' +
            '}' +
            '.reception-icon-btn:hover, .page-head .search-btn.reception-icon-btn:hover, .page-head .profile-btn.reception-icon-btn:hover { ' +
                'background-color: #3a6d96 !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); ' +
            '}' +
            '.reception-icon-btn i { font-size: 15px; line-height: 1; color: white; }' +
            '.page-head .search-btn.reception-icon-btn .icon { stroke: white !important; }' +
            
            /* Animated avatar styling */
            '.page-head .profile-btn.reception-icon-btn, .navbar .profile-btn.reception-icon-btn { overflow: visible !important; z-index: 999 !important; visibility: visible !important; opacity: 1 !important; display: flex !important; }' +
            '.page-head .profile-btn.reception-icon-btn .avatar, .navbar .profile-btn.reception-icon-btn .avatar { ' +
                'width: 36px !important; height: 36px !important; transition: transform 0.3s ease, box-shadow 0.3s ease; ' +
                'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); ' +
            '}' +
            '.animated-avatar-inner { ' +
                'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; ' +
                'position: relative; border-radius: 50%; overflow: hidden; ' +
            '}' +
            '.avatar-text { color: white; font-weight: 600; font-size: 18px; z-index: 2; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }' +
            '.avatar-ring { ' +
                'position: absolute; top: -5%; left: -5%; width: 110%; height: 110%; border-radius: 50%; ' +
                'border: 2px solid rgba(255, 255, 255, 0.7); box-sizing: border-box; opacity: 0; z-index: 1; ' +
                'animation: pulse 2s infinite; ' +
            '}' +
            '@keyframes pulse { ' +
                '0% { transform: scale(0.9); opacity: 0; } ' +
                '50% { opacity: 0.5; } ' +
                '100% { transform: scale(1.3); opacity: 0; } ' +
            '}' +
            '.page-head .profile-btn.reception-icon-btn:hover .avatar, .navbar .profile-btn.reception-icon-btn:hover .avatar { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); visibility: visible !important; opacity: 1 !important; display: flex !important; }' +
            
            /* Mobile navigation styling */
            '.mobile-menu-btn { display: none !important; }' +
            '@media (max-width: 768px) { .mobile-menu-btn { display: flex !important; } }' +
            '.mobile-nav-overlay {' +
                'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);' +
                'z-index: 9999; display: flex; justify-content: flex-end; visibility: hidden; opacity: 0;' +
                'transition: all 0.3s ease;' +
            '}' +
            '.mobile-nav-overlay.active { visibility: visible; opacity: 1; }' +
            '.mobile-nav-container {' +
                'width: 75%; max-width: 300px; height: 100%; background-color: white; transform: translateX(100%);' +
                'transition: transform 0.3s ease; display: flex; flex-direction: column; box-shadow: -2px 0 10px rgba(0,0,0,0.2);' +
            '}' +
            '.mobile-nav-overlay.active .mobile-nav-container { transform: translateX(0); }' +
            '.mobile-nav-header {' +
                'background-color: #4682b4; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;' +
            '}' +
            '.mobile-nav-title { font-size: 18px; font-weight: 500; }' +
            '.mobile-nav-header .close-nav {' +
                'background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 5px;' +
                'width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;' +
                'border-radius: 50%; transition: background-color 0.2s;' +
            '}' +
            '.mobile-nav-header .close-nav:hover { background-color: rgba(255,255,255,0.2); }' +
            '.mobile-nav-items { overflow-y: auto; }' +
            '.mobile-nav-item {' +
                'display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #f0f0f0;' +
                'color: #333; text-decoration: none; transition: background-color 0.2s;' +
            '}' +
            '.mobile-nav-item:hover, .mobile-nav-item:active { background-color: #f5f7fa; text-decoration: none; color: #4682b4; }' +
            '.mobile-nav-item i { margin-right: 12px; color: #4682b4; width: 20px; text-align: center; }' +
            
            /* Action buttons styling */
            '.action-btn { ' +
                'background-color: #4682b4; border-color: #4682b4; color: white; ' +
                'padding: 6px 12px; border-radius: 6px; transition: all 0.2s; ' +
            '}' +
            '.action-btn:hover { background-color: #3a6d96; border-color: #3a6d96; color: white; transform: translateY(-1px); }' +
            
            /* Dashboard styles - matching Patient Portal theme */ +
            '.doctor-dashboard-container {' +
                'background-color: #f5f7fa;' +
                'padding: 15px 10px;' +
                'border-radius: 8px;' +
            '}' +
            '.view-btn {' +
                'display: inline-block;' +
                'background-color: transparent;' +
                'border: 1px solid #4682b4;' +
                'color: #4682b4;' +
                'border-radius: 4px;' +
                'padding: 3px 10px;' +
                'font-size: 12px;' +
                'cursor: pointer;' +
                'transition: all 0.2s;' +
                'text-decoration: none;' +
            '}' +
            '.view-btn:hover {' +
                'background-color: #4682b4;' +
                'color: white;' +
                'text-decoration: none;' +
            '}' +
            '.stats-card-container {' +
                'display: flex;' +
                'flex-wrap: wrap;' +
                'gap: 8px;' +
                'margin-bottom: 12px;' +
                'width: 100%;' +
            '}' +
            '.stats-card {' +
                'flex: 1 1 200px;' + /* Changed to allow better wrapping */
                'min-width: 180px;' +
                'display: flex;' +
                'padding: 12px;' +
                'background-color: white;' +
                'border-radius: 6px;' +
                'box-shadow: 0 1px 3px rgba(0,0,0,0.12);' +
            '}' +
            '.stats-card-icon {' +
                'width: 40px;' + /* Reduced size for better mobile display */
                'height: 40px;' +
                'border-radius: 50%;' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: center;' +
                'margin-right: 12px;' +
                'color: white;' +
                'font-size: 18px;' +
            '}' +
            '.stats-card-info {' +
                'display: flex;' +
                'flex-direction: column;' +
            '}' +
            '.stats-card-value {' +
                'font-size: 20px;' + /* Slightly smaller for mobile */
                'font-weight: 600;' +
                'color: #333;' +
                'margin-bottom: 4px;' +
            '}' +
            '.stats-card-label {' +
                'font-size: 13px;' +
                'color: #666;' +
            '}' +
            '.dynamic-section {' +
                'display: block;' +
                'width: 100%;' +
                'margin-bottom: 10px;' +
            '}' +
            '.dashboard-section {' +
                'background-color: white;' +
                'border-radius: 4px;' +
                'margin-bottom: 8px;' +
                'box-shadow: 0 1px 2px rgba(0,0,0,0.1);' +
                'overflow: hidden;' +
            '}' +
            '.section-header {' +
                'display: flex;' +
                'justify-content: space-between;' +
                'align-items: center;' +
                'padding: 8px 10px;' +
                'background-color: #4682b4;' +
                'color: white;' +
                'border-top-left-radius: 4px;' +
                'border-top-right-radius: 4px;' +
            '}' +
            '.section-title {' +
                'font-size: 16px;' +
                'font-weight: 500;' +
                'display: flex;' +
                'align-items: center;' +
            '}' +
            '.section-title i {' +
                'margin-right: 8px;' +
            '}' +
            '.section-body {' +
                'padding: 0;' +
                'overflow-x: auto;' + /* Add horizontal scrolling for tables on small screens */
            '}' +
            '.dashboard-table {' +
                'width: 100%;' +
                'border-collapse: separate;' +
                'border-spacing: 0 8px;' +
                'min-width: 500px;' + /* Ensure minimal width for readability */
            '}' +
            '.dashboard-table thead th {' +
                'color: var(--secondary);' +
                'font-weight: 600;' +
                'font-size: 13px;' +
                'text-transform: uppercase;' +
                'padding: 10px 15px;' +
                'text-align: left;' +
                'border-bottom: none;' +
            '}' +
            '.dashboard-table tbody tr {' +
                'background-color: var(--white);' +
                'border-radius: 8px;' +
                'box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);' +
            '}' +
            '.dashboard-table tbody td {' +
                'padding: 12px 15px;' +
                'font-size: 14px;' +
                'border-top: none;' +
                'border-bottom: none;' +
            '}' +
            '.dashboard-table tbody td:first-child {' +
                'border-top-left-radius: 8px;' +
                'border-bottom-left-radius: 8px;' +
            '}' +
            '.dashboard-table tbody td:last-child {' +
                'border-top-right-radius: 8px;' +
                'border-bottom-right-radius: 8px;' +
            '}' +
            '.dashboard-table tbody tr:hover {' +
                'background-color: #f9f9f9;' +
                'transform: translateY(-1px);' +
                'transition: all 0.2s;' +
            '}' +
            '.dashboard-card {' +
                'background-color: var(--white);' +
                'border-radius: 16px;' +
                'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);' +
                'margin-bottom: 24px;' +
                'overflow: hidden;' +
            '}' +
            '.dashboard-card-header {' +
                'padding: 16px 20px;' +
                'display: flex;' +
                'align-items: center;' +
                'justify-content: space-between;' +
                'border-bottom: 1px solid rgba(0, 0, 0, 0.05);' +
            '}' +
            '.dashboard-card-body {' +
                'padding: 20px;' +
                'overflow-x: auto;' +
            '}' +
            '@media (max-width: 768px) {' +
                '.dashboard-card-header {' +
                    'flex-direction: column;' +
                    'align-items: flex-start;' +
                '}' +
                '.dashboard-card-body {' +
                    'padding: 15px 10px;' +
                '}' +
            '}' +
            '.header-with-icon {' +
                'display: flex;' +
                'align-items: center;' +
                'flex-shrink: 0;' +
                'margin-right: 15px;' +
            '}' +
            '.header-right {' +
                'display: flex;' +
                'align-items: center;' +
                'flex-grow: 1;' +
            '}' +
            '.stats-card-container {' +
                'display: flex;' +
                'flex-direction: row;' +
                'flex-wrap: wrap;' +
                'justify-content: space-between;' +
                'margin-bottom: 24px;' +
            '}' +
            '.stats-card {' +
                'flex: 1;' +
                'min-width: 220px;' +
                'margin-right: 16px;' +
                'margin-bottom: 16px;' +
                'padding: 20px;' +
                'border-radius: 16px;' +
                'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);' +
            '}' +
            '.stats-card:last-child {' +
                'margin-right: 0;' +
            '}' +
            '.stats-card:nth-child(1) {' +
                'background-color: var(--purple-card);' +
            '}' +
            '.stats-card:nth-child(2) {' +
                'background-color: var(--blue-card);' +
            '}' +
            '.stats-card:nth-child(3) {' +
                'background-color: var(--yellow-card);' +
            '}' +
            '.action-button {' +
                'display: inline-flex;' +
                'align-items: center;' +
                'justify-content: center;' +
                'padding: 6px 12px;' +
                'margin: 2px;' +
                'border-radius: 4px;' +
                'font-size: 12px;' +
                'font-weight: 500;' +
                'cursor: pointer;' +
                'transition: background-color 0.2s;' +
                'color: white;' +
                'background-color: #4682b4;' +
                'border: none;' +
                'text-decoration: none;' +
            '}' +
            '.action-button:hover {' +
                'background-color: #3a6d99;' +
            '}' +
            '.status-pill {' +
                'display: inline-block;' +
                'padding: 4px 10px;' +
                'border-radius: 20px;' +
                'font-size: 11px;' +
                'font-weight: 500;' +
                'text-align: center;' +
                'text-transform: uppercase;' +
                'min-width: 80px;' +
            '}' +
            '.status-scheduled {' +
                'background-color: #e6f7ff;' +
                'color: #1890ff;' +
            '}' +
            '.status-checked-in {' +
                'background-color: #fff7e6;' +
                'color: #fa8c16;' +
            '}' +
            '.status-completed {' +
                'background-color: #f6ffed;' +
                'color: #52c41a;' +
            '}' +
            '.status-overdue {' +
                'background-color: #fff1f0;' +
                'color: #f5222d;' +
            '}' +
            '.patient-search-section {' +
                'margin-bottom: 20px;' +
            '}' +
            '.patient-search-box {' +
                'display: flex;' +
                'gap: 10px;' +
                'align-items: center;' +
            '}' +
            '.search-input {' +
                'flex-grow: 1;' +
                'padding: 8px 12px;' +
                'border: 1px solid #ddd;' +
                'border-radius: 4px;' +
            '}' +
            '.quick-action-section {' +
                'display: flex;' +
                'gap: 10px;' +
                'margin-bottom: 20px;' +
                'flex-wrap: wrap;' +
            '}' +
            '.quick-action-btn {' +
                'flex: 1;' +
                'min-width: 150px;' +
                'padding: 15px;' +
                'border: none;' +
                'border-radius: 6px;' +
                'background-color: #4682b4;' +
                'color: white;' +
                'font-weight: 500;' +
                'display: flex;' +
                'flex-direction: column;' +
                'align-items: center;' +
                'cursor: pointer;' +
                'transition: background-color 0.2s;' +
            '}' +
            '.quick-action-btn i {' +
                'font-size: 20px;' +
                'margin-bottom: 8px;' +
            '}' +
            '.quick-action-btn:hover {' +
                'background-color: #3a6d99;' +
            '}' +
        '</style>').appendTo('head');
    };
    
    // Initialize CSS
    frappe.doctor_dashboard.add_css();

    
    const container = $(wrapper).find('.layout-main-section');
    container.addClass('doctor-dashboard-container');
    
    // Main dashboard layout structure - no section dividers
    let dashboardHTML = '';
    
    // Stats Cards - directly in container without section wrapper
    dashboardHTML += '<div class="stats-card-container">' +
            // Card 1: Appointments Today
            '<div class="stats-card" style="background-color: #f8e6ff;">' +
                '<div class="stats-card-icon" style="background-color: #4682b4;">' +
                    '<i class="fa fa-calendar"></i>' +
                '</div>' +
                '<div class="stats-card-info">' +
                    '<div class="stats-card-value" id="appointments-count">...</div>' +
                    '<div class="stats-card-label">Appointments Today</div>' +
                '</div>' +
            '</div>' +
            // Card 2: Pending Consultations
            '<div class="stats-card" style="background-color: #e8f4ff;">' +
                '<div class="stats-card-icon" style="background-color: #4682b4;">' +
                    '<i class="fa fa-stethoscope"></i>' +
                '</div>' +
                '<div class="stats-card-info">' +
                    '<div class="stats-card-value" id="pending-consultations-count">...</div>' +
                    '<div class="stats-card-label">Pending Consultations</div>' +
                '</div>' +
            '</div>' +
            // Card 3: Lab Reports to Review
            '<div class="stats-card" style="background-color: #fffde8;">' +
                '<div class="stats-card-icon" style="background-color: #4682b4;">' +
                    '<i class="fa fa-flask"></i>' +
                '</div>' +
                '<div class="stats-card-info">' +
                    '<div class="stats-card-value" id="lab-reports-count">...</div>' +
                    '<div class="stats-card-label">Lab Reports to Review</div>' +
                '</div>' +
            '</div>' +
            // Card 4: Admitted Patients
            '<div class="stats-card" style="background-color: #ffe8eb;">' +
                '<div class="stats-card-icon" style="background-color: #4682b4;">' +
                    '<i class="fa fa-bed"></i>' +
                '</div>' +
                '<div class="stats-card-info">' +
                    '<div class="stats-card-value" id="admitted-patients-count">...</div>' +
                    '<div class="stats-card-label">Admitted Patients</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
    
    // Patient Quick Access Search removed
    
    // Quick Actions moved to the page header
    
    // Add the main layout to the container
    container.append(dashboardHTML);
    
    // Add footer directly to the main container for a unified layout
    frappe.pages['doctor_dashboard'].add_dashboard_footer(page);
    
    // Add CSS for the responsive grid layout
    $('<style>' +
        '.form-section.card-section.visible-section {' +
            'margin-top: 0;' +
            'padding: 0;' +
        '} ' +
        '.dashboard-row {' +
            'display: flex;' +
            'gap: 8px;' +
            'flex-wrap: wrap;' + /* Allow wrapping on small screens */
        '}' +
        '.dashboard-col-6 {' +
            'flex: 1 1 300px;' + /* Allow flexible growth with min width */
            'min-width: 300px;' +
        '}' +
        '.dashboard-col-right {' +
            'flex: 1 1 280px;' + /* Allow flexible growth with min width */
            'min-width: 280px;' +
        '}' +
        '.dashboard-col-left {' +
            'flex: 1 1 280px;' + /* Allow flexible growth with min width */
            'min-width: 280px;' +
            'display: flex;' +
            'flex-direction: column;' +
        '}' +
        '.no-gap {' +
            'margin: 0;' +
            'padding: 0;' +
        '}' +
        /* Responsive media queries */
        '@media (max-width: 768px) {' +
            '.stats-card-container {' +
                'gap: 10px;' +
            '}' +
            '.stats-card {' +
                'padding: 12px;' +
            '}' +
            '.stats-card-value {' +
                'font-size: 18px;' +
            '}' +
            '.stats-card-label {' +
                'font-size: 12px;' +
            '}' +
            '.dashboard-table tbody td {' +
                'padding: 10px 12px;' +
            '}' +
            '.custom-header-buttons {' +
                'flex-wrap: wrap;' +
            '}' +
        '}' +
        '@media (max-width: 480px) {' +
            '.doctor-dashboard-container {' +
                'padding: 10px;' +
            '}' +
            '.stats-card {' +
                'flex: 1 1 100%;' + /* Full width on very small screens */
            '}' +
            '.dashboard-col-left, .dashboard-col-right {' +
                'flex: 1 1 100%;' + /* Full width on very small screens */
                'min-width: 100%;' +
            '}' +
            '.action-button, .view-btn {' +
                'padding: 4px 8px;' +
                'font-size: 11px;' +
            '}' +
        '}' +
    '</style>').appendTo('head');
    
    // Create a simplified layout that stacks on mobile
    container.append('<div class="dashboard-row">' +
                        '<div class="dashboard-col-left">' +
                            '<div id="appointments-container" class="dynamic-section"></div>' +
                            '<div id="lab-reports-container" class="dynamic-section"></div>' +
                        '</div>' +
                        '<div class="dashboard-col-right">' +
                            '<div id="consultations-container" class="dynamic-section"></div>' +
                        '</div>' +
                    '</div>');
    
    // Patient search functionality
    $('#patient-search-btn').on('click', function() {
        const searchTerm = $('#patient-search-input').val().trim();
        if (!searchTerm) return;
        
        $('#patient-search-results').html('<div class="text-center"><i class="fa fa-spinner fa-spin"></i> Searching...</div>');
        
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Patient',
                fields: ['name', 'patient_name', 'mobile', 'email', 'blood_group'],
                filters: [
                    ['patient_name', 'like', '%' + searchTerm + '%'],
                    ['or', 'mobile', 'like', '%' + searchTerm + '%'],
                    ['or', 'email', 'like', '%' + searchTerm + '%'],
                    ['or', 'abha_id', 'like', '%' + searchTerm + '%']
                ],
                limit_page_length: 10
            },
            callback: function(r) {
                if (r.message && r.message.length) {
                    let resultsHTML = '<div class="dashboard-table"><table class="table"><thead><tr>' +
                        '<th>Patient ID</th><th>Patient Name</th><th>Mobile</th><th>Actions</th></tr></thead><tbody>';
                    
                    r.message.forEach(function(patient) {
                        resultsHTML += '<tr>' +
                            '<td>' + patient.name + '</td>' +
                            '<td>' + patient.patient_name + '</td>' +
                            '<td>' + (patient.mobile || '-') + '</td>' +
                            '<td>' +
                                '<a href="#Form/Patient/' + patient.name + '" class="action-button">View</a>' +
                                '<button class="action-button" style="margin-left: 5px;" ' +
                                    'onclick="frappe.new_doc(\'Patient Encounter\', {patient: \'' + patient.name + '\'})">New Consultation</button>' +
                            '</td>' +
                        '</tr>';
                    });
                    
                    resultsHTML += '</tbody></table></div>';
                    $('#patient-search-results').html(resultsHTML);
                } else {
                    $('#patient-search-results').html('<div class="alert alert-warning">No patients found matching "' + searchTerm + '"</div>');
                }
            }
        });
    });
    
    // Allow pressing enter in search box
    $('#patient-search-input').keypress(function(e) {
        if (e.which === 13) { // Enter key
            $('#patient-search-btn').click();
        }
    });

    // Initialize refresh function
    frappe.doctor_dashboard.refresh_data = function() {
        // Just clear contents without removing containers
        $('#appointments-container, #consultations-container, #lab-reports-container').empty();
        
        // Refresh all statistics counts first
        frappe.doctor_dashboard.load_stats_counts();
        
        // Refresh Appointments Today
        frappe.doctor_dashboard.load_appointments();
        
        // Refresh Recent Consultations
        frappe.doctor_dashboard.load_recent_consultations();
        
        // Refresh Lab Reports
        frappe.doctor_dashboard.load_lab_reports();
    };
    
    // Load appointments function
    frappe.doctor_dashboard.load_appointments = function() {
        // Create a loading indicator first
        $('#appointments-container').html('<div class="text-center" style="padding: 8px;">Loading appointments...</div>');
        
        // Debug in console
        console.log('Loading appointments for today:', frappe.datetime.get_today());
        
        // Section: Appointments Today
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Patient Appointment",
                fields: ["name", "patient", "appointment_time", "status"],
                filters: {
                    appointment_date: frappe.datetime.get_today()
                },
                limit_page_length: 5
            },
            callback: function(r) {
                // Debug response
                console.log('Appointments response:', r);
                
                // Build HTML for appointments - simplified structure
                let html = '<div class="dashboard-section"><div class="section-header"><div class="section-title"><i class="fa fa-calendar"></i>Appointments Today</div></div>' +
                      '<table class="table dashboard-table"><thead><tr><th>Time</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            
                if(r.message && Array.isArray(r.message)) {
                    r.message.forEach(row => {
                        let statusClass = '';
                        if(row.status === 'Scheduled') statusClass = 'status-scheduled';
                        if(row.status === 'Checked In') statusClass = 'status-checked-in';
                        if(row.status === 'Completed') statusClass = 'status-completed';
                        
                        // Absolute simplest solution - extract time part if it exists
                        let formattedTime = 'TBD';
                        
                        try {
                            // Most reliable approach - direct string extraction
                            if (row.appointment_time && typeof row.appointment_time === 'string') {
                                // For date + time format: "2023-01-01 14:30:00"
                                if (row.appointment_time.includes(' ')) {
                                    const parts = row.appointment_time.split(' ');
                                    if (parts.length >= 2) {
                                        const timePortion = parts[1];
                                        if (timePortion && timePortion.includes(':')) {
                                            // We have the time portion (e.g. "14:30:00")
                                            const timeParts = timePortion.split(':');
                                            // Convert to 12-hour format for display
                                            const hours = parseInt(timeParts[0], 10);
                                            const mins = timeParts[1] || '00';
                                            const ampm = hours >= 12 ? 'PM' : 'AM';
                                            const displayHours = hours % 12 || 12;
                                            formattedTime = displayHours + ':' + mins + ' ' + ampm;
                                        }
                                    }
                                } else if (row.appointment_time.includes(':')) {
                                    // Direct time format: "14:30:00"
                                    const timeParts = row.appointment_time.split(':');
                                    const hours = parseInt(timeParts[0], 10);
                                    const mins = timeParts[1] || '00';
                                    const ampm = hours >= 12 ? 'PM' : 'AM';
                                    const displayHours = hours % 12 || 12;
                                    formattedTime = displayHours + ':' + mins + ' ' + ampm;
                                } else {
                                    // Use as-is if we can't parse
                                    formattedTime = row.appointment_time;
                                }
                            }
                        } catch (error) {
                            console.error('Error formatting time:', error);
                        }
                        
                        html += '<tr>' +
                            '<td>' + formattedTime + '</td>' +
                            '<td>' + row.patient + '</td>' +
                            '<td><span class="status-pill ' + statusClass + '">' + row.status + '</span></td>' +
                            '<td><button class="action-button" onclick="frappe.new_doc(\'Patient Encounter\', {patient: \'' + row.patient + '\'})">Start Consultation</button></td>' +
                        '</tr>';
                    });
                    
                    if(r.message.length === 0) {
                        html += '<tr><td colspan="4" class="text-center">No appointments scheduled for today</td></tr>';
                    }
                } else {
                    html += '<tr><td colspan="4" class="text-center">Error loading appointments</td></tr>';
                    console.error('Invalid appointments response:', r);
                }
                
                html += '</tbody></table></div>';
                $('#appointments-container').html(html);
        }
    });

    };
    
    // Load recent consultations function
    frappe.doctor_dashboard.load_recent_consultations = function() {
        // Create a loading indicator first
        $('#consultations-container').html('<div class="text-center" style="padding: 8px;">Loading recent consultations...</div>');
        
        // Debug in console
        console.log('Loading recent consultations');
        
        // Section: Recent Consultations
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Patient Encounter",
                fields: ["name", "patient", "encounter_date", "diagnosis"],
                limit_page_length: 5,
                order_by: "creation desc"
            },
            callback: function(r) {
                // Debug response
                console.log('Consultations response:', r);
                
                let html = '<div class="dashboard-section">';
    html += '<div class="section-header" style="background-color: #4682b4; color: white;"><div class="section-title"><i class="fa fa-stethoscope"></i>Recent Consultations</div></div>';
    html += '<table class="table dashboard-table"><thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Actions</th></tr></thead><tbody>';
            
                if (r.message && Array.isArray(r.message)) {
                    r.message.forEach(row => {
                        html += '<tr>' +
                            '<td>' + row.encounter_date + '</td>' +
                            '<td>' + row.patient + '</td>' +
                            '<td>' + ((row.diagnosis || []).map(d => d.diagnosis).join(", ") || 'Not specified') + '</td>' +
                            '<td><button onclick="frappe.set_route(\'Form\', \'Patient Encounter\', \'' + row.name + '\')" class="view-btn">View</button></td>' +
                        '</tr>';
                    });
            
                    if(r.message.length === 0) {
                        html += '<tr><td colspan="4" class="text-center">No recent consultations found</td></tr>';
                    }
                } else {
                    html += '<tr><td colspan="4" class="text-center">Error loading consultations</td></tr>';
                    console.error('Invalid consultations response:', r);
                }
                
                html += '</tbody></table></div>';
                $('#consultations-container').html(html);
        }
    });

    };
    
    // Load lab reports function
    frappe.doctor_dashboard.load_lab_reports = function() {
        // Create a loading indicator first
        $('#lab-reports-container').html('<div class="text-center" style="padding: 8px;">Loading lab reports...</div>');
        
        // Debug in console
        console.log('Loading lab reports');
        
        // Simple lab test listing
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Lab Test",
                fields: ["name", "patient", "status"],
                filters: {},
                limit_page_length: 10
            },
            callback: function(r) {
                // Debug response
                console.log('Lab reports response:', r);
                
                // Create modern table matching the provided design
                let html = '<div class="dashboard-section">';
    html += '<div class="section-header" style="background-color: #4682b4; color: white;"><div class="section-title"><i class="fa fa-flask"></i> Lab Tests</div></div>';
    html += '<table class="table dashboard-table"><thead><tr><th>Test ID</th><th>Patient</th><th>Test Name</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
            
                if (r.message && Array.isArray(r.message)) {
                    if (r.message.length === 0) {
                        html += '<tr><td colspan="5" class="text-center">No lab tests found</td></tr>';
                    } else {
                        r.message.forEach(function(row) {
                            // Create table row
                            html += '<tr>';
                            html += '<td style="font-weight: 500;">' + (row.name || '') + '</td>';
                            html += '<td>' + (row.patient || '') + '</td>';
                            
                            // Add status with appropriate styling
                            let statusClass = '', statusText = row.status || '';
                            if (statusText.toLowerCase() === 'completed') {
                                statusClass = 'status-completed';
                            } else if (statusText.toLowerCase() === 'pending') {
                                statusClass = 'status-pending';
                            } else {
                                statusClass = 'status-failed';
                            }
                            
                            html += '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>';
                            html += '<td><button onclick="frappe.set_route(\'Form\', \'Lab Test\', \'' + row.name + '\')" class="view-btn">View</button></td>';
                            html += '</tr>';
                        });
                    }
                } else {
                    html += '<tr><td colspan="5" class="text-center">Error loading lab tests</td></tr>';
                    console.error('Invalid lab reports response:', r);
                }
                
                html += '</tbody></table></div>';
                
                // Set the HTML content
                $('#lab-reports-container').html(html);
                
                // Add click handler for the view button
                $('.view-btn').on('click', function() {
                    const testId = $(this).closest('tr').find('td:first').text();
                    frappe.set_route('Form', 'Lab Test', testId);
                });
        }
    });
};

    this.add_dashboard_footer(page);

// Close the on_page_load function
};

// Allow pressing enter in search box
$('#patient-search-input').keypress(function(e) {
    if (e.which === 13) { // Enter key
        $('#patient-search-btn').click();
    }
});

// Initialize doctor_dashboard namespace if not exists
frappe.doctor_dashboard = frappe.doctor_dashboard || {};

// Initialize refresh function
frappe.doctor_dashboard.refresh_data = function() {
    // Just clear contents without removing containers
    $('#appointments-container, #consultations-container, #lab-reports-container').empty();

    // Load Stats Counts
    frappe.doctor_dashboard.load_stats_counts();

    // Refresh Appointments Today
    frappe.doctor_dashboard.load_appointments();

    // Refresh Recent Consultations
    frappe.doctor_dashboard.load_recent_consultations();

    // Refresh Lab Reports
    frappe.doctor_dashboard.load_lab_reports();
};

// Load Statistics Cards Data
frappe.doctor_dashboard.load_stats_counts = function() {
    // Set loading indicators
    $('#appointments-count, #pending-consultations-count, #lab-reports-count, #admitted-patients-count').html('<i class="fa fa-spinner fa-spin"></i>');
    
    // 1. Count Appointments Today
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Patient Appointment",
            fields: ["count(name) as count"],
            filters: { appointment_date: frappe.datetime.get_today() }
        },
        callback: function(r) {
            $('#appointments-count').text(r.message && r.message.length ? r.message[0].count : 0);
        }
    });
    
    // 2. Count Pending Consultations
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Patient Encounter",
            fields: ["count(name) as count"],
            filters: { docstatus: 0 } // Draft status
        },
        callback: function(r) {
            $('#pending-consultations-count').text(r.message && r.message.length ? r.message[0].count : 0);
        }
    });
    
    // 3. Count Lab Reports to Review
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Lab Test",
            fields: ["count(name) as count"],
            filters: { status: "Completed", docstatus: 0 } // Completed but not submitted
        },
        callback: function(r) {
            $('#lab-reports-count').text(r.message && r.message.length ? r.message[0].count : 0);
        }
    });
    
    // 4. Count Admitted Patients
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Inpatient Record",
            fields: ["count(name) as count"],
            filters: { status: "Admitted" }
        },
        callback: function(r) {
            $('#admitted-patients-count').text(r.message && r.message.length ? r.message[0].count : 0);
        }
    });
};

// Load appointments function
frappe.doctor_dashboard.load_appointments = function() {
    // Create a loading indicator first
    $('#appointments-container').html('<div class="dashboard-section"><div class="section-body text-center">Loading appointments...</div></div>');

    // Debug in console
    console.log('Loading appointments for today:', frappe.datetime.get_today());

    // Section: Appointments Today
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Patient Appointment",
            fields: ["name", "patient", "appointment_time", "status"],
            filters: {
                appointment_date: frappe.datetime.get_today()
            },
            limit_page_length: 5
        },
        callback: function(r) {
            // Debug response
            console.log('Appointments response:', r);

            // Build HTML for appointments
            let html = '<div class="dashboard-section"><div class="section-header"><div class="section-title"><i class="fa fa-calendar"></i>Appointments Today</div></div>' +
                '<div class="section-body"><table class="table table-bordered dashboard-table"><thead><tr><th>Time</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

            if (r.message && Array.isArray(r.message)) {
                r.message.forEach(row => {
                    let statusClass = '';
                    if (row.status === 'Scheduled') statusClass = 'status-scheduled';
                    if (row.status === 'Checked In') statusClass = 'status-checked-in';
                    if (row.status === 'Completed') statusClass = 'status-completed';

                    html += '<tr>' +
                        '<td>' + frappe.datetime.get_time(row.appointment_time) + '</td>' +
                        '<td>' + row.patient + '</td>' +
                        '<td><span class="status-pill ' + statusClass + '">' + row.status + '</span></td>' +
                        '<td><button class="action-button" onclick="frappe.new_doc(\'Patient Encounter\', {patient: \'' + row.patient + '\'})">' + 'Start Consultation</button></td>' +
                        '</tr>';
                });

                if (r.message.length === 0) {
                    html += '<tr><td colspan="4" class="text-center">No appointments scheduled for today</td></tr>';
                }
            } else {
                html += '<tr><td colspan="4" class="text-center">Error loading appointments</td></tr>';
                console.error('Invalid appointments response:', r);
            }

            html += '</tbody></table></div>';
            $('#appointments-container').html(html);
        }
    });
};

// Load recent consultations function
frappe.doctor_dashboard.load_recent_consultations = function() {
    // Create a loading indicator first
    $('#consultations-container').html('<div class="dashboard-section"><div class="section-body text-center">Loading recent consultations...</div></div>');

    // Debug in console
    console.log('Loading recent consultations');

    // Section: Recent Consultations
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Patient Encounter",
            fields: ["name", "patient", "encounter_date", "diagnosis"],
            limit_page_length: 5,
            order_by: "creation desc"
        },
        callback: function(r) {
            // Debug response
            console.log('Consultations response:', r);

            let html = '<div class="dashboard-section">';
    html += '<div class="section-header" style="background-color: #4682b4; color: white;"><div class="section-title"><i class="fa fa-stethoscope"></i>Recent Consultations</div></div>';
    html += '<div class="section-body"><table class="table dashboard-table"><thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Actions</th></tr></thead><tbody>';

            if (r.message && Array.isArray(r.message)) {
                r.message.forEach(row => {
                    html += '<tr>' +
                        '<td>' + row.encounter_date + '</td>' +
                        '<td>' + row.patient + '</td>' +
                        '<td>' + ((row.diagnosis || []).map(d => d.diagnosis).join(", ") || 'Not specified') + '</td>' +
                        '<td><button onclick="frappe.set_route(\'Form\', \'Patient Encounter\', \'' + row.name + '\')" class="view-btn">View</button></td>' +
                        '</tr>';
                });

                if (r.message.length === 0) {
                    html += '<tr><td colspan="4" class="text-center">No recent consultations found</td></tr>';
                }
            } else {
                html += '<tr><td colspan="4" class="text-center">Error loading consultations</td></tr>';
                console.error('Invalid consultations response:', r);
            }

            html += '</tbody></table></div>';
            $('#consultations-container').html(html);
        }
    });
};
frappe.doctor_dashboard.load_lab_reports = function() {
    // Create a loading indicator first
    $('#lab-reports-container').html('<div class="dashboard-section"><div class="section-body text-center">Loading lab reports...</div></div>');
    
    // Debug in console
    console.log('Loading lab reports');
    
    // Simple lab test listing
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Lab Test",
            fields: ["name", "patient", "status"],
            filters: {},
            limit_page_length: 10
        },
        callback: function(r) {
            // Debug response
            console.log('Lab reports response:', r);
            
            // Create modern table matching the provided design
            let html = '<div class="dashboard-section">';
            html += '<div class="section-header" style="background-color: #4682b4; color: white;"><div class="section-title"><i class="fa fa-flask"></i> Lab Tests</div></div>';
            html += '<div class="section-body" style="padding: 0; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">';
            html += '<style>';
            html += '.modern-table {width: 100%; border-collapse: collapse; font-size: 13px; background-color: white; min-width: 500px;}' +
            '.modern-table thead {background-color: #f9fafb; border-bottom: 1px solid #eef0f2;}' +
            '.modern-table th {text-align: left; padding: 12px 15px; color: #666; font-weight: 500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;}' +
            '.modern-table td {padding: 12px 15px; vertical-align: middle; white-space: nowrap;}' +
            '.modern-table tbody tr:nth-child(even) {background-color: #f5f7fa;}' +
            '.modern-table tbody tr {border-bottom: 1px solid #eef0f2;}' +
            '.modern-table tbody tr:hover {background-color: #f0f4f8;}' +
            '.status-badge {display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;}' +
            '@media (max-width: 768px) {' +
                '.modern-table th {padding: 10px 12px;}' +
                '.modern-table td {padding: 10px 12px;}' +
                '.status-badge {padding: 3px 10px; font-size: 11px;}' +
            '.mobile-menu-btn { display: none; }' +
            '@media (max-width: 480px) {' +
                '.mobile-menu-btn { display: flex !important; }' +
            '}' +
            /* Mobile Navigation Overlay */
            '.mobile-nav-overlay {' +
                'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);' +
                'z-index: 9999; display: flex; justify-content: flex-end; visibility: hidden; opacity: 0;' +
                'transition: all 0.3s ease;' +
            '}' +
            '.mobile-nav-overlay.active { visibility: visible; opacity: 1; }' +
            '.mobile-nav-container {' +
                'width: 75%; max-width: 300px; height: 100%; background-color: white; padding: 20px;' +
                'display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease;' +
            '}' +
            '.mobile-nav-overlay.active .mobile-nav-container { transform: translateX(0); }' +
            '.mobile-nav-container .close-nav {' +
                'align-self: flex-end; background: none; border: none; font-size: 20px; margin-bottom: 20px;' +
                'color: #333; cursor: pointer;' +
            '}' +
            '.mobile-nav-items { display: flex; flex-direction: column; }' +
            '.mobile-nav-items a {' +
                'padding: 12px 15px; border-bottom: 1px solid #eee; color: #333; text-decoration: none;' +
                'font-size: 16px; transition: background-color 0.2s;' +
            '}' +
            '.mobile-nav-items a:hover { background-color: #f5f5f5; }' +
            '}' +
            '.status-pending {background-color: #fff8e1; color: #ffa000;}' +
            '.status-completed {background-color: #e8f5e9; color: #2e7d32;}' +
            '.status-failed {background-color: #ffebee; color: #c62828;}' +
            '.view-btn {background-color: transparent; border: 1px solid #4682b4; color: #4682b4; border-radius: 4px; padding: 3px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s;}' +
            '.view-btn:hover {background-color: #4682b4; color: white;}' +
            '.dashboard-section {margin-bottom: 20px;}' +
            '</style>';
            html += '</style>';
            html += '<table class="modern-table">';
            html += '<thead><tr><th>Test ID</th><th>Patient</th><th>Status</th><th width="100">Actions</th></tr></thead>';
            html += '<tbody>';
            
            if (r.message && Array.isArray(r.message)) {
                if (r.message.length === 0) {
                    html += '<tr><td colspan="4" class="text-center">No lab tests found</td></tr>';
                } else {
                    r.message.forEach(function(row) {
                        // Create table row
                        html += '<tr>';
                        html += '<td style="font-weight: 500;">' + (row.name || '') + '</td>';
                        html += '<td>' + (row.patient || '') + '</td>';
                        
                        // Add status with appropriate styling
                        let statusClass = '', statusText = row.status || '';
                        if (statusText.toLowerCase() === 'completed') {
                            statusClass = 'status-completed';
                        } else if (statusText.toLowerCase() === 'pending') {
                            statusClass = 'status-pending';
                        } else {
                            statusClass = 'status-failed';
                        }
                        
                        html += '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>';
                        html += '<td><button onclick="frappe.set_route(\'Form\', \'Lab Test\', \'' + row.name + '\')" class="view-btn">View</button></td>';
                        html += '</tr>';
                    });
                }
            } else {
                html += '<tr><td colspan="4" class="text-center">Error loading lab tests</td></tr>';
                console.error('Invalid lab reports response:', r);
            }
            
            html += '</tbody></table></div>';
            
            // Set the HTML content
            $('#lab-reports-container').html(html);
            
            // Add click handler for the view button
            $('.view-btn').on('click', function() {
                const testId = $(this).closest('tr').find('td:first').text();
                frappe.set_route('Form', 'Lab Test', testId);
            });
        }
    });
};
