frappe.pages['medical_dashboard'].on_page_load = function(wrapper) {
    // Load the CSS for the glass effect
    frappe.require('/assets/suma_health/css/medical_dashboard.css');

	// Get current user's full name
	let user_name = frappe.session.user_fullname || frappe.session.user;
	
	// Create page with personalized greeting as title
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Hi, ') + user_name,
		single_column: true
	});

    // Add a container class for the glass effect
    $(page.wrapper).find('.page-content').addClass('medical-dashboard-container');

	frappe.medical_dashboard = new MedicalDashboard(page);
	frappe.medical_dashboard.refresh();
	
	// Additional code to ensure menu icon is hidden
	$(wrapper).find('.menu-btn-group').hide();
};

class MedicalDashboard {
	constructor(page) {
		this.page = page;
		this.wrapper = $(page.body);
		this.setup_dashboard();
		this.setup_actions();
		this.add_dashboard_footer();
	}

	setup_dashboard() {
		let dashboard_html = `
			<div class="pharmacy-dashboard">
				${this.get_header_html()}
				${this.get_quick_stats_html()}
				${this.get_search_html()}
				${this.get_charts_html()}
				${this.get_inventory_html()}
				${this.get_prescription_queue_html()}
				${this.get_alerts_html()}
			</div>
		`;
		this.wrapper.html(dashboard_html);
	}

	get_header_html() {
		return `
			<div class="dashboard-header mb-4">
				<div class="row">
					
				</div>
			</div>
		`;
	}

	get_quick_stats_html() {
		const stats = [
			{ id: 'stock-count', label: 'Medicines in Stock', icon: 'fa-medkit' },
			{ id: 'low-stock', label: 'Low Stock Items', icon: 'fa-exclamation-triangle' },
			{ id: 'near-expiry', label: 'Near Expiry', icon: 'fa-calendar-times-o' },
			{ id: 'pending-prescriptions', label: 'Pending Prescriptions', icon: 'fa-file-text-o' },

		];

		let cards_html = stats.map(stat => `
			<div class="col-md-3">
				<div class="card quick-stat-card" id="${stat.id}">
					<div class="card-body">
						<h5><i class="fa ${stat.icon}"></i> ${__(stat.label)}</h5>
						<h3 class="stat-value">-</h3>
					</div>
				</div>
			</div>
		`).join('');

		return `<div class="row quick-stats">${cards_html}</div>`;
	}

	get_search_html() {
		return `
			<div class="row my-4">
				<div class="col-md-8">
					<input type="text" class="form-control" placeholder="${__('Search by medicine name, barcode, or generic name...')}">
				</div>
				<div class="col-md-4">
					<input type="text" class="form-control" placeholder="${__('Scan Barcode...')}">
				</div>
			</div>
		`;
	}

	get_charts_html() {
		return `
			<div class="row my-4">
				<div class="col-md-6"><div class="chart-container" id="sales-trends-chart"></div></div>
				<div class="col-md-6"><div class="chart-container" id="top-items-chart"></div></div>
			</div>
		`;
	}

	get_inventory_html() {
		return `
			<div class="card my-4">
				<div class="card-header"><h5>${__('Medicine Inventory')}</h5></div>
				<div class="card-body" id="inventory-table"></div>
			</div>
		`;
	}

	get_prescription_queue_html() {
		return `
			<div class="card my-4">
				<div class="card-header"><h5>${__('Prescription Queue')}</h5></div>
				<div class="card-body" id="prescription-queue-table"></div>
			</div>
		`;
	}

	get_alerts_html() {
		return `
			<div class="my-4">
				<h4>${__('Alerts & Notifications')}</h4>
				<div id="alerts-wrapper"></div>
			</div>
		`;
	}

