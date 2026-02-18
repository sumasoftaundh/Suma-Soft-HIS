// Suma Health - ListView Settings Error Fix
// Fixes the "can't access property 'fields', this.list_view_settings is undefined" error

(function() {
    console.log('Applying ListView settings patch...');
    
    // Wait for DOM to be ready
    $(document).ready(function() {
        // Run the patch once frappe is loaded and accessible
        setTimeout(function() {
            if (typeof frappe !== 'undefined' && frappe.views && frappe.views.ListView) {
                console.log('Patching ListView.prototype.setup_columns...');
                
                // Save original method
                const originalSetupColumns = frappe.views.ListView.prototype.setup_columns;
                
                // Replace with safe version that ensures list_view_settings exists
                frappe.views.ListView.prototype.setup_columns = function() {
                    try {
                        // Initialize list_view_settings if undefined
                        if (!this.list_view_settings) {
                            console.log('Initializing missing list_view_settings for', this.doctype);
                            this.list_view_settings = { fields: [] };
                        }
                        
                        // Initialize fields if undefined
                        if (this.list_view_settings && !this.list_view_settings.fields) {
                            this.list_view_settings.fields = [];
                        }
                        
                        // Now call the original method which should work
                        return originalSetupColumns.apply(this, arguments);
                    } catch (e) {
                        console.warn('Error in patched setup_columns:', e);
                        
                        // Fallback to setting basic columns if original method fails
                        console.log('Setting fallback columns for', this.doctype);
                        this.columns = [
                            {
                                type: "Subject",
                                df: { 
                                    label: "Name",
                                    fieldname: "name"
                                }
                            }
                        ];
                        
                        // Try to add a few standard columns if meta is available
                        if (this.meta && this.meta.fields) {
                            const standardFields = ["status", "modified", "creation"];
                            standardFields.forEach(fieldname => {
                                const field = this.meta.fields.find(f => f.fieldname === fieldname);
                                if (field) {
                                    this.columns.push({
                                        type: "Field",
                                        df: field
                                    });
                                }
                            });
                        }
                    }
                };
                
                // Also patch the ListView constructor for Patient list
                const originalListView = frappe.views.ListView;
                frappe.views.ListView = function(...args) {
                    const instance = new originalListView(...args);
                    
                    // Special handling for Patient list
                    if (args[0] && args[0].doctype === 'Patient') {
                        console.log('Adding special handling for Patient list');
                        
                        // Ensure list_view_settings exists before any method tries to use it
                        if (!instance.list_view_settings) {
                            instance.list_view_settings = {
                                fields: [
                                    { fieldname: "name", label: "Patient ID" },
                                    { fieldname: "patient_name", label: "Patient Name" },
                                    { fieldname: "status", label: "Status" }
                                ]
                            };
                        }
                    }
                    
                    return instance;
                };
                
                // Copy prototype to new constructor
                Object.setPrototypeOf(frappe.views.ListView, originalListView);
                frappe.views.ListView.prototype = originalListView.prototype;
                
                console.log('ListView patch applied successfully');
            }
        }, 1000);
    });
})();
