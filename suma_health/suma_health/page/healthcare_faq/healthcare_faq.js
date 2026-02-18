frappe.pages['healthcare-faq'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Healthcare FAQ',
        single_column: true
    });



    // Add a back button to return to the previous page
    page.add_inner_button('← Back', () => window.history.back(), 'left');

    // FAQ content
    const container = $(wrapper).find('.layout-main-section');
    
    container.append(`
        <div class="healthcare-faq-container">
            <div class="mb-4 text-center">
                <h3>Frequently Asked Questions</h3>
                <p class="text-muted">
                    Find answers to the most common questions about Suma Health healthcare system and services.
                </p>
            </div>
            
            <div class="faq-search mb-4">
                <div class="input-group">
                    <input type="text" class="form-control" id="faq-search" 
                           placeholder="Search FAQs...">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" id="search-btn">
                            <i class="fa fa-search"></i> Search
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="faq-categories mb-4 text-center">
                <button class="btn btn-primary btn-sm m-2 category-btn" data-category="all">All</button>
                <button class="btn btn-secondary btn-sm m-2 category-btn" data-category="appointments">Appointments</button>
                <button class="btn btn-secondary btn-sm m-2 category-btn" data-category="billing">Billing</button>
                <button class="btn btn-secondary btn-sm m-2 category-btn" data-category="medical">Medical</button>
                <button class="btn btn-secondary btn-sm m-2 category-btn" data-category="system">System</button>
            </div>
            
            <div class="faq-list mt-4">
                <!-- FAQ items will be populated here -->
            </div>
        </div>
    `);

    // FAQ data
    const faqs = [
        {
            question: "How do I schedule a new patient appointment?",
            answer: "To schedule a new patient appointment, click on the '➕ Add Appointment' button in the Reception Dashboard. Fill in the patient details, select a practitioner, date, and time. You can also set appointment type and specify a duration. New patients will need to be added to the system first using the '➕ Add Patient' button.",
            category: "appointments"
        },
        {
            question: "How do I check a patient's payment status?",
            answer: "Click on the '💳 Patient Payment Status' button on the Reception Dashboard. This will take you to the Sales Invoice list where you can view and filter payment statuses for all patients. You can also search for a specific patient by name or ID to check their payment history and outstanding balances.",
            category: "billing"
        },
        {
            question: "What do the different appointment statuses mean?",
            answer: "<ul><li><b>Scheduled</b>: The appointment has been booked but is pending.</li><li><b>Open</b>: The appointment date has arrived but patient hasn't checked in.</li><li><b>Confirmed</b>: The appointment has been confirmed by staff or patient.</li><li><b>Checked In</b>: The patient has arrived and checked in.</li><li><b>Checked Out</b>: The patient has completed their visit and left.</li><li><b>Closed</b>: The appointment and all related procedures are complete.</li><li><b>Cancelled</b>: The appointment was cancelled.</li><li><b>No Show</b>: The patient didn't show up for the appointment.</li></ul>",
            category: "appointments"
        },
        {
            question: "How do I access a patient's medical history?",
            answer: "From the Patient List, click on a patient's name to open their Patient Card. Within the patient record, you can view their medical history, including past appointments, diagnoses, prescriptions, lab results, and clinical notes by navigating through the tabs in the patient record.",
            category: "medical"
        },
        {
            question: "How do I generate a lab test for a patient?",
            answer: "From the Patient's record page, click on 'Create' and select 'Lab Test' from the dropdown menu. Select the appropriate lab test template, fill in the required details, and submit the form. You can later update the test with results once they are available.",
            category: "medical"
        },
        {
            question: "Can I issue a refund for a patient payment?",
            answer: "Yes, to issue a refund, go to the patient's Sales Invoice, click on 'Create' and select 'Payment Entry'. Choose the payment type as 'Refund', enter the amount to be refunded, and submit the form. Make sure to include notes regarding the reason for the refund for record-keeping.",
            category: "billing"
        },
        {
            question: "How do I create a prescription for a patient?",
            answer: "During a patient encounter, click on the 'Prescriptions' tab. Click 'Add Row' to add medications. For each medication, specify the drug, dosage, period, and any special instructions. You can then print or email the prescription directly to the patient or pharmacy.",
            category: "medical"
        },
        {
            question: "How can I view my schedule for the day?",
            answer: "Healthcare practitioners can view their schedule by going to the 'Practitioner Schedule' page. This shows all appointments organized by time slots. The Reception Dashboard also provides a quick overview of all scheduled appointments that can be filtered by status.",
            category: "appointments"
        },
        {
            question: "What should I do if the system is running slowly?",
            answer: "If the system is running slowly, try refreshing your browser first. If problems persist, clear your browser cache and cookies. If the issue continues, contact your system administrator who can check server resources and possibly restart the application server to resolve performance issues.",
            category: "system"
        },
        {
            question: "How do I create an invoice for healthcare services?",
            answer: "To create an invoice, go to the patient's record and click on 'Create' > 'Sales Invoice'. You can also click on the '💳 Patient Payment Status' button and create a new invoice. Select the patient, add the services or items provided, and submit the invoice. The system will automatically calculate taxes and totals.",
            category: "billing"
        },
        {
            question: "Can I send appointment reminders to patients?",
            answer: "Yes, the system can automatically send SMS or email reminders to patients. These are configured in Healthcare Settings. You can set the timing for reminders (e.g., 1 day before appointment) and customize the message template. You can also manually trigger reminders from the appointment record.",
            category: "appointments"
        },
        {
            question: "How do I register a new healthcare practitioner in the system?",
            answer: "Go to Healthcare > Healthcare Practitioner > New. Fill in the practitioner's personal details, specialization, and contact information. You can also set their consultation charges, availability schedule, and link them to a user account if they need system access.",
            category: "system"
        },
        {
            question: "Where can I find system logs if there's an error?",
            answer: "System logs can be accessed through the server's log files. For technical users, these are typically located in the '/logs' directory of your Frappe instance. Regular users should report errors to their system administrator who can check these logs to diagnose issues.",
            category: "system"
        },
        {
            question: "How do I link diagnostic tests with billing?",
            answer: "When creating Lab Tests or Diagnostic Procedures, they are automatically linked to billable items in the system. When you create an invoice, you can select these completed tests, and the system will pull in the correct billing amounts based on the configured rates.",
            category: "billing"
        },
        {
            question: "How can I track inventory of medical supplies?",
            answer: "Medical supplies are tracked through the Inventory module. You can set up medical items with minimum stock levels and expiration tracking. When supplies are used during procedures, they can be automatically deducted from inventory, and the system will alert you when restocking is needed.",
            category: "system"
        },
        {
            question: "How do I add health insurance details for a patient?",
            answer: "Open the patient's record, scroll to the 'Insurance' section, and click on 'Add Row'. Enter the insurance provider, policy number, coverage details, and any co-pay requirements. This information will be available when creating invoices to properly bill insurance vs. patient responsibility.",
            category: "billing"
        }
    ];

    // Render FAQ items
    function renderFAQs(items) {
        const faqList = container.find('.faq-list');
        faqList.empty();
        
        if (items.length === 0) {
            faqList.append(`<div class="text-center py-4">No FAQs matching your search.</div>`);
            return;
        }
        
        items.forEach((faq, index) => {
            faqList.append(`
                <div class="faq-item" data-category="${faq.category}">
                    <div class="faq-question" data-index="${index}">
                        <div>
                            <span class="faq-tag ${faq.category}">${faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}</span>
                            ${faq.question}
                        </div>
                        <div><i class="fa fa-chevron-down"></i></div>
                    </div>
                    <div class="faq-answer">
                        ${faq.answer}
                    </div>
                </div>
            `);
        });

        // Add click event for FAQ questions
        $('.faq-question').on('click', function() {
            $(this).toggleClass('active');
            const answer = $(this).next('.faq-answer');
            answer.toggleClass('show');
            
            const icon = $(this).find('i');
            if (answer.hasClass('show')) {
                icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
            } else {
                icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
            }
        });
    }

    // Initial render
    renderFAQs(faqs);

    // Filter by category
    $('.category-btn').on('click', function() {
        $('.category-btn').removeClass('btn-primary').addClass('btn-secondary');
        $(this).removeClass('btn-secondary').addClass('btn-primary');
        
        const category = $(this).data('category');
        let filteredFaqs;
        
        if (category === 'all') {
            filteredFaqs = faqs;
        } else {
            filteredFaqs = faqs.filter(faq => faq.category === category);
        }
        
        renderFAQs(filteredFaqs);
    });

    // Search functionality
    $('#search-btn').on('click', function() {
        const searchTerm = $('#faq-search').val().toLowerCase();
        if (searchTerm === '') {
            renderFAQs(faqs);
            return;
        }
        
        const filteredFaqs = faqs.filter(faq => 
            faq.question.toLowerCase().includes(searchTerm) || 
            faq.answer.toLowerCase().includes(searchTerm)
        );
        
        renderFAQs(filteredFaqs);
    });

    // Search on enter key
    $('#faq-search').on('keyup', function(e) {
        if (e.key === 'Enter') {
            $('#search-btn').click();
        }
    });
};
