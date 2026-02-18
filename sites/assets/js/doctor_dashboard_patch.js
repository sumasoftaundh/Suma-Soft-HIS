// Safety patch for doctor_dashboard.js
$(document).ready(function() {
  // Fix for the user_roles join error
  setTimeout(function() {
    // Original function with safety checks
    if (typeof frappe.pages['doctor_dashboard'] !== 'undefined') {
      const originalFooterFn = frappe.pages['doctor_dashboard'].add_dashboard_footer;
      
      // Replace with safer version
      frappe.pages['doctor_dashboard'].add_dashboard_footer = function(page) {
        try {
          // Check if user_roles exists and is array before creating footer
          if (!frappe.session.user_roles || !Array.isArray(frappe.session.user_roles)) {
            frappe.session.user_roles = ['User']; // Default fallback
          }
          return originalFooterFn.call(this, page);
        } catch (e) {
          console.log("Prevented error in dashboard footer:", e);
          // Create minimal footer if error occurs
          $('.reception-dashboard-footer').remove();
          $(page.body).append('<footer class="reception-dashboard-footer"><div class="footer-bottom"><div class="copyright">© ' + 
            new Date().getFullYear() + ' Suma Health. All rights reserved.</div></div></footer>');
        }
      };
    }
  }, 500);
});