	setup_actions() {
		const actions = [
			{ 
				id: 'add-stock',
				label: 'Add Stock', 
				action: this.create_stock_entry.bind(this), 
				icon: 'fa fa-medkit', 
				title: __('Add Medicine Stock') 
			},
			{ 
				id: 'create-invoice',
				label: 'New Invoice', 
				action: this.create_sales_invoice.bind(this), 
				icon: 'fa fa-file-text-o', 
				title: __('Create Sales Invoice') 
			},
			{ 
				id: 'view-purchase',
				label: 'Purchase Orders', 
				action: this.view_purchase_orders.bind(this), 
				icon: 'fa fa-calendar-times-o', 
				title: __('View Purchase Orders') 
			},
			{ 
				id: 'drug-master',
				label: 'Drug Master', 
				action: this.view_drug_master.bind(this), 
				icon: 'fa fa-exclamation-triangle', 
				title: __('View Drug Master') 
			}
			// Refresh button removed as requested
		];

		// Add buttons as icon-only with tooltips
		actions.forEach(item => {
			// Create button with visible text label for better usability
			let btn = this.page.add_button(`<i class="${item.icon}"></i> ${item.label}`, () => {
				try {
					item.action();
				} catch (error) {
					console.error(`Error executing ${item.title} action:`, error);
					frappe.show_alert({
						message: __(`Could not perform action: ${error.message || 'Unknown error'}`),
						indicator: 'red'
					}, 5);
				}
			});
			
			// Add ID for easier targeting
			$(btn).attr('id', `medical-dash-btn-${item.id}`);
			
			// Add tooltip to button
			$(btn).attr('title', item.title);
			
			// Apply steel blue background color and white text
			$(btn).css({
				'background-color': '#4682b4',
				'color': 'white',
				'margin-right': '8px',
				'border': 'none',
				'padding': '6px 12px',
				'border-radius': '4px'
			});
			
			// Maintain color on hover
			$(btn).hover(
				function() { $(this).css('background-color', '#3a6d96'); },
				function() { $(this).css('background-color', '#4682b4'); }
			);
		});
		
		// Hide the menu icon
		$(this.page.wrapper).find('.menu-btn-group').hide();
	}
	
	// Individual action methods for better maintainability and error handling
	create_stock_entry() {
		try {
			// Show feedback when starting the action
			frappe.show_alert({
				message: __('Creating Stock Entry...'),
				indicator: 'blue'
			}, 2);
			
			// First check if the Material Receipt stock entry type exists
			frappe.db.get_value('Stock Entry Type', {name: 'Material Receipt'}, 'name')
				.then(r => {
					if (r && r.message && r.message.name) {
						// Material Receipt type exists, navigate to create form
						frappe.route_options = {
							'stock_entry_type': 'Material Receipt'
						};
						frappe.set_route('Form', 'Stock Entry', 'new');
					} else {
						// Use default method if type doesn't exist
						frappe.set_route('Form', 'Stock Entry', 'new');
						
						// Add a brief delay to allow the form to load before setting default values
						setTimeout(function() {
							if (cur_frm && cur_frm.doc) {
								cur_frm.set_value('stock_entry_type', 'Material Receipt');
								cur_frm.refresh_field('stock_entry_type');
							}
						}, 1000);
					}
				})
				.catch(err => {
					console.error('Error checking Stock Entry Type:', err);
					// Fall back to direct navigation
					frappe.set_route('Form', 'Stock Entry', 'new');
				});
		} catch (error) {
			console.error('Error creating stock entry:', error);
			frappe.show_alert({
				message: __('Could not create Stock Entry. Please check your permissions.'),
				indicator: 'red'
			}, 5);
		}
	}
	
	create_sales_invoice() {
		try {
			// Use set_route for consistent navigation pattern
			frappe.set_route('Form', 'Sales Invoice', 'new');
			
			// Show success feedback
			frappe.show_alert({
				message: __('Creating new Sales Invoice...'),
				indicator: 'blue'
			}, 2);
		} catch (error) {
			console.error('Error creating sales invoice:', error);
			frappe.show_alert({
				message: __('Could not create Sales Invoice. Please check your permissions.'),
				indicator: 'red'
			}, 5);
		}
	}
	
