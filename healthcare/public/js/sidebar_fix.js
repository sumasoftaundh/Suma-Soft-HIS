// Advanced fix for sidebar collapse issue in Healthcare app
frappe.provide("healthcare.sidebar");

healthcare.sidebar.init = function() {
    // Execute after Frappe has fully initialized
    $(document).on("frappe.ready", function() {
        // Direct override of the sidebar toggle button functionality
        setTimeout(function() {
            // Ensure body-sidebar is always collapsed
            $(".body-sidebar-container").removeClass("expanded");
            localStorage.setItem("sidebar-expanded", false);
            
            // Apply CSS to force the collapsed state
            $(".body-sidebar").css({
                "width": "100px",
                "background": "white",
                "box-shadow": "2px 0 10px rgba(0, 0, 0, 0.1)"
            });
            
            $(".body-sidebar .sidebar-item-label").css("display", "none");
            $(".body-sidebar .sidebar-item-control").css("display", "none");
            
            // Store the original toggle function reference
            if (frappe.ui.Page && frappe.ui.Page.prototype) {
                var originalSetupSidebarToggle = frappe.ui.Page.prototype.setup_sidebar_toggle;
                
                // Override with our enhanced version
                frappe.ui.Page.prototype.setup_sidebar_toggle = function() {
                    // Call original implementation first
                    originalSetupSidebarToggle.apply(this, arguments);
                    
                    // Get sidebar toggle button
                    var sidebarToggle = $(".page-head").find(".sidebar-toggle-btn");
                    
                    // Always collapse the layout-side-section
                    var sidebarSection = $(".layout-side-section");
                    if (sidebarSection.is(":visible")) {
                        // Hide layout sidebar
                        sidebarSection.hide();
                        // Update sidebar toggle icon
                        sidebarToggle.find(".sidebar-toggle-icon")
                            .html(frappe.utils.icon("es-line-sidebar-expand", "md"));
                    }
                    
                    // Remove any existing click handlers and add our own that forces collapsing
                    sidebarToggle.off('click').on('click', function() {
                        var sidebarSection = $(".layout-side-section");
                        
                        // Toggle visibility but always collapse body-sidebar
                        $(".body-sidebar-container").removeClass("expanded");
                        localStorage.setItem("sidebar-expanded", false);
                        
                        if (sidebarSection.is(":visible")) {
                            // Hiding sidebar
                            sidebarSection.hide();
                            // Update sidebar toggle icon
                            sidebarToggle.find(".sidebar-toggle-icon")
                                .html(frappe.utils.icon("es-line-sidebar-expand", "md"));
                        } else {
                            // Showing sidebar but keeping it collapsed
                            sidebarSection.show();
                            // Update sidebar toggle icon
                            sidebarToggle.find(".sidebar-toggle-icon")
                                .html(frappe.utils.icon("es-line-sidebar-collapse", "md"));
                        }
                        
                        // Trigger the event for any other listeners
                        $(document.body).trigger("toggleSidebar");
                    });
                };
                
                // Apply the fix to any existing pages
                if (cur_page && cur_page.page) {
                    cur_page.page.setup_sidebar_toggle();
                }
                
                // Override Sidebar toggle_sidebar function
                if (frappe.ui.Sidebar && frappe.ui.Sidebar.prototype) {
                    frappe.ui.Sidebar.prototype.toggle_sidebar = function() {
                        // Always ensure sidebar is collapsed
                        this.sidebar_expanded = false;
                        this.expand_sidebar();
                        this.close_children_item();
                    };
                }
            }
        }, 1000); // Delay to ensure Frappe UI is loaded
    });
    
    // Additional direct fix for existing pages
    $(document).ready(function() {
        setTimeout(function() {
            // Direct fix for toggle button
            $(".sidebar-toggle-btn").off("click").on("click", function() {
                var sidebarSection = $(".layout-side-section");
                var sidebarItems = $(".standard-sidebar-item");
                
                if (sidebarSection.is(":visible")) {
                    // Sidebar is visible, so hide it along with items
                    sidebarSection.hide();
                    sidebarItems.hide();
                } else {
                    // Sidebar is hidden, so show it along with items
                    sidebarSection.show();
                    sidebarItems.show();
                }
                
                // Update the icon
                var toggleIcon = $(this).find(".sidebar-toggle-icon");
                if (sidebarSection.is(":visible")) {
                    toggleIcon.html(frappe.utils.icon("es-line-sidebar-collapse", "md"));
                } else {
                    toggleIcon.html(frappe.utils.icon("es-line-sidebar-expand", "md"));
                }
            });
        }, 2000);
    });
};

// Initialize the sidebar fix
healthcare.sidebar.init();
