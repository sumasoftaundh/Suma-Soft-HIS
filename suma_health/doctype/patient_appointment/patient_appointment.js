frappe.ui.form.on('Patient Appointment', {
	refresh: function(frm) {
		frm.page.main.addClass('hide-form-sidebar');
	}
});
