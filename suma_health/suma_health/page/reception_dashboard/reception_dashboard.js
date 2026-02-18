

frappe.pages['reception-dashboard'] = frappe.pages['reception-dashboard'] || {};

frappe.pages['reception-dashboard'].add_dashboard_footer = function(page) {
    // Remove any existing footer to prevent duplicates
    $('.reception-dashboard-footer').remove();

    // Get current year and user info
    const currentYear = new Date().getFullYear();
    const user = frappe.session.user;
    const sitename = frappe.boot.sitename || 'Healthcare App';
    const version = frappe.boot.version || '1.0.0';

    // Footer HTML Structure
    const footer_html = `
        <footer class="reception-dashboard-footer">
            <div class="footer-main-content">
                <!-- Basic Info -->
                <div class="footer-column">
                    <h5>${sitename}</h5>
                    <p>&copy; ${currentYear} ${sitename}. All rights reserved.</p>
                    <p>Version: ${version}</p>
                </div>

                <!-- Useful Links -->
                <div class="footer-column">
                    <h5>Useful Links</h5>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/contact">Contact Support</a></li>
                    </ul>
                </div>

                <!-- User Info -->
                <div class="footer-column">
                    <h5>User Info</h5>
                    <p><i class="fa fa-user"></i> ${user}</p>
                    <p id="footer-user-roles"><i class="fa fa-shield"></i> Loading roles...</p>
                    <button class="btn btn-xs btn-default" onclick="frappe.app.logout()">Logout</button>
                </div>

                <!-- Social & Powered By -->
                <div class="footer-column">
                    <h5>Connect With Us</h5>
                    <div class="social-links">
                        <a href="#"><i class="fa fa-facebook-square"></i></a>
                        <a href="#"><i class="fa fa-twitter-square"></i></a>
                        <a href="#"><i class="fa fa-linkedin-square"></i></a>
                    </div>
                    <div class="powered-by">
                        <p>Powered by Frappe</p>
                        <p>Built with ❤️ by SumaSoft</p>
                    </div>
                </div>
            </div>
        </footer>
    `;

    // CSS for the footer
    const footer_style_content = `
        .reception-dashboard-footer {
            background-color: #f8f9fa; /* Light grey background */
            color: #495057; /* Dark grey text */
            padding: 20px 40px;
            border-top: 1px solid #dee2e6; /* Subtle top border */
            font-size: 14px;
            width: 100%;
        }
        .footer-main-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        .footer-column {
            flex: 1;
            min-width: 200px;
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
        const style_tag = document.createElement('style');
        style_tag.id = 'reception-dashboard-footer-styles';
        style_tag.innerHTML = footer_style_content;
        document.head.appendChild(style_tag);
    }
    $(page.body).append(footer_html);

    // Safely populate user roles, handling race condition
    if (frappe.session.user_roles && Array.isArray(frappe.session.user_roles)) {
        $('#footer-user-roles').html('<i class="fa fa-shield"></i> ' + frappe.session.user_roles.join(', '));
    } else {
        // Retry after a short delay, as session data might still be loading
        setTimeout(() => {
            if (frappe.session.user_roles && Array.isArray(frappe.session.user_roles)) {
                $('#footer-user-roles').html('<i class="fa fa-shield"></i> ' + frappe.session.user_roles.join(', '));
            } else {
                $('#footer-user-roles').html('<i class="fa fa-shield"></i> Could not load roles.');
            }
        }, 1500);
    }
};

frappe.pages['reception-dashboard'].on_page_load = function(wrapper) {
    // Add the glass effect CSS
    frappe.require('/assets/suma_health/css/reception_dashboard.css');
    let user_name = frappe.session.user_fullname || frappe.session.user;

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Hi, ') + user_name,
        single_column: true
    });

    // Add the container class for the glass effect
    $(page.wrapper).find('.page-content').addClass('reception-dashboard-container');
    // const userFullName = frappe.session.user_fullname;
    // const firstName = userFullName.split(' ')[0];

    // // Create custom greeting title with professional stylingls
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
    // $('.page-title h3').first().empty().append($customTitle);

    // Get current user's name for avatar display
    const userFullName = frappe.session.user_fullname;
    const firstName = userFullName.split(' ')[0];
    
    // Apply button styling and tooltips to search and profile buttons
    setTimeout(() => {
        // Update search button and add functionality
        $('.search-btn')
            .addClass('reception-icon-btn')
            .attr('title', 'Search')
            .removeClass('btn-default icon-btn')
            .css({
                'margin-right': '5px',
                'position': 'relative',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center'
            })
            .off('click')
            .on('click', function () {
                show_search_modal();
            });

        // Make sure search icon is properly centered and sized
        $('.search-btn i').css({
            'font-size': '14px',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        });

        // Update profile button with animated avatar
        $('.profile-btn')
            .addClass('reception-icon-btn animated-avatar')
            .attr('title', 'Profile')
            .removeClass('btn-default icon-btn')
            .css({
                'margin-right': '5px',  // Add margin to ensure it doesn't get cut off
                'position': 'relative'
            });

        // Create animated avatar
        const userInitial = firstName.charAt(0).toUpperCase();
        const randomColor = getAvatarColor(userFullName);

        // Replace avatar with animated custom avatar
        $('.profile-btn .avatar').html(`
            <div class="animated-avatar-inner">
                <span class="avatar-text">${userInitial}</span>
                <div class="avatar-ring"></div>
            </div>
        `).css({
            'background-color': randomColor,
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'position': 'relative',
            'overflow': 'visible',
            'border-radius': '50%',
            'width': '32px',   // Slightly smaller for mobile
            'height': '32px',  // Slightly smaller for mobile
            'max-width': '100%'
        });

        // Add comprehensive responsive styling for all navbar buttons
        const responsive_style_content = `
            /* Navbar buttons base responsive styles */
            .search-btn, .mobile-menu-btn, .profile-btn {
                width: 34px !important;
                height: 34px !important;
                min-width: 34px !important;
                padding: 5px !important;
                margin: 0 3px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 4px !important;
                background-color: #4682b4 !important;
                border-color: #4682b4 !important;
                color: white !important;
                position: relative !important;
                overflow: visible !important;
            }

            .reception-icon-btn i, .mobile-menu-btn i {
                font-size: 14px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            /* Profile button specific styles */
            .profile-btn .avatar {
                width: 32px !important;
                height: 32px !important;
                max-width: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
            }

            /* Navbar container adjustments */
            .navbar .container,
            .layout-side-section,
            .page-head .container {
                padding-right: 10px !important;
            }

            .page-head .page-actions {
                padding-right: 5px !important;
                display: flex !important;
                align-items: center !important;
            }

            /* Medium screens */
            @media (max-width: 767px) {
                .navbar .container,
                .layout-side-section,
                .page-head .container {
                    padding-right: 8px !important;
                }
                
                .page-head .page-actions {
                    right: 5px !important;
                }
                
                .search-btn, .mobile-menu-btn, .profile-btn {
                    width: 32px !important;
                    height: 32px !important;
                    min-width: 32px !important;
                    margin: 0 2px !important;
                }
                
                .profile-btn .avatar {
                    width: 30px !important;
                    height: 30px !important;
                }
            }

            /* Small screens */
            @media (max-width: 400px) {
                .navbar .container,
                .layout-side-section,
                .page-head .container {
                    padding-right: 5px !important;
                }
                
                .page-actions {
                    margin-right: 0 !important;
                }
                
                .search-btn, .mobile-menu-btn, .profile-btn {
                    width: 30px !important;
                    height: 30px !important;
                    min-width: 30px !important;
                    margin: 0 1px !important;
                    padding: 3px !important;
                }
                
                .reception-icon-btn i, .mobile-menu-btn i {
                    font-size: 12px !important;
                }
                
                .profile-btn .avatar {
                    width: 28px !important;
                    height: 28px !important;
                }
                
                .avatar-text {
                    font-size: 12px !important;
                }
            }
        `;
        if ($('#reception-responsive-styles').length === 0) {
            const style_tag = document.createElement('style');
            style_tag.id = 'reception-responsive-styles';
            style_tag.innerHTML = responsive_style_content;
            document.head.appendChild(style_tag);
        }
    }, 500); // Small delay to ensure elements are loaded

    // Add action buttons
    setup_action_buttons(page);

    // Create dashboard DOM
    create_dashboard_dom(page);

    // Add CSS
    add_css();
    frappe.pages['reception-dashboard'].add_dashboard_footer(page);

    // Make sure splash screen styles are applied immediately
    applySplashScreenStyles();

    // Set up event handlers
    setup_event_handlers(page);

    // Load all dashboard data
    refresh_dashboard();

    // Hide splash screen after a minimum display time
    setTimeout(() => hideLoadingSplash(), 2000);

    // Setup auto-refresh every 2 minutes
    const autoRefreshInterval = setInterval(() => refresh_dashboard(), 120000);

    // Store references and interval ID for later use/cleanup
    frappe.reception_dashboard = {
        page: page,
        refresh: refresh_dashboard,
        autoRefreshInterval: autoRefreshInterval
    };
};

frappe.pages['reception-dashboard'].on_page_show = function () {
    // Refresh data when page is shown
    if (frappe.reception_dashboard && frappe.reception_dashboard.refresh) {
        frappe.reception_dashboard.refresh();
    }
};

// Handle page hide cleanup
frappe.pages['reception-dashboard'].on_page_hide = function () {
    // Clear interval when navigating away
    if (frappe.reception_dashboard && frappe.reception_dashboard.autoRefreshInterval) {
        clearInterval(frappe.reception_dashboard.autoRefreshInterval);
    }
};

function setup_action_buttons(page) {
    // Clear any existing buttons first to avoid duplication
    $('.page-head .page-actions .responsive-menu-container').remove();
    $('.page-head .page-actions .reception-buttons').remove();
    $('.page-head .page-actions .mobile-menu-btn').remove();
    $('.mobile-dropdown').remove();

    // Create a custom button group in the header
    const $btnGroup = $('<div class="btn-group reception-buttons"></div>');

    // Create mobile dropdown menu for small screens
    const $mobileMenuBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn mobile-menu-btn" title="Menu">
        <i class="fa fa-bars"></i>
    </button>`);

    // Create mobile dropdown container
    const $mobileDropdown = $('<div class="mobile-dropdown"></div>');

    // Create icon buttons for the actions
    const $newPatientBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn" title="New Patient">
        <i class="fa fa-user-plus"></i>
         <span class="btn-text"></span>
    </button>`).on('click', function () {
        frappe.set_route('/app/patient/new-patient');
    });

    const $bookAppointmentBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn" title="Book Appointment">
        <i class="fa fa-calendar-plus-o"></i>
        <span class="btn-text"></span>
    </button>`).on('click', function () {
        frappe.set_route('/app/patient-appointment/new-patient-appointment');
    });

    const $patientListBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn" title="Patient List">
        <i class="fa fa-list"></i>
        <span class="btn-text"></span>
    </button>`).on('click', function () {
        frappe.set_route('List', 'Patient');
    });

    const $refreshBtn = $(`<button class="btn btn-primary btn-sm reception-icon-btn" title="Refresh Dashboard">
        <i class="fa fa-refresh"></i>
        <span class="btn-text"></span>
    </button>`).on('click', function () {
        frappe.reception_dashboard.refresh();
    });

    // Add buttons to the group for desktop view
    $btnGroup.append($newPatientBtn, $bookAppointmentBtn, $patientListBtn, $refreshBtn);

    // Create clones for mobile dropdown
    const $newPatientBtnMobile = $newPatientBtn.clone(true);
    const $bookAppointmentBtnMobile = $bookAppointmentBtn.clone(true);
    const $patientListBtnMobile = $patientListBtn.clone(true);
    const $refreshBtnMobile = $refreshBtn.clone(true);

    // Add buttons to mobile dropdown
    $mobileDropdown.append(
        $newPatientBtnMobile,
        $bookAppointmentBtnMobile,
        $patientListBtnMobile,
        $refreshBtnMobile
    );

    // Create a container for the responsive menu system
    const $responsiveMenuContainer = $('<div class="responsive-menu-container"></div>');

    // Add the button group and mobile menu button to the container
    $responsiveMenuContainer.append($btnGroup);
    $responsiveMenuContainer.append($mobileMenuBtn);

    // Add the container to the page header (after clearing any existing one)
    $('.page-head .page-actions .responsive-menu-container').remove();
    $('.page-head .page-actions').prepend($responsiveMenuContainer);

    // Add mobile dropdown to page head
    $('.page-head .mobile-dropdown').remove();
    $('.page-head').append($mobileDropdown);

    // Ensure mobile menu button is hidden above 768px width
    function updateMobileMenuVisibility() {
        if (window.innerWidth >= 768) {
            $('.mobile-menu-btn').hide();
            $('.mobile-dropdown').removeClass('show');
        } else {
            // Only show menu button on mobile (not the dropdown automatically)
            $('.mobile-menu-btn').show();
        }
    }

    // Run initially and on window resize
    updateMobileMenuVisibility();
    $(window).on('resize', updateMobileMenuVisibility);

    // Toggle mobile dropdown when clicking the menu button
    $mobileMenuBtn.on('click', function () {
        $mobileDropdown.toggleClass('show');
    });

    // Close dropdown when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.mobile-menu-btn').length &&
            !$(e.target).closest('.mobile-dropdown').length) {
            $mobileDropdown.removeClass('show');
        }
    });

    // Add custom CSS for button styling and responsiveness
    $('<style>\n/* Basic styling */\n.reception-buttons .btn { margin-right: 8px; }\n.reception-icon-btn { \n    background-color: #4682b4; \n    border-color: #4682b4; \n    color: white; \n    border-radius: 4px; \n    font-weight: 500; \n    font-family: var(--font-family); \n    transition: all 0.3s; \n    padding: 6px 12px;\n}\n.reception-icon-btn:hover { background-color: #3a6d98; border-color: #3a6d98; color: white; }\n.page-head { background-color: white !important; border-bottom: 1px solid #eaeaea; }\n.page-container { background-color: #f5f7fa !important; }\n.page-title { font-family: var(--font-family); font-weight: 600; color: #35383F; }\n\n/* Responsive menu container */\n.responsive-menu-container {\n    display: flex;\n    align-items: center;\n    margin-left: auto;\n    position: relative;\n}\n\n/* Button text styling */\n.reception-icon-btn .btn-text { \n    margin-left: 5px; \n    display: inline-block; \n    vertical-align: middle; \n}\n\n/* Mobile menu styling */\n.mobile-menu-btn { \n    display: none !important; /* Hidden by default */\n    margin-right: 5px;\n    width: 34px;\n    height: 34px;\n    min-width: 34px;\n    padding: 0 !important;\n    align-items: center;\n    justify-content: center;\n}\n\n.mobile-menu-btn i {\n    font-size: 14px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.mobile-dropdown { \n    display: none; /* Hidden by default */\n    position: absolute; \n    top: 46px; /* Position below the header */\n    right: 0; \n    background: white; \n    border-radius: 4px; \n    box-shadow: 0 4px 15px rgba(0,0,0,0.15); \n    z-index: 1000; \n    width: 200px; \n    padding: 10px; \n    border: 1px solid #eaeaea;\n}\n\n.mobile-dropdown.show { display: block; }\n\n.mobile-dropdown .reception-icon-btn { \n    display: flex; \n    align-items: center; \n    width: 100%; \n    text-align: left; \n    margin-bottom: 8px;\n    border-radius: 4px;\n}\n.mobile-dropdown .reception-icon-btn:last-child { margin-bottom: 0; }\n\n/* Regular menu buttons */\n.reception-buttons { \n    display: flex; /* Visible by default */\n}\n\n/* Navbar button container adjustments */\n.page-actions {\n    display: flex !important;\n    align-items: center !important;\n    padding-right: 10px !important;\n}\n\n/* Desktop styles (>=992px) */\n@media (min-width: 992px) {\n    .reception-buttons { display: flex !important; }\n    .mobile-menu-btn { display: none !important; }\n    .reception-icon-btn .btn-text { display: inline-block !important; }\n}\n\n/* Tablet styles (768px-991px) */\n@media (min-width: 768px) and (max-width: 991px) {\n    .reception-buttons { display: flex !important; }\n    .mobile-menu-btn { display: none !important; }\n    .reception-icon-btn { padding: 6px 10px; }\n    .reception-icon-btn .btn-text { display: none !important; }\n}\n\n/* Mobile styles (<768px) */\n@media (max-width: 767px) {\n    .reception-buttons { display: none !important; }\n    .mobile-menu-btn { \n        display: flex !important;\n        margin-left: auto;\n    }\n    .mobile-dropdown .btn-text { \n        display: inline-block !important; \n        margin-left: 10px;\n    }\n    .navbar .container,\n    .layout-side-section,\n    .page-head .container {\n        padding-right: 8px !important;\n    }\n}\n\n/* Small mobile screens */\n@media (max-width: 480px) {\n    .mobile-dropdown { \n        width: calc(100% - 20px); \n        right: 5px; \n        left: auto;\n    }\n    .search-btn, .mobile-menu-btn, .profile-btn {\n        width: 32px !important;\n        height: 32px !important;\n        min-width: 32px !important;\n        margin: 0 1px !important;\n    }\n}\n\n/* Fix for search and profile buttons */\n.search-btn, .profile-btn {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    position: relative !important;\n    padding: 0 !important;\n    width: 34px !important;\n    height: 34px !important;\n    min-width: 34px !important;\n}\n\n.profile-btn .avatar {\n    width: 32px !important;\n    height: 32px !important;\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n}\n\n@media (max-width: 400px) {\n    .profile-btn .avatar {\n        width: 28px !important;\n        height: 28px !important;\n    }\n    .avatar-text {\n        font-size: 12px !important;\n    }\n}\n\n/* Absolute guarantee that mobile menu is hidden on larger screens */\n@media (min-width: 768px) {\n    .mobile-menu-btn {\n        display: none !important;\n        opacity: 0 !important;\n        visibility: hidden !important;\n        position: absolute !important;\n        pointer-events: none !important;\n    }\n}\n</style>').appendTo('head');
}

// HTML structure
function create_dashboard_dom(page) {
    const html = `
        <div id="reception-dashboard">
            <div class="stats-card-container">
                <div class="stats-card" id="total-patients-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fa fa-users"></i></div>
                        <div class="stats-title">Total Patients</div>
                    </div>
                    <div class="stats-value" id="total-patients-count">0</div>
                </div>
                <div class="stats-card" id="total-appointments-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fa fa-calendar-check-o"></i></div>
                        <div class="stats-title">Appointments</div>
                    </div>
                    <div class="stats-value" id="total-appointments-count">0</div>
                </div>
                <div class="stats-card" id="total-doctors-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fa fa-user-md"></i></div>
                        <div class="stats-title">Total Doctors</div>
                    </div>
                    <div class="stats-value" id="total-doctors-count">0</div>
                </div>
                <div class="stats-card" id="checked-in-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fa fa-check-square-o"></i></div>
                        <div class="stats-title">Checked In</div>
                    </div>
                    <div class="stats-value" id="checked-in-count">0</div>
                </div>
                <div class="stats-card" id="closed-appointments-card">
                    <div class="stats-header">
                        <div class="stats-icon"><i class="fa fa-history"></i></div>
                        <div class="stats-title">Closed Appointments</div>
                    </div>
                    <div class="stats-value" id="closed-appointments-count">0</div>
                </div>
            </div>
            
            <!-- Main Content Grid -->
            <div class="grid-container responsive-grid">
                <!-- Left Column - Appointments and Tokens -->
                <div>
                    <!-- Appointments Card -->
                    <div class="dashboard-card">
                        <div class="dashboard-card-header">
                            <div class="header-with-icon">
                                <div class="card-icon">
                                    <i class="fa fa-calendar"></i>
                                </div>
                                <h3 class="dashboard-card-title">Todays Appointments</h3>
                            </div>
                            <div class="header-right">
                                <div class="filter-container">
                                    <select id="doctor-filter" class="form-control form-control-sm filter-select">
                                        <option value="">All Doctors</option>
                                    </select>
                                    <select id="department-filter" class="form-control form-control-sm filter-select">
                                        <option value="">All Departments</option>
                                    </select>
                                    <select id="status-filter" class="form-control form-control-sm filter-select">
                                        <option value="">All Status</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Checked In">Checked In</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Missed">Missed</option>
                                    </select>
                                </div>
                                <div class="menu-dots">
                                    <i class="fa fa-ellipsis-v"></i>
                                </div>
                            </div>
                        </div>
                        <div class="dashboard-card-body">
                            <div class="table-responsive">
                            <table class="table table-rounded">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="appointments-list">
                                    <tr><td colspan="6" class="text-center">Loading appointments...</td></tr>
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Token Queue Management has been removed as requested -->
                </div>
                
                <!-- Right Column - Doctor Availability and Waiting Area -->
                <div>
                    <!-- Doctor Availability Card -->
                    <div class="dashboard-card">
                        <div class="dashboard-card-header">
                            <div class="header-with-icon">
                                <div class="card-icon">
                                    <i class="fa fa-user-md"></i>
                                </div>
                                <h3 class="dashboard-card-title">Doctor Availability</h3>
                            </div>
                            <div class="menu-dots">
                                <i class="fa fa-ellipsis-v"></i>
                            </div>
                        </div>
                        <div class="dashboard-card-body" id="doctor-availability-container">
                            <div class="text-center">Loading doctor availability...</div>
                        </div>
                    </div>
                    
                    <!-- Doctor Availability is the only card in the right column now -->
                </div>
            </div>
            
            <!-- Dashboard-specific footer removed, global footer will be used -->
        </div>
    `;

    $(page.main).html(html);
}

// Load appointments
function refresh_appointments() {
    const doctorFilter = $('#doctor-filter').val() || '';
    const departmentFilter = $('#department-filter').val() || '';
    const statusFilter = $('#status-filter').val() || '';

    frappe.call({
        method: 'healthcare.healthcare.page.reception_dashboard.reception_dashboard.get_appointments',
        args: {
            practitioner: doctorFilter,
            department: departmentFilter,
            status: statusFilter
        },
        callback: function (r) {
            const appointments = r.message || [];

            $('#total-appointments').text(appointments.length);

            let rows = '';
            if (appointments.length === 0) {
                rows = `<tr><td colspan="6" class="text-center">No appointments found</td></tr>`;
            } else {
                appointments.forEach(appt => {
                    const statusClass = get_status_class(appt.status);
                    const isCheckedIn = appt.status === 'Checked In';

                    const appointmentDateTime = appt.appointment_date ? `${appt.appointment_date} ${appt.appointment_time}` : appt.appointment_time;
                    const formattedTime = new Date(appointmentDateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });

                    rows += `
                        <tr>
                            <td>${formattedTime}</td>
                            <td>${appt.patient_name}</td>
                            <td>${appt.practitioner_name}</td>
                            <td>${appt.department || ''}</td>
                            <td><span class="status-badge status-${statusClass.toLowerCase()}">${appt.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-success check-in-btn" data-appointment="${appt.name}" ${isCheckedIn ? 'disabled' : ''}>
                                    ${isCheckedIn ? 'Checked In' : 'Check In'}
                                </button>
                                <button class="btn btn-sm btn-primary view-btn" data-appointment="${appt.name}">View</button>
                            </td>
                        </tr>
                    `;
                });
            }
            $('#appointments-list').html(rows);
        }
    });

    // Also load the doctor and department filters if they're empty
    if ($('#doctor-filter option').length <= 1) {
        frappe.db.get_list('Healthcare Practitioner', {
            fields: ['name', 'practitioner_name']
        }).then(data => {
            const options = ['<option value="">All Doctors</option>']
                .concat(data.map(d => `<option value="${d.name}">${d.practitioner_name || d.name}</option>`));
            $('#doctor-filter').html(options.join(''));
            $('#quick-doctor-select').html(['<option value="">Select Doctor</option>']
                .concat(data.map(d => `<option value="${d.name}">${d.practitioner_name || d.name}</option>`)).join(''));
        });

        frappe.db.get_list('Medical Department', {
            fields: ['name']
        }).then(data => {
            const options = ['<option value="">All Departments</option>']
                .concat(data.map(d => `<option value="${d.name}">${d.name}</option>`));
            $('#department-filter').html(options.join(''));
        });
    }
}

// Set up event handlers
function setup_event_handlers(page) {
    // Appointment filters
    $('#doctor-filter, #department-filter, #status-filter').on('change', function () {
        refresh_appointments();
    });

    // Check-in button
    page.main.on('click', '.check-in-btn', function () {
        const appointmentId = $(this).data('appointment');
        check_in_patient(appointmentId);
    });

    // View appointment button
    page.main.on('click', '.view-btn', function () {
        const appointmentId = $(this).data('appointment');
        frappe.set_route('Form', 'Patient Appointment', appointmentId);
    });

    // Click handlers for stats cards
    page.main.on('click', '#total-patients-card', function () {
        frappe.set_route('List', 'Patient');
    });

    page.main.on('click', '#total-appointments-card', function () {
        frappe.set_route('List', 'Patient Appointment');
    });

    page.main.on('click', '#total-doctors-card', function () {
        frappe.set_route('List', 'Healthcare Practitioner');
    });

    page.main.on('click', '#checked-in-card', function () {
        frappe.set_route('List', 'Patient Appointment', { status: 'Checked In' });
    });

    page.main.on('click', '#closed-appointments-card', function () {
        frappe.set_route('List', 'Patient Appointment', { status: 'Completed' });
    });

    // Token controls removed as requested

    // Quick patient registration has been removed
}

function refresh_stats() {
    const reset_counts = () => {
        $('#total-patients-count').text(0);
        $('#total-appointments-count').text(0);
        $('#total-doctors-count').text(0);
        $('#checked-in-count').text(0);
        $('#closed-appointments-count').text(0);
    };

    frappe.call({
        method: 'healthcare.healthcare.page.reception_dashboard.reception_dashboard.get_stats',
        callback: function(r) {
            if (r.message) {
                const stats = r.message;
                $('#total-patients-count').text(stats.total_patients || 0);
                $('#total-appointments-count').text(stats.total_appointments || 0);
                $('#total-doctors-count').text(stats.total_doctors || 0);
                $('#checked-in-count').text(stats.checked_in_appointments || 0);
                $('#closed-appointments-count').text(stats.completed_appointments || 0);
            } else {
                console.error("No data received from get_stats");
                reset_counts();
            }
        },
        error: function(err) {
            console.error("API call to get_stats failed:", err);
            reset_counts();
        }
    });
}

// Refresh doctor availability
function refresh_doctor_availability() {
    frappe.call({
        method: 'healthcare.healthcare.page.reception_dashboard.reception_dashboard.get_doctor_availability',
        callback: function (r) {
            const doctors = r.message || [];
            let html = '';

            if (doctors.length === 0) {
                html = '<div class="text-center">No doctors available</div>';
            } else {
                doctors.forEach(doc => {
                    const statusClass = get_doctor_status_class(doc.status);

                    html += `
                        <div class="doctor-status-card ${statusClass}">
                            <div class="doctor-info">
                                <div class="doctor-name">${doc.practitioner_name}</div>
                                <div class="doctor-department">${doc.department || 'General'}</div>
                            </div>
                            <span class="doctor-status ${statusClass}">${doc.status}</span>
                        </div>
                    `;
                });
            }

            $('#doctor-availability-container').html(html);
        }
    });
}

// Check in a patient
function check_in_patient(appointment_id) {
    frappe.call({
        method: 'healthcare.healthcare.page.reception_dashboard.reception_dashboard.check_in_patient',
        args: { appointment_id },
        callback: function (r) {
            if (r.message && r.message.status === 'success') {
                frappe.show_alert({
                    message: r.message.message || 'Patient checked in successfully',
                    indicator: 'green'
                });

                // Refresh dashboard data
                frappe.reception_dashboard.refresh();
            } else {
                frappe.show_alert({
                    message: 'Failed to check in patient',
                    indicator: 'red'
                });
            }
        }
    });
}

// Utility functions
function get_status_class(status) {
    const statusMap = {
        'Scheduled': 'scheduled',
        'Open': 'scheduled',
        'Closed': 'completed',
        'Cancelled': 'cancelled',
        'Missed': 'missed',
        'Checked In': 'checked-in',
        'In Progress': 'in-progress',
        'Completed': 'completed'
    };

    return statusMap[status] || 'scheduled';
}

function get_doctor_status_class(status) {
    const statusMap = {
        'Available': 'available',
        'In Consultation': 'in-consultation',
        'On Break': 'on-break',
        'Not Available': 'unavailable'
    };

    return statusMap[status] || 'unavailable';
}

// Helper function to refresh all data
function refresh_dashboard() {
    refresh_stats();
    refresh_appointments();
    refresh_doctor_availability();
}

// Apply splash screen styles to avoid duplication in other CSS blocks
function applySplashScreenStyles() {
    const splashStyle = document.createElement('style');
    splashStyle.textContent = `
        /* Splash Screen Styles */
        .splash-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f7fa;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
        }
        
        .splash-container {
            text-align: center;
            max-width: 400px;
        }
        
        .splash-icon-container {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 20px;
        }
        
        .healthcare-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulse-icon 2s infinite;
            z-index: 2;
        }
        
        .stethoscope {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.7;
            animation: rotate-stethoscope 10s infinite linear;
        }
        
        .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid rgba(70, 130, 180, 0.3);
            animation: pulse-ring 2s infinite;
        }
        
        .splash-text h2 {
            color: #4682b4;
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .loading-text {
            color: #6c757d;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .loading-bar {
            height: 4px;
            background-color: rgba(70, 130, 180, 0.2);
            border-radius: 2px;
            overflow: hidden;
            position: relative;
            width: 200px;
            margin: 0 auto;
        }
        
        .loading-progress {
            position: absolute;
            height: 100%;
            width: 30%;
            background-color: #4682b4;
            border-radius: 2px;
            animation: loading-animation 2s infinite ease-in-out;
        }
        
        @keyframes pulse-icon {
            0% {
                transform: translate(-50%, -50%) scale(1);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes pulse-ring {
            0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.8;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.4;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.8;
            }
        }
        
        @keyframes rotate-stethoscope {
            0% {
                transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }
        
        @keyframes loading-animation {
            0% {
                left: -30%;
            }
            50% {
                left: 100%;
            }
            100% {
                left: -30%;
            }
        }
    `;
    document.head.appendChild(splashStyle);
}

// Show animated loading splash screen
function showLoadingSplash() {
    // Create splash screen if it doesn't exist
    if (!$('#healthcare-splash-screen').length) {
        $('body').append(`
            <div id="healthcare-splash-screen" class="splash-screen">
                <div class="splash-container">
                    <div class="splash-icon-container">
                        <div class="pulse-ring"></div>
                        <div class="healthcare-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="72" height="72" fill="#4682b4">
                                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 14H14V18H10V14H6V10H10V6H14V10H18V14Z"/>
                            </svg>
                        </div>
                        <div class="stethoscope">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100" fill="none" stroke="#4682b4" stroke-width="1.5">
                                <path d="M12 12V19C12 20.1046 11.1046 21 10 21H9C7.89543 21 7 20.1046 7 19V18C7 16.8954 7.89543 16 9 16H10C11.1046 16 12 16.8954 12 18M12 12V5M12 12H15.5C17.1569 12 18.5 13.3431 18.5 15C18.5 16.6569 17.1569 18 15.5 18C13.8431 18 12.5 16.6569 12.5 15V12" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="5" cy="5" r="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="19" cy="5" r="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="splash-text">
                        <h2>SumaSoft Healthcare</h2>
                        <div class="loading-text">Loading reception dashboard...</div>
                        <div class="loading-bar">
                            <div class="loading-progress"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // Show the splash screen
    $('#healthcare-splash-screen').fadeIn(300);
}

// Hide loading splash screen
function hideLoadingSplash() {
    $('#healthcare-splash-screen').fadeOut(500, function () {
        $(this).remove();
    });
}

// Generate consistent color based on name
function getAvatarColor(name) {
    // List of professional colors that work well with white text
    const colors = [
        '#4682b4', // Steel Blue (primary theme color)
        '#5f9ea0', // Cadet Blue
        '#6a5acd', // Slate Blue
        '#2e8b57', // Sea Green
        '#8a2be2', // Blue Violet
        '#20b2aa', // Light Sea Green
        '#4169e1', // Royal Blue
        '#ff69b4', // Pink (for variety)
        '#ff6347', // Tomato
        '#7b68ee'  // Medium Slate Blue
    ];

    // Generate a hash from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to pick a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Function to show search modal
function show_search_modal() {
    // Create modal if it doesn't exist
    if (!$('#reception-search-modal').length) {
        $('body').append(`
            <div class="modal fade" id="reception-search-modal" tabindex="-1" role="dialog" aria-labelledby="searchModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="searchModalLabel">Search</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="search-container mb-4">
                                <div class="input-group">
                                    <input type="text" id="reception-search-input" class="form-control form-control-lg" placeholder="Search patients, appointments, doctors..." autocomplete="off">
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" type="button" id="reception-search-button">
                                            <i class="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="search-filters mt-2">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="search-patients" value="Patient" checked>
                                        <label class="form-check-label" for="search-patients">Patients</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="search-appointments" value="Patient Appointment" checked>
                                        <label class="form-check-label" for="search-appointments">Appointments</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="search-practitioners" value="Healthcare Practitioner" checked>
                                        <label class="form-check-label" for="search-practitioners">Doctors</label>
                                    </div>
                                </div>
                            </div>
                            <div id="reception-search-results" class="mt-3">
                                <div class="text-center text-muted">
                                    <i class="fa fa-search fa-2x mb-2"></i>
                                    <p>Enter search term to find patients, appointments, or doctors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Add search functionality
        $('#reception-search-button, #reception-search-input').on('click keypress', function (e) {
            if (e.type === 'click' || (e.type === 'keypress' && e.which === 13)) {
                perform_search();
            }
        });

        // Add realtime search as user types (with debounce)
        let searchTimeout;
        $('#reception-search-input').on('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(perform_search, 300);
        });
    }

    // Reset the search modal
    $('#reception-search-input').val('');
    $('#reception-search-results').html(`
        <div class="text-center text-muted">
            <i class="fa fa-search fa-2x mb-2"></i>
            <p>Enter search term to find patients, appointments, or doctors</p>
        </div>
    `);

    // Show the modal
    $('#reception-search-modal').modal('show');

    // Focus the search input
    setTimeout(() => $('#reception-search-input').focus(), 500);
}

// Function to perform search
function perform_search() {
    const searchTerm = $('#reception-search-input').val().trim();
    if (!searchTerm || searchTerm.length < 2) {
        return; // Don't search for empty or very short terms
    }

    // Get selected doctype filters
    const doctypes = [];
    if ($('#search-patients').prop('checked')) doctypes.push('Patient');
    if ($('#search-appointments').prop('checked')) doctypes.push('Patient Appointment');
    if ($('#search-practitioners').prop('checked')) doctypes.push('Healthcare Practitioner');

    if (doctypes.length === 0) {
        frappe.show_alert('Please select at least one category to search');
        return;
    }

    // Show loading
    $('#reception-search-results').html(`
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2">Searching...</p>
        </div>
    `);

    // Perform search for each doctype
    let searches = doctypes.map(doctype => {
        return new Promise((resolve) => {
            let fields, filters;

            // Configure fields and filters based on doctype
            if (doctype === 'Patient') {
                fields = ['name', 'patient_name', 'mobile', 'email', 'gender', 'blood_group', 'dob'];
                filters = [
                    ['name', 'like', '%' + searchTerm + '%'],
                    ['patient_name', 'like', '%' + searchTerm + '%'],
                    ['mobile', 'like', '%' + searchTerm + '%']
                ];
            }
            else if (doctype === 'Patient Appointment') {
                fields = ['name', 'patient', 'patient_name', 'practitioner', 'practitioner_name', 'appointment_date', 'appointment_time', 'status'];
                filters = [
                    ['patient', 'like', '%' + searchTerm + '%'],
                    ['patient_name', 'like', '%' + searchTerm + '%'],
                    ['practitioner_name', 'like', '%' + searchTerm + '%']
                ];
            }
            else if (doctype === 'Healthcare Practitioner') {
                fields = ['name', 'practitioner_name', 'department', 'mobile_phone'];
                filters = [
                    ['name', 'like', '%' + searchTerm + '%'],
                    ['practitioner_name', 'like', '%' + searchTerm + '%']
                ];
            }

            frappe.db.get_list(doctype, {
                fields: fields,
                filters: [['or', filters]],
                limit: 10
            }).then(results => {
                resolve({ doctype, results });
            }).catch(() => {
                resolve({ doctype, results: [] });
            });
        });
    });

    // Process all search results
    Promise.all(searches).then(results => {
        let html = '';
        let totalResults = 0;

        results.forEach(({ doctype, results }) => {
            if (results.length > 0) {
                totalResults += results.length;

                html += `<div class="search-category mb-4">
                    <h5 class="mb-3">${doctype}s (${results.length})</h5>
                    <div class="list-group">`;

                results.forEach(result => {
                    if (doctype === 'Patient') {
                        html += `
                            <a href="#" class="list-group-item list-group-item-action search-result-item" data-doctype="${doctype}" data-name="${result.name}">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <h6 class="mb-1">${result.patient_name || 'Unnamed Patient'}</h6>
                                    <span class="badge badge-light">${result.name}</span>
                                </div>
                                <p class="mb-0 small">Phone: ${result.mobile || 'N/A'} | Gender: ${result.gender || 'N/A'} | DOB: ${result.dob ? frappe.format(result.dob, { fieldtype: 'Date' }) : 'N/A'}</p>
                            </a>
                        `;
                    } else if (doctype === 'Patient Appointment') {
                        const formattedDate = frappe.format(result.appointment_date, { fieldtype: 'Date' });
                        let statusClass = 'secondary';
                        if (result.status === 'Scheduled') statusClass = 'info';
                        else if (result.status === 'Checked In') statusClass = 'success';
                        else if (result.status === 'Cancelled') statusClass = 'danger';

                        html += `
                            <a href="#" class="list-group-item list-group-item-action search-result-item" data-doctype="${doctype}" data-name="${result.name}">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <h6 class="mb-1">${result.patient_name || 'Unnamed Patient'}</h6>
                                    <span class="badge badge-${statusClass}">${result.status || 'N/A'}</span>
                                </div>
                                <p class="mb-0 small">Dr. ${result.practitioner_name || 'N/A'} | ${formattedDate || 'N/A'} ${result.appointment_time || ''}</p>
                            </a>
                        `;
                    } else if (doctype === 'Healthcare Practitioner') {
                        html += `
                            <a href="#" class="list-group-item list-group-item-action search-result-item" data-doctype="${doctype}" data-name="${result.name}">
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <h6 class="mb-1">Dr. ${result.practitioner_name || 'Unnamed Doctor'}</h6>
                                    <span class="badge badge-light">${result.department || 'N/A'}</span>
                                </div>
                                <p class="mb-0 small">Phone: ${result.mobile_phone || 'N/A'}</p>
                            </a>
                        `;
                    }
                });

                html += '</div></div>';
            }
        });

        if (totalResults === 0) {
            html = `
                <div class="text-center text-muted p-4">
                    <i class="fa fa-search fa-2x mb-2"></i>
                    <p>No results found for "${searchTerm}"</p>
                </div>
            `;
        }

        $('#reception-search-results').html(html);

        // Add click handlers for search results
        $('.search-result-item').on('click', function (e) {
            e.preventDefault();
            const doctype = $(this).data('doctype');
            const name = $(this).data('name');

            // Close the modal
            $('#reception-search-modal').modal('hide');

            // Navigate to the document
            frappe.set_route('Form', doctype, name);
        });
    });
}

function add_css() {
    const style = document.createElement('style');
    style.textContent = `
        /* CSS Variables */
        :root {
            --primary-color: #4682b4; /* Steel blue as per theme */
            --primary-hover: #3a6d96; /* Darker steel blue for hover */
            --success: #4caf50;
            --info: #03a9f4;
            --warning: #ff9800;
            --danger: #f44336;
            --secondary: #9e9e9e;
            --white: #ffffff;
            --black: #000000;
            --purple-card: #f1eaff;
            --blue-card: #e9f5ff;
            --yellow-card: #f6ff9a;
            --yellow-bright: #fcff64;
            --light-gray: #f5f7fa; /* Light gray as per theme */
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Dashboard Main Styles */
        #reception-dashboard {
            background-color: var(--light-gray);
            font-family: var(--font-family);
        }
        
        @media (max-width: 768px) {
            #reception-dashboard {
                padding: 16px 12px;
            }
        }
        
        /* Stats Card Layout */
        .stats-card-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            overflow-x: auto; /* Add horizontal scroll on smaller screens */
            padding: 10px; /* Add space around the cards and for the scrollbar */
        }

        .stats-card {
            flex: 1 0 160px; /* Prevent shrinking, allow growing, base width 160px */
            background-color: #ffffff;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        

        
        @media (max-width: 768px) {
            .stats-card {
                flex: 1 0 100%;
                margin-bottom: 0;
            }
        }
        
        .stats-card:nth-child(1) {
            background-color: var(--purple-card);
        }

        .stats-card:nth-child(4) {
            background-color: #FFE4B5; /* Pastel Orange */
        }
        
        .stats-card:nth-child(2) {
            background-color: var(--blue-card);
        }
        
        .stats-card:nth-child(3) {
            background-color: var(--yellow-card);
        }
        
        .stats-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-color);
            margin-top: 0;
            margin-bottom: 0;
            display: flex;
            align-items: center;
        }
        
        .stats-value {
            font-size: 32px; /* Slightly larger font for emphasis */
            font-weight: 700;
            color: var(--black);
            margin-top: 4px; /* Add some space between title and value */
        }
        
        .dashboard-card {
            background-color: var(--white);
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
            margin-bottom: 24px;
            overflow: hidden;
        }
        
        .dashboard-card-header {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .header-with-icon {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            margin-right: 15px;
        }
        
        .header-right {
            display: flex;
            align-items: center;
            flex-grow: 1;
        }
        
        @media (max-width: 768px) {
            .dashboard-card-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .header-with-icon {
                margin-bottom: 10px;
                margin-right: 0;
            }
            
            .header-right {
                width: 100%;
            }
        }
        
        .dashboard-card-body {
            padding: 20px;
            overflow-x: auto;
        }
        
        @media (max-width: 768px) {
            .dashboard-card-body {
                padding: 15px 10px;
            }
        }
        
        .reception-dashboard-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
        }
        
        .reception-dashboard-table thead th {
            color: var(--secondary);
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            padding: 10px 15px;
            text-align: left;
        }
        
        .reception-dashboard-table tbody tr {
            background-color: var(--light-gray);
            border-radius: 8px;
        }
        
        .reception-dashboard-table tbody td {
            padding: 12px 15px;
            font-size: 14px;
        }
        
        .reception-dashboard-table tbody td:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        
        .reception-dashboard-table tbody td:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        
        .reception-buttons .btn {
            margin-right: 5px;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: var(--white);
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        
        .reception-buttons .btn:hover {
            background-color: var(--primary-hover);
            border-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .status-pill {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
        }
        
        .status-scheduled {
            background-color: var(--info);
            color: var(--black);
        }
        
        .status-arrived {
            background-color: var(--warning);
            color: var(--white);
        }
        
        .status-ongoing {
            background-color: var(--purple-card);
            color: var(--primary-color);
        }
        
        .status-completed {
            background-color: var(--success);
            color: var(--white);
        }
        
        .status-cancelled {
            background-color: var(--danger);
            color: var(--white);
        }
        
        .status-absent {
            background-color: var(--secondary);
            color: var(--white);
        }
        
        /* Filter styles */
        .filter-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            flex-grow: 1;
        }
        
        @media (max-width: 991px) {
            .filter-container {
                flex-wrap: wrap;
                gap: 8px;
            }
        }
        
        @media (max-width: 768px) {
            .filter-container {
                margin-top: 10px;
                width: 100%;
            }
        }
        
        .filter-select {
            flex: 1;
            min-width: 90px;
            max-width: 140px;
            font-size: 12px;
            height: 30px;
            padding: 0 8px;
            border-radius: 4px;
            border-color: #e0e0e0;
            background-color: #f9f9f9;
        }
        
        @media (max-width: 991px) {
            .filter-select {
                flex: 1;
                max-width: none;
            }
        }
        
        @media (max-width: 768px) {
            .filter-select {
                min-width: 0;
                width: 100%;
                max-width: none;
                margin-bottom: 5px;
            }
        }
        
        .doctor-card {
            background-color: var(--white);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            position: relative;
        }
        
        .doctor-status-available {
            border-right: 4px solid var(--success);
        }
        
        .doctor-status-busy {
            border-right: 4px solid var(--warning);
        }
        
        .doctor-status-away {
            border-right: 4px solid var(--danger);
        }
        
        .doctor-image {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 15px;
        }
        
        .doctor-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .doctor-info {
            flex: 1;
        }
        
        .doctor-name {
            font-weight: 600;
            margin: 0 0 5px;
            font-size: 15px;
            color: #000000;
        }
        
        .doctor-department {
            color: var(--secondary);
            font-size: 13px;
            margin: 0;
        }
        
        .menu-dots {
            position: absolute;
            top: 15px;
            right: 15px;
            color: var(--secondary);
            cursor: pointer;
        }
        
        .dashboard-appointment-date {
            font-weight: 500;
            margin-top: 0;
            margin-bottom: 15px;
            padding-left: 5px;
            color: var(--primary-color);
            border-left: 3px solid var(--primary-color);
        }
        
        .appointment-card {
            background-color: var(--light-gray);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .appointment-time {
            font-weight: 600;
            margin: 0 0 8px;
            color: var(--primary-color);
        }
        
        .appointment-patient {
            font-size: 15px;
            margin: 0 0 5px;
            font-weight: 500;
        }
        
        .appointment-details {
            color: var(--secondary);
            font-size: 13px;
            margin: 0;
        }
        
        .btn-check-in {
            background-color: var(--success);
            color: var(--white);
            border-radius: 8px;
            border: none;
        }
        
        .btn-view {
            background-color: var(--primary-color);
            color: var(--white);
            border-radius: 8px;
            border: none;
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            display: inline-block;
        }
        
        .status-scheduled {
            background-color: rgba(3, 169, 244, 0.15);
            color: #0288d1;
        }
        
        .status-checked-in {
            background-color: rgba(76, 175, 80, 0.15);
            color: #388e3c;
        }
        
        .status-in-progress {
            background-color: rgba(255, 152, 0, 0.15);
            color: #f57c00;
        }
        
        .status-completed {
            background-color: rgba(53, 56, 63, 0.15);
            color: #35383F;
        }
        
        .status-missed, .status-cancelled {
            background-color: rgba(244, 67, 54, 0.15);
            color: #d32f2f;
        }
        
        .grid-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        
        .doctor-status-card {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 10px;
            background-color: var(--light-gray);
            border-left: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
        }
        
        .doctor-status {
            font-size: 13px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 12px;
            align-self: center;
        }
        
        .doctor-status.available {
            background-color: rgba(76, 175, 80, 0.15);
            color: var(--black);
        }
        
        .doctor-status.in-consultation {
            background-color: rgba(255, 152, 0, 0.15);
            color: var(--black);
        }
        
        .doctor-status.on-break {
            background-color: rgba(158, 158, 158, 0.15);
            color: var(--black);
        }
        
        .doctor-status.unavailable {
            background-color: rgba(244, 67, 54, 0.15);
            color: var(--black);
        }
        
        .doctor-status-card.available {
            border-left: none;
            border-right: 4px solid var(--success);
        }
        
        .doctor-status-card.in-consultation {
            border-left: none;
            border-right: 4px solid var(--warning);
        }
        
        .doctor-status-card.on-break {
            border-left: none;
            border-right: 4px solid var(--secondary);
        }
        
        .doctor-status-card.unavailable {
            border-left: none;
            border-right: 4px solid var(--danger);
        }
        
        .btn-sm {
            padding: 5px 12px;
            font-size: 13px;
        }
        
        /* Professional greeting styles */
        .professional-greeting {
            display: flex;
            flex-direction: column;
            margin: 0;
            line-height: 1.2;
            position: relative;
            padding-left: 15px;
        }
        
        .professional-greeting:before {
            content: '';
            position: absolute;
            left: 0;
            top: 2px;
            height: 85%;
            width: 4px;
            background: linear-gradient(to bottom, #4682b4, #6f9fd8);
            border-radius: 2px;
        }
        
        .greeting-text {
            font-size: 14px;
            font-weight: 400;
            color: #6c757d; /* Subtle gray */
            margin: 0;
            font-family: 'Inter', sans-serif;
        }
        
        .user-name {
            font-size: 20px;
            font-weight: 600;
            color: #4682b4; /* Steel blue */
            margin: 0;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.2px;
        }
        
        /* Original style kept for compatibility */
        .custom-greeting {
            font-size: 22px;
            font-weight: 600;
            color: #4682b4; /* Steel blue */
            margin: 0;
        }
        
        .custom-greeting::after {
            content: '';
            display: block;
            width: 0;
            height: 2px;
            background-color: #4682b4;
            position: absolute;
            bottom: -3px;
            left: 0;
            transition: width 0.3s ease;
        }
        
        .custom-greeting:hover::after {
            width: 100%;
        }
        
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        /* Icon button styles */
        .reception-icon-btn {
            padding: 6px 10px;
            margin-right: 5px;
            background-color: #4682b4; /* Steel blue */
            border-color: #4682b4;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .reception-icon-btn:hover {
            background-color: #3a6d96; /* Darker steel blue on hover */
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .reception-icon-btn i {
            font-size: 15px;
            line-height: 1;
            color: white;
        }
        
        /* All buttons with reception-icon-btn class will have same styling */
        .reception-icon-btn,
        .page-head .search-btn.reception-icon-btn,
        .page-head .profile-btn.reception-icon-btn {
            padding: 6px 10px;
            margin-right: 5px;
            background-color: #4682b4 !important; /* Steel blue */
            border-color: #4682b4 !important;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: white !important;
        }
        
        /* Consistent hover effects for all buttons */
        .reception-icon-btn:hover,
        .page-head .search-btn.reception-icon-btn:hover,
        .page-head .profile-btn.reception-icon-btn:hover {
            background-color: #3a6d96 !important; /* Darker steel blue on hover */
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Ensure search icon is white */
        .page-head .search-btn.reception-icon-btn .icon {
            stroke: white !important;
        }
        
        /* Style profile button */
        .page-head .profile-btn.reception-icon-btn {
            overflow: visible;
            z-index: 100;
        }
        
        /* Fix avatar sizing in profile button */
        .page-head .profile-btn.reception-icon-btn .avatar {
            width: 36px !important;
            height: 36px !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Animated avatar styles */
        .animated-avatar-inner {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-radius: 50%;
            overflow: hidden;
        }
        
        .avatar-text {
            color: white;
            font-weight: 600;
            font-size: 18px;
            z-index: 2;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .avatar-ring {
            position: absolute;
            top: -5%;
            left: -5%;
            width: 110%;
            height: 110%;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.7);
            box-sizing: border-box;
            opacity: 0;
            z-index: 1;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(0.9);
                opacity: 0;
            }
            50% {
                opacity: 0.5;
            }
            100% {
                transform: scale(1.3);
                opacity: 0;
            }
        }
        
        /* Hover effects */
        .page-head .profile-btn.reception-icon-btn:hover .avatar {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

    `;

    // Add stats card container styling
    style.textContent += `
        /* Stats card container */
        .stats-card-container {
        }

    `;

    // Add page-head positioning to top
    style.textContent += `
        /* Position page header at top with no space */
        .page-head {
            top: 0 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        
        .page-head .container {
            padding-top: 0 !important;
        }
        
        /* Adjust stats container for new header position */
        #reception-dashboard-container {
            margin-top: 10px;
        }

    `;

    // Add responsive grid styles
    style.textContent += `
        /* Responsive grid layout */
        .responsive-grid {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 20px;
        }
        
        /* Table responsiveness */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        /* Mobile styles */
        @media (max-width: 991px) {
            .responsive-grid {
                grid-template-columns: 1fr 300px;
                gap: 15px;
            }
        }
        
        @media (max-width: 768px) {
            .responsive-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .custom-greeting {
                font-size: 20px;
            }
            
            .reception-icon-btn {
                width: 32px;
                height: 32px;
            }
            
            /* Improve table display on mobile */
            .table-rounded th:not(:first-child):not(:last-child),
            .table-rounded td:not(:first-child):not(:last-child) {
                display: none;
            }
            
            .table-rounded th:nth-child(2),
            .table-rounded td:nth-child(2),
            .table-rounded th:nth-child(5),
            .table-rounded td:nth-child(5) {
                display: table-cell;
            }
            
            /* Make action buttons full width on mobile */
            .btn-check-in, .btn-view {
                display: block;
                width: 100%;
                margin-bottom: 5px;
            }
            
            /* Adjust doctor cards for mobile */
            .doctor-card {
                flex-direction: column;
            }
            
            .doctor-image {
                margin-bottom: 10px;
                margin-right: 0;
            }
        }
        
        @media (max-width: 480px) {
            #reception-dashboard {
                padding: 10px 8px;
            }
            
            .stats-card-container {
                margin-bottom: 15px;
            }
            
            .dashboard-card-header {
                padding: 12px 15px;
            }
            
            .dashboard-card-title {
                font-size: 11px;
            }
            
            /* Stack action buttons vertically on very small screens */
            .reception-buttons {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }

    `;
    
    // Add reception dashboard footer styles
    style.textContent += `
        /* Reception Dashboard Footer Styles */
        .reception-dashboard-footer {
            background-color: #f5f7fa;
            border-top: 1px solid #e0e0e0;
            margin-top: 40px;
            padding: 30px 20px 15px;
            border-radius: 0 0 8px 8px;
        }
        
        .reception-dashboard-footer .footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 20px;
        }
        
        .reception-dashboard-footer .footer-section {
            flex: 1;
            min-width: 250px;
        }
        
        .reception-dashboard-footer h4 {
            font-size: 15px;
            font-weight: 600;
            color: #4682b4;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(70, 130, 180, 0.2);
        }
        
        /* Quick Action Buttons */
        .reception-dashboard-footer .quick-action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .reception-footer-btn {
            background-color: rgba(70, 130, 180, 0.1);
            color: #4682b4;
            border: 1px solid rgba(70, 130, 180, 0.2);
            transition: all 0.2s;
            padding: 6px 10px;
            border-radius: 4px;
        }
        
        .reception-footer-btn:hover {
            background-color: rgba(70, 130, 180, 0.2);
            color: #2c5178;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .reception-footer-btn i {
            margin-right: 5px;
        }
        
        /* Stats Summary Section */
        .footer-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .footer-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: white;
            padding: 10px;
            border-radius: 6px;
            min-width: 70px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        
        .footer-stat-item i {
            font-size: 18px;
            color: #4682b4;
            margin-bottom: 5px;
        }
        
        .footer-stat-item .stat-label {
            font-size: 11px;
            color: #777;
            margin-bottom: 3px;
        }
        
        .footer-stat-item .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        /* Help & Support Section */
        .support-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .support-link {
            color: #4682b4;
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .support-link:hover {
            color: #2c5178;
            text-decoration: underline;
        }
        
        .support-link i {
            margin-right: 8px;
            width: 16px;
            text-align: center;
        }
        
        /* Footer Bottom Section */
        .footer-bottom {
            margin-top: 20px;
            text-align: center;
            padding-top: 12px;
            border-top: 1px solid #e0e0e0;
        }
        
        .footer-bottom p {
            font-size: 12px;
            color: #777;
            margin: 0;
        }
        
        /* Responsive Footer Adjustments */
        @media (max-width: 991px) {
            .reception-dashboard-footer .footer-content {
                flex-direction: column;
                gap: 30px;
            }
            
            .reception-dashboard-footer .footer-section {
                width: 100%;
            }
            
            .footer-stats {
                justify-content: center;
            }
        }
        
        @media (max-width: 480px) {
            .reception-dashboard-footer {
                padding: 20px 15px 10px;
                margin-top: 30px;
            }
            
            .reception-dashboard-footer h4 {
                font-size: 14px;
                margin-bottom: 10px;
            }
        }
    `;
    document.head.appendChild(style);
}
