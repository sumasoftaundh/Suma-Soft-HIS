// FAQ page JavaScript
frappe.pages['faq'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'FAQ',
        single_column: true
    });

    // Load the FAQ data
    frappe.call({
        method: 'healthcare.page.faq.faq.get_all_faqs',
        callback: function(r) {
            if (r.message) {
                // Render the FAQ content
                const content = $(`<div class="faq-content"></div>`);
                
                // Create accordion for each category
                const accordion = $('<div class="accordion" id="faqAccordion"></div>');
                
                // Group FAQs by category
                const faqsByCategory = {};
                r.message.categories.forEach(category => {
                    faqsByCategory[category] = [];
                });
                
                r.message.faqs.forEach(faq => {
                    faqsByCategory[faq.category].push(faq);
                });
                
                // Create accordion items
                r.message.categories.forEach((category, index) => {
                    const faqs = faqsByCategory[category];
                    if (faqs.length > 0) {
                        const accordionItem = $(`
                            <div class="card">
                                <div class="card-header" id="heading${index}">
                                    <h5 class="mb-0">
                                        <button class="btn btn-link" type="button" data-toggle="collapse" 
                                            data-target="#collapse${index}" aria-expanded="true" 
                                            aria-controls="collapse${index}">
                                            ${category}
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse${index}" class="collapse" 
                                    aria-labelledby="heading${index}" data-parent="#faqAccordion">
                                    <div class="card-body">
                                        ${faqs.map(faq => `
                                            <div class="faq-item mb-3">
                                                <h6>${faq.question}</h6>
                                                <p>${faq.answer}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `);
                        accordion.append(accordionItem);
                    }
                });
                
                content.append(accordion);
                page.main.html(content);
            }
        }
    });
};
