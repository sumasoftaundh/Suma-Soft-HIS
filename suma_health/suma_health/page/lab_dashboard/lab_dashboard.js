frappe.pages['lab_dashboard'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Hi, ' + frappe.session.user_fullname,
        single_column: true
    });

    let user = frappe.session.user;
    // Setup header buttons first
    setup_header_buttons(page);

    // Then render the main dashboard layout
    page.main.html(render_dashboard_layout(user));

    // Load all dashboard data
    load_kpis();
    load_lab_test_queue();
    load_sample_collection_data();
    load_reports_for_delivery();
    load_alerts();
    add_dashboard_footer(page);

    function set_dashboard_styles() {
        const style_id = 'lab-dashboard-styles-' + new Date().getTime();
        frappe.dom.set_style(`
            .lab-dashboard-container {
                /* New background for glass effect */
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 15px;
            }

            .table-card {
                background: rgba(255, 255, 255, 0.35);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.25);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                padding: 20px;
                margin-bottom: 20px;
                transition: transform 0.3s ease, box-shadow 0.3s ease; /* Interactive transition */
            }

            .table-card:hover {
                transform: translateY(-5px); /* Lift effect on hover */
                box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45); /* Enhanced shadow on hover */
            }
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                padding: 15px 0;
                grid-auto-rows: minmax(160px, auto);
            }
            /* Responsive breakpoints for different screen sizes */
            @media (max-width: 1400px) {
                .kpi-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            @media (max-width: 992px) {
                .kpi-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            @media (max-width: 576px) {
                .kpi-grid {
                    grid-template-columns: 1fr;
                }
            }
            .kpi-grid .kpi-card {
                /* Refined glass effect styles */
                background: rgba(255, 255, 255, 0.35);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.25);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                transition: transform 0.3s ease, box-shadow 0.3s ease; /* Interactive transition */

                /* Original flexbox styles */
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                padding: 20px;
                border-radius: 15px;
                font-family: 'Inter', sans-serif;
                min-height: 160px;
                color: #333;
                box-sizing: border-box;
            }

            .kpi-grid .kpi-card:hover {
                transform: translateY(-5px); /* Lift effect on hover */
                box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45); /* Enhanced shadow on hover */
            }
            .kpi-grid .kpi-card-main {
                flex-grow: 1; /* This makes the main content area expand */
                overflow-wrap: break-word;
                /* No need for flex here, the parent is already handling the main layout */
            }
            .kpi-card .card-icon-label {
                display: flex;
                align-items: center;
            }
            .kpi-card .card-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            .kpi-card .card-label {
                font-size: 14px;
                font-weight: 500;
            }
            .kpi-card .card-value {
                font-size: 32px;
                font-weight: 700;
                margin-top: 5px;
            }
            .kpi-card .card-sub-label {
                font-size: 12px;
                color: #6c757d;
                padding-top: 10px; /* Add breathing room */
            }
            .btn-primary {
                 background-color: #367EFE !important;
                 border-color: #367EFE !important;
            }
        `, style_id);
    }

    set_dashboard_styles();

    function render_dashboard_layout(user) {
        return `
            <div class="lab-dashboard-container">
                <div id="kpi-widgets-container"></div>
                <div class="dashboard-columns">
                    <div class="main-column">
                        <div id="lab-test-queue-container" class="dashboard-section"></div>
                        <div id="reports-delivery-container" class="dashboard-section"></div>
                    </div>
                    <div class="side-column">
                        <div id="alerts-container" class="dashboard-section"></div>
                        <div id="sample-collection-container" class="dashboard-section"></div>
                    </div>
                </div>
            </div>`;
    }

    function load_kpis() {
        frappe.call({ method: 'healthcare.healthcare.page.lab_dashboard.lab_dashboard.get_kpi_data', callback: r => { if (r.message) render_kpi_widgets(r.message); } });
    }

    function render_kpi_widgets(data) {
        // Add responsive styles for KPI cards
        const style_id = 'kpi-responsive-styles-' + new Date().getTime();
        frappe.dom.set_style(`
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                padding: 15px 0;
            }
            .kpi-card {
                border-radius: 12px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
            }
            .kpi-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.12);
            }
            .kpi-card-main {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            .card-icon-label {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
                flex: 1;
            }
            .card-icon {
                font-size: calc(18px + 0.5vw);
                margin-right: 10px;
                color: #ff69b4; /* Pink color from theme */
            }
            .card-label {
                font-size: clamp(13px, 0.9vw, 16px);
                font-weight: 500;
                word-break: break-word;
            }
            .card-value {
                font-size: clamp(24px, 1.8vw, 36px);
                font-weight: 700;
                color: #333;
                margin-left: 10px;
            }
            @media (max-width: 767px) {
                .kpi-grid {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                }
                .card-icon-label {
                    margin-bottom: 8px;
                }
                .kpi-card-main {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .card-value {
                    align-self: flex-end;
                    margin-top: 5px;
                    margin-left: 0;
                }
            }
        `, style_id);
        
        const items = [
            { label: 'Total Lab Tests Today', value: data.total_tests_today, icon: 'flask', color: '#F2EFFF'},
            { label: 'Pending Tests', value: data.pending_tests, icon: 'hourglass-half', color: '#E6F3FF'},
            { label: 'Reports Ready', value: data.reports_ready, icon: 'check-circle', color: '#FFFACD'},
            { label: 'Overdue Tests', value: data.overdue_tests, icon: 'exclamation-triangle', color: '#FEE7E7'}
        ];
        
        const html = items.map(i => `
            <div class="kpi-card" style="background-color: ${i.color};">
                <div class="kpi-card-main">
                    <div class="card-icon-label">
                        <i class="fa fa-${i.icon} card-icon"></i>
                        <span class="card-label">${i.label}</span>
                    </div>
                    <div class="card-value">${i.value}</div>
                </div>
            </div>`).join('');
            
        $('#kpi-widgets-container').html(`<div class="kpi-grid">${html}</div>`);
    }

    function load_lab_test_queue() {
        frappe.call({ method: 'healthcare.healthcare.page.lab_dashboard.lab_dashboard.get_lab_test_queue', callback: r => { if (r.message) render_lab_test_queue(r.message); } });
    }

    function render_lab_test_queue(data) {
        // Add style for inline action buttons
        const style_id = 'lab-test-queue-styles-' + new Date().getTime();
        frappe.dom.set_style(`
            .action-buttons-inline {
                display: flex;
                gap: 5px;
                justify-content: flex-start;
                align-items: center;
            }
            .action-buttons-inline .btn {
                margin: 0;
                flex-grow: 0;
                white-space: nowrap;
            }
        `, style_id);

        const html = `
            <div class="table-card">
                <div class="table-header"><h4>Lab Test Queue</h4></div>
                <table class="lab-tests-table">
                    <thead><tr><th>Patient</th><th>Test</th><th>Status</th><th>Assigned To</th><th>Expected By</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${data.map(row => `
                            <tr data-test-id="${row.name}">
                                <td>${row.patient_name}</td>
                                <td>${row.lab_test_name}</td>
                                <td><span class="status-badge status-${row.status.toLowerCase().replace(/ /g, '-')}">${row.status}</span></td>
                                <td>${row.assigned_technician || 'Unassigned'}</td>
                                <td>${frappe.datetime.str_to_user(row.expected_result_date)}</td>
                                <td>
                                    <div class="action-buttons-inline">
                                        <button class="btn btn-xs btn-primary btn-assign" data-test-id="${row.name}">Assign</button>
                                        <button class="btn btn-xs btn-info btn-view" data-test-id="${row.name}">View</button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        $('#lab-test-queue-container').html(html);
        
        // Attach event handlers to buttons
        $('.btn-assign').on('click', function() {
            const test_id = $(this).data('test-id');
            assign_lab_test(test_id);
        });
        
        $('.btn-view').on('click', function() {
            const test_id = $(this).data('test-id');
            view_lab_test(test_id);
        });
    }
    
    function assign_lab_test(test_id) {
        // Get lab technicians
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'User',
                filters: [["Has Role", "role", "=", "Laboratory User"]],
                fields: ['name', 'full_name']
            },
            callback: function(response) {
                if (response.message) {
                    const d = new frappe.ui.Dialog({
                        title: __('Assign Lab Test'),
                        fields: [
                            {
                                label: __('Lab Technician'),
                                fieldname: 'technician',
                                fieldtype: 'Select',
                                options: response.message.map(user => {
                                    return {
                                        label: user.full_name || user.name,
                                        value: user.name
                                    };
                                }),
                                reqd: 1
                            },
                            {
                                label: __('Comments'),
                                fieldname: 'comments',
                                fieldtype: 'Small Text'
                            }
                        ],
                        primary_action_label: __('Assign'),
                        primary_action: function(values) {
                            frappe.call({
                                method: 'frappe.client.set_value',
                                args: {
                                    doctype: 'Lab Test',
                                    name: test_id,
                                    fieldname: {
                                        'employee': values.technician,
                                        'comments': values.comments
                                    }
                                },
                                callback: function(r) {
                                    if (!r.exc) {
                                        frappe.show_alert({
                                            message: __('Lab Test assigned successfully'),
                                            indicator: 'green'
                                        }, 3);
                                        // Reload the queue
                                        load_lab_test_queue();
                                        d.hide();
                                    }
                                }
                            });
                        }
                    });
                    d.show();
                }
            }
        });
    }
    
    function view_lab_test(test_id) {
        frappe.set_route('Form', 'Lab Test', test_id);
    }

    function load_sample_collection_data() {
        frappe.call({ method: 'healthcare.healthcare.page.lab_dashboard.lab_dashboard.get_sample_collection_data', callback: r => { if (r.message) render_sample_collection_tracker(r.message); } });
    }

    function render_sample_collection_tracker(data) {
        const html = `
            <div class="table-card">
                <div class="table-header"><h4>Today's Sample Collections</h4></div>
                <table class="lab-tests-table">
                    <thead><tr><th>Patient</th><th>Status</th><th>Collector</th></tr></thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td>${row.patient_name}</td>
                                <td><span class="status-badge status-${row.status.toLowerCase().replace(/ /g, '-')}">${row.status}</span></td>
                                <td>${row.collector || 'N/A'}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        $('#sample-collection-container').html(html);
    }

    function load_reports_for_delivery() {
        frappe.call({ method: 'healthcare.healthcare.page.lab_dashboard.lab_dashboard.get_reports_for_delivery', callback: r => { if (r.message) render_reports_delivery(r.message); } });
    }

    function render_reports_delivery(data) {
        const html = `
            <div class="table-card">
                <div class="table-header"><h4>Reports Ready for Delivery</h4></div>
                <table class="lab-tests-table">
                    <thead><tr><th>Patient</th><th>Test</th><th>Referring Doctor</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td>${row.patient_name}</td>
                                <td>${row.lab_test_name}</td>
                                <td>${row.practitioner || 'N/A'}</td>
                                <td><button class="btn btn-xs btn-success">Email</button> <button class="btn btn-xs btn-info">Print</button></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        $('#reports-delivery-container').html(html);
    }

    function load_alerts() {
        frappe.call({ method: 'healthcare.healthcare.page.lab_dashboard.lab_dashboard.get_alerts', callback: r => { if (r.message) render_alerts_panel(r.message); } });
    }

    function render_alerts_panel(alerts) {
        let html = '';
        
        if (!alerts || alerts.length === 0) {
            html = `
                <div class="table-card">
                    <div class="table-header"><h4>Alerts & Notifications</h4></div>
                    <p class="p-3">No alerts for today.</p>
                </div>
            `;
        } else {
            html = `
                <div class="table-card">
                    <div class="table-header"><h4>Alerts & Notifications</h4></div>
                    <ul class="alerts-list p-3">
                        ${alerts.map(alert => `
                            <li class="alert-item alert-danger mb-2">
                                <div class="alert-icon"><i class="fa fa-exclamation-triangle mr-2"></i></div>
                                <div class="alert-content">
                                    <div class="alert-title font-weight-bold">${alert.title}</div>
                                    <div class="alert-message">${alert.message}</div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        $('#alerts-container').html(html);
    }

    function setup_header_buttons(page) {
        // Add style for icon buttons
        const style_id = 'button-hover-styles-' + new Date().getTime();
        frappe.dom.set_style(`
            .action-btn-icon {
                font-size: 16px;
                transition: color 0.2s ease;
            }
            .btn:hover .action-btn-icon {
                color: #ff69b4;
            }
            .tooltip {
                font-family: 'Inter', sans-serif;
                font-weight: 500;
            }
            .tooltip-inner {
                background-color: #fff0f6;
                color: #333;
                border: 1px solid #ff69b4;
                padding: 6px 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                max-width: 200px;
            }
            .tooltip.bs-tooltip-bottom .arrow::before {
                border-bottom-color: #ff69b4;
            }
        `, style_id);

        // Helper function to create buttons with icons and tooltips
        function add_button_with_tooltip(label, action, icon) {
            // Create button with icon only
            const $btn = page.add_inner_button(
                `<i class="fa fa-${icon} action-btn-icon"></i>`, 
                () => handle_action(action)
            );
            
            // Add tooltip using Bootstrap/Frappe tooltip
            $btn.attr('title', __(label));
            $btn.attr('data-toggle', 'tooltip');
            $btn.attr('data-placement', 'bottom');
            $btn.tooltip({
                delay: { show: 600, hide: 100 },
                trigger: 'hover',
                container: 'body'
            });
        }
        
        // Add buttons with icons and tooltips
        add_button_with_tooltip('New Lab Test', 'new_lab_test', 'flask');
        add_button_with_tooltip('Collect Sample', 'collect_sample', 'stethoscope');
        add_button_with_tooltip('View Reports', 'view_reports', 'file');
        add_button_with_tooltip('New Template', 'new_template', 'plus-square');
        
        // Add logout button to the right side
        
    }

    function handle_action(action) {
        switch (action) {
            case 'new_lab_test':
                frappe.new_doc('Lab Test');
                break;
            case 'collect_sample':
                frappe.new_doc('Sample Collection');
                break;
            case 'view_reports':
                frappe.set_route('List', 'Lab Test', 'Report');
                break;
            case 'new_template':
                frappe.new_doc('Lab Test Template');
                break;

        }
    }

    function add_dashboard_footer(page) {
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
        const footer_style = `
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
            $('head').append('<style id="reception-dashboard-footer-styles">' + footer_style + '</style>');
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
    }

    function add_dashboard_footer(page) {
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
        const footer_style = `
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
            $('head').append('<style id="reception-dashboard-footer-styles">' + footer_style + '</style>');
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
    }

    function refresh_dashboard() {
        load_kpis();
        load_lab_test_queue();
        load_sample_collection_data();
        load_reports_for_delivery();
        load_lab_tests_chart();
        load_alerts();
    }
};