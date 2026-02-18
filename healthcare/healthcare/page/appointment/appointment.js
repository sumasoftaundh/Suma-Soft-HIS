frappe.pages['appointment'] = frappe.pages['appointment'] || {};

frappe.pages['appointment'].on_page_load = function(wrapper) {
    // Add splash screen effect if available
    if (typeof showLoadingSplash === 'function') {
        showLoadingSplash();
    }
    
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: '',  // Empty title, we'll set custom greeting
        single_column: true
    });
    
    // Get current user's name
    const userFullName = frappe.session.user_fullname;
    const firstName = userFullName.split(' ')[0];
    
    // Create custom greeting title with professional styling
    const currentTime = new Date();
    const hour = currentTime.getHours();
    let greeting = "Welcome";
    
    // Time-appropriate greeting
    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    
    const $customTitle = $(`
        <div class="professional-greeting">
            <div class="greeting-text">${greeting},</div>
            <div class="user-name">${firstName}</div>
        </div>
    `);
    
    // Add the custom title to the page header
    setTimeout(() => {
        $('.page-title h3').first().empty().append($customTitle);
    }, 100);
    
    frappe.appointment = frappe.appointment || {};
    
    // Initialize the appointment page
    initAppointmentPage(page);
};

function initAppointmentPage(page) {
    // Add section for upcoming appointments
    page.main.html(`
        <div class="appointment-dashboard">
            <div class="section-container">
                <div class="section-header" style="color: #4682b4; border-bottom: 2px solid #4682b4;">
                    <h4>Patient Appointments</h4>
                </div>
                <div id="appointment-list" class="section-body"></div>
            </div>
        </div>
    `);
    
    // Add CSS for styling
    const style = document.createElement('style');
    style.textContent = `
        .appointment-dashboard {
            padding: 15px;
            background-color: #f5f7fa;
            height: calc(100vh - 150px);
            overflow-y: auto;
        }
        .section-container {
            background-color: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 15px;
            margin-bottom: 20px;
        }
        .section-header {
            margin-bottom: 15px;
            padding-bottom: 10px;
        }
        .section-body {
            min-height: 50px;
        }
        .professional-greeting {
            display: flex;
            flex-direction: column;
            color:rgb(255, 255, 255);
        }
        .greeting-text {
            font-size: 16px;
            opacity: 0.9;
        }
        .user-name {
            font-size: 22px;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
    
    // Create the list view for appointments
    new frappe.views.ListView({
        parent: $('#appointment-list'),
        doctype: 'Patient Appointment',
        page_title: 'Patient Appointments',
        settings: {
            fields: ['name', 'patient', 'patient_name', 'practitioner', 'appointment_date', 'status'],
            filters: [['status', '!=', 'Cancelled']]
        }
    });
}