	view_purchase_orders() {
		try {
			// Show feedback when navigating
			frappe.show_alert({
				message: __('Opening Purchase Orders...'),
				indicator: 'blue'
			}, 2);
			
			frappe.set_route('List', 'Purchase Order');
		} catch (error) {
			console.error('Error viewing purchase orders:', error);
			frappe.show_alert({
				message: __('Could not open Purchase Orders.'),
				indicator: 'red'
			}, 5);
		}
	}
	
	view_drug_master() {
		try {
			// Show feedback when navigating
			frappe.show_alert({
				message: __('Opening Drug Master List...'),
				indicator: 'blue'
			}, 2);
			
			frappe.set_route('List', 'Item', {item_group: 'Drug'});
		} catch (error) {
			console.error('Error viewing drug master:', error);
			frappe.show_alert({
				message: __('Could not open Drug Master list.'),
				indicator: 'red'
			}, 5);
		}
	}

	refresh() {
		frappe.call({
			method: 'healthcare.healthcare.page.medical_dashboard.medical_dashboard.get_dashboard_data',
			callback: (r) => {
				if (r.message) {
					this.render_data(r.message);
				}
			},
			error: (err) => {
				frappe.log_error(err, 'Failed to fetch pharmacy dashboard data');
			}
		});
	}

	render_data(data) {
		this.render_stats(data.stats);
		this.render_charts(data.charts);
		this.render_inventory(data.inventory);
		this.render_prescriptions(data.prescriptions);
		this.render_alerts(data.alerts);
	}

	render_stats(stats) {
		for (const [key, value] of Object.entries(stats)) {
			this.wrapper.find(`#${key} .stat-value`).text(value);
		}
	}

	render_charts(charts_data) {
		new frappe.Chart('#sales-trends-chart', {
			title: "Sales Trends (Last 7 Days)",
			data: charts_data.sales_trends,
			type: 'line',
			height: 250,
			colors: ['#4682B4']
		});

		new frappe.Chart('#top-items-chart', {
			title: "Top Selling Items",
			data: charts_data.top_items,
			type: 'bar',
			height: 250,
			colors: ['#A9A9A9']
		});
	}

	render_inventory(inventory_data) {
		const columns = [
			{ name: 'Medicine Name', id: 'item_name', width: 250 },
			{ name: 'Stock', id: 'stock' },
			{ name: 'Batch No', id: 'batch_no' },
			{ name: 'Expiry Date', id: 'expiry_date' },
			{ name: 'Price', id: 'price' },
			{ name: 'Category', id: 'category' }
		];

		new frappe.DataTable('#inventory-table', {
			columns: columns,
			data: inventory_data,
			layout: 'fluid'
		});
	}

	render_prescriptions(prescription_data) {
		const columns = [
			{ name: 'Prescription ID', id: 'name', width: 200 },
			{ name: 'Patient', id: 'patient_name', width: 200 },
			{ name: 'Doctor', id: 'doctor' },
			{ name: 'Status', id: 'status' }
		];

		if (prescription_data && prescription_data.length > 0) {
			new frappe.DataTable('#prescription-queue-table', {
				columns: columns,
				data: prescription_data
			});
		} else {
			this.wrapper.find('#prescription-queue-table').html(`<div class="text-center text-muted p-4">${__('No pending prescriptions.')}</div>`);
		}
	}

	render_alerts(alerts_data) {
		let alerts_wrapper = this.wrapper.find('#alerts-wrapper');
		alerts_wrapper.empty();
		let alert_html = alerts_data.map(alert => `
			<div class="alert alert-${alert.type}">${alert.message}</div>
		`).join('');
		alerts_wrapper.html(alert_html);
	}

	add_dashboard_footer() {
        const page = this.page;
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


}