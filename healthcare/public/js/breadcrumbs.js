/**
 * Global Breadcrumbs for Frappe Pages
 * 
 * This script adds breadcrumb navigation to all pages in the application.
 * It dynamically generates breadcrumbs based on the current route and updates them
 * when navigating between pages.
 */

frappe.provide('healthcare.breadcrumbs');

// Main breadcrumbs functionality
healthcare.breadcrumbs = {
    // Icon mapping for modules
    moduleIcons: {
        'Healthcare': 'fa fa-heartbeat',
        'Accounting': 'fa fa-book',
        'Buying': 'fa fa-shopping-cart',
        'Selling': 'fa fa-money',
        'Stock': 'fa fa-truck',
        'HR': 'fa fa-users',
        'Manufacturing': 'fa fa-industry',
        'CRM': 'fa fa-handshake-o',
        'Quality': 'fa fa-check-square-o',
        'Support': 'fa fa-life-ring',
        'Projects': 'fa fa-project-diagram',
        'Settings': 'fa fa-cog'
    },
    
    // Icon mapping for common doctypes
    doctypeIcons: {
        'Patient': 'fa fa-user',
        'Patient Appointment': 'fa fa-calendar',
        'Healthcare Practitioner': 'fa fa-user-md',
        'Clinical Procedure': 'fa fa-stethoscope',
        'Sales Invoice': 'fa fa-file-text-o',
        'Purchase Invoice': 'fa fa-file-o',
        'Customer': 'fa fa-address-card-o',
        'Supplier': 'fa fa-truck',
        'Employee': 'fa fa-id-badge'
    },
    
    // Initialize breadcrumbs system
    init: function() {
        // Apply once DOM is fully loaded
        $(document).ready(function() {
            healthcare.breadcrumbs.setupBreadcrumbs();
        });
        
        // Update breadcrumbs when route changes
        $(document).on('route_change', function() {
            healthcare.breadcrumbs.updateBreadcrumbs();
        });
    },
    
    // Set up the breadcrumbs container
    setupBreadcrumbs: function() {
        // Create breadcrumb container if it doesn't exist
        if (!$('.global-breadcrumbs').length) {
            const $breadcrumbContainer = $(`
                <div class="global-breadcrumbs">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb"></ol>
                    </nav>
                </div>
            `);
            
            // Insert breadcrumbs after the page header
            $('.page-head').after($breadcrumbContainer);
            
            // Add styling
            healthcare.breadcrumbs.addStyles();
            
            // Initial update
            healthcare.breadcrumbs.updateBreadcrumbs();
        }
    },
    
    // Update the breadcrumbs based on current route
    updateBreadcrumbs: function() {
        const route = frappe.get_route();
        if (!route || !route.length) return;
        
        // Get breadcrumb container
        const $breadcrumb = $('.global-breadcrumbs .breadcrumb');
        if (!$breadcrumb.length) return;
        
        // Clear existing breadcrumbs
        $breadcrumb.empty();
        
        // Always add Home
        $breadcrumb.append(`<li class="breadcrumb-item"><a href="#" data-route="desk">Home</a></li>`);
        
        // If we're in a module
        if (route[0] === 'modules') {
            const moduleName = route[1] || '';
            if (moduleName) {
                // Add module icon if available
                const moduleIcon = this.getModuleIcon(moduleName);
                $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">
                    ${moduleIcon ? `<i class="${moduleIcon} module-icon"></i>` : ''}
                    ${frappe.utils.get_title_case(moduleName)}
                </li>`);
            }
        }
        // If we're in a doctype list
        else if (route[0] === 'List') {
            const doctype = route[1] || '';
            if (doctype) {
                // Check if this belongs to a module
                this.getModuleForDoctype(doctype).then(module => {
                    if (module) {
                        // Get module icon
                        const moduleIcon = this.getModuleIcon(module);
                        $breadcrumb.find('li').last().removeClass('active').removeAttr('aria-current');
                        $breadcrumb.find('li:last-child').html(`<a href="#" data-route="modules/${module}">
                            ${moduleIcon ? `<i class="${moduleIcon} module-icon"></i>` : ''}
                            ${frappe.utils.get_title_case(module)}
                        </a>`);
                        
                        // Get doctype icon
                        const doctypeIcon = this.getDoctypeIcon(doctype);
                        $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">
                            ${doctypeIcon ? `<i class="${doctypeIcon} module-icon"></i>` : ''}
                            ${frappe.utils.get_title_case(doctype)}
                        </li>`);
                    } else {
                        $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">${frappe.utils.get_title_case(doctype)}</li>`);
                    }
                });
            }
        }
        // If we're in a form view
        else if (route[0] === 'Form') {
            const doctype = route[1] || '';
            const docname = route[2] || '';
            
            if (doctype) {
                // Get module for this doctype
                this.getModuleForDoctype(doctype).then(module => {
                    // Add module if found
                    if (module) {
                        const moduleIcon = this.getModuleIcon(module);
                        $breadcrumb.append(`<li class="breadcrumb-item"><a href="#" data-route="modules/${module}">
                            ${moduleIcon ? `<i class="${moduleIcon} module-icon"></i>` : ''}
                            ${frappe.utils.get_title_case(module)}
                        </a></li>`);
                    }
                    
                    // Add doctype list with icon
                    const doctypeIcon = this.getDoctypeIcon(doctype);
                    $breadcrumb.append(`<li class="breadcrumb-item"><a href="#" data-route="List/${doctype}">
                        ${doctypeIcon ? `<i class="${doctypeIcon} module-icon"></i>` : ''}
                        ${frappe.utils.get_title_case(doctype)}
                    </a></li>`);
                    
                    // Add document name if available and not "new"
                    if (docname && docname !== 'new') {
                        // Truncate document name if it's too long
                        const displayName = docname.length > 25 ? docname.substring(0, 22) + '...' : docname;
                        $breadcrumb.append(`<li class="breadcrumb-item active" title="${docname}" aria-current="page">${displayName}</li>`);
                    } else {
                        $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">New ${frappe.utils.get_title_case(doctype)}</li>`);
                    }
                });
            }
        }
        // If we're in a specific page
        else if (route[0] && route[0].indexOf('-dashboard') > -1) {
            // Handle dashboards specially
            const dashboardName = route[0].replace('-', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
            $breadcrumb.append(`<li class="breadcrumb-item"><a href="#" data-route="modules/Healthcare">
                <i class="fa fa-heartbeat module-icon"></i>
                Healthcare
            </a></li>`);
            $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">
                <i class="fa fa-dashboard module-icon"></i>
                ${dashboardName}
            </li>`);
        } else if (route[0]) {
            // Generic page handling - try to determine the module based on the page name
            const pageName = route[0].replace('-', ' ');
            if (pageName.toLowerCase().includes('patient') || 
                pageName.toLowerCase().includes('doctor') || 
                pageName.toLowerCase().includes('medical') ||
                pageName.toLowerCase().includes('lab') ||
                pageName.toLowerCase().includes('health')) {
                $breadcrumb.append(`<li class="breadcrumb-item"><a href="#" data-route="modules/Healthcare">
                    <i class="fa fa-heartbeat module-icon"></i>
                    Healthcare
                </a></li>`);
            }
            $breadcrumb.append(`<li class="breadcrumb-item active" aria-current="page">${frappe.utils.get_title_case(pageName)}</li>`);
        }
        
        // Attach event handlers for breadcrumb navigation
        healthcare.breadcrumbs.attachEventHandlers();
    },
    
    // Helper function to get module for a doctype
    getModuleForDoctype: function(doctype) {
        return new Promise(resolve => {
            // Check if we already have the module info
            if (frappe.ui.doctype_layout) {
                const docInfo = frappe.ui.doctype_layout.find(d => d.name === doctype);
                if (docInfo && docInfo.module) {
                    resolve(docInfo.module);
                    return;
                }
            }
            
            // Cache module info for faster lookup
            if (!healthcare.breadcrumbs.moduleCache) {
                healthcare.breadcrumbs.moduleCache = {};
            }
            
            // Check cache first
            if (healthcare.breadcrumbs.moduleCache[doctype]) {
                resolve(healthcare.breadcrumbs.moduleCache[doctype]);
                return;
            }
            
            // Otherwise fetch it
            frappe.db.get_value('DocType', doctype, 'module')
                .then(r => {
                    if (r && r.message && r.message.module) {
                        // Cache the result
                        healthcare.breadcrumbs.moduleCache[doctype] = r.message.module;
                        resolve(r.message.module);
                    } else {
                        healthcare.breadcrumbs.moduleCache[doctype] = '';
                        resolve('');
                    }
                })
                .catch(() => {
                    healthcare.breadcrumbs.moduleCache[doctype] = '';
                    resolve('');
                });
        });
    },
    
    // Get icon for module
    getModuleIcon: function(module) {
        if (!module) return null;
        
        // Return from our mapping if available
        if (this.moduleIcons[module]) {
            return this.moduleIcons[module];
        }
        
        // Default icon for modules
        return 'fa fa-folder-o';
    },
    
    // Get icon for doctype
    getDoctypeIcon: function(doctype) {
        if (!doctype) return null;
        
        // Return from our mapping if available
        if (this.doctypeIcons[doctype]) {
            return this.doctypeIcons[doctype];
        }
        
        // Default icon for doctypes
        return 'fa fa-file-o';
    },
    
    // Attach click handlers to breadcrumb links
    attachEventHandlers: function() {
        $('.global-breadcrumbs .breadcrumb-item a').off('click').on('click', function(e) {
            e.preventDefault();
            const route = $(this).attr('data-route');
            if (route) {
                frappe.set_route(route);
            }
        });
    },
    
    // Add CSS styles for breadcrumbs
    addStyles: function() {
        if ($('#breadcrumb-styles').length) return;
        
        const styles = `
            .global-breadcrumbs {
                padding: 0.5rem 1.25rem;
                background-color: #f8fafe;
                border-bottom: 1px solid rgba(70, 130, 180, 0.15);
                z-index: 10;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                transition: all 0.3s ease;
            }
            .global-breadcrumbs .breadcrumb {
                padding: 0;
                margin-bottom: 0;
                background-color: transparent;
                border-radius: 0;
                font-size: 0.85rem;
                display: flex;
                flex-wrap: wrap;
                list-style: none;
                font-weight: 500;
                color: #5a6577;
            }
            .global-breadcrumbs .breadcrumb-item + .breadcrumb-item::before {
                content: "›";
                padding: 0 0.5rem;
                color: #8091a5;
                font-size: 1rem;
                line-height: 1;
                display: flex;
                align-items: center;
                font-weight: 600;
            }
            .global-breadcrumbs .breadcrumb-item a {
                color: #4682b4;
                text-decoration: none;
                position: relative;
                padding: 3px 2px;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                border-radius: 3px;
            }
            .global-breadcrumbs .breadcrumb-item a:hover {
                color: #2c5d8f;
                background-color: rgba(70, 130, 180, 0.1);
                text-decoration: none;
            }
            .global-breadcrumbs .breadcrumb-item a:active {
                transform: translateY(1px);
            }
            .global-breadcrumbs .breadcrumb-item.active {
                color: #48525e;
                font-weight: 600;
            }
            
            /* Icon for home */
            .global-breadcrumbs .breadcrumb-item a[data-route="desk"]::before {
                content: "\f015";
                font-family: FontAwesome;
                margin-right: 4px;
                font-size: 0.9rem;
            }
            
            /* Module icon */
            .global-breadcrumbs .module-icon {
                margin-right: 4px;
                font-size: 0.9rem;
            }
            
            /* Animations */
            .global-breadcrumbs .breadcrumb-item {
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-5px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            /* Responsive styles */
            @media (max-width: 767px) {
                .global-breadcrumbs {
                    padding: 0.25rem 1rem;
                }
                .global-breadcrumbs .breadcrumb {
                    font-size: 0.75rem;
                }
            }
            
            /* Fix for page with tabs to avoid double borders */
            .form-tabs-list + .global-breadcrumbs {
                border-top: none;
            }
            
            /* Compact style for narrow screens */
            @media (max-width: 576px) {
                .global-breadcrumbs {
                    padding: 0.2rem 0.75rem;
                }
                .global-breadcrumbs .breadcrumb-item:not(:first-child):not(:last-child) {
                    display: none;
                }
                .global-breadcrumbs .breadcrumb-item:first-child + .breadcrumb-item::before {
                    content: "...";
                    letter-spacing: 1px;
                }
            }
        `;
        
        $('<style id="breadcrumb-styles"></style>').text(styles).appendTo('head');
    }
};

// Initialize breadcrumbs
healthcare.breadcrumbs.init();
