frappe.pages['faq'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Frequently Asked Questions',
        single_column: true
    });

    // Remove the "Add FAQ" button from the page actions
    page.clear_primary_action();

    let all_faqs = [];
    let categories = [];

    // Load the HTML template and CSS
    const css_path = '/assets/healthcare/page/faq/faq.css';
    const html_path = '/assets/healthcare/page/faq/faq.html';

    // Ensure CSS is loaded
    frappe.require(css_path);

    frappe.require(html_path).then(() => {
        $(frappe.render_template('faq', {})).appendTo(page.body);

        // Fetch FAQs and Categories
        fetch_data();

        // Setup event listeners
        $('#sub-category-filter').on('change', render_faqs);
        $('#faq-search').on('keyup', frappe.utils.debounce(render_faqs, 300));
    });

    function fetch_data() {
        frappe.call({
            method: 'healthcare.healthcare.page.faq.faq.get_all_faqs',
            callback: function(r) {
                const data = r.message || { categories: [], faqs: [] };
                
                categories = data.categories;
                const category_filter = $('#sub-category-filter');
                categories.forEach(cat => {
                    category_filter.append(`<option value="${cat}">${cat}</option>`);
                });

                all_faqs = data.faqs;
                render_faqs();
            }
        });
    }

    function render_faqs() {
        const faq_list = $('#faq-list-custom');
        const category = $('#sub-category-filter').val();
        const search_term = $('#faq-search').val().toLowerCase();

        faq_list.empty();

        let filtered_faqs = all_faqs;

        if (category !== 'All') {
            filtered_faqs = filtered_faqs.filter(faq => faq.category === category);
        }

        if (search_term) {
            filtered_faqs = filtered_faqs.filter(faq => 
                faq.question.toLowerCase().includes(search_term) || 
                (faq.answer && faq.answer.toLowerCase().includes(search_term))
            );
        }

        if (filtered_faqs.length === 0) {
            faq_list.html('<p class="text-muted text-center">No FAQs found.</p>');
            return;
        }

        filtered_faqs.forEach(faq => {
            const faq_item = $(`
                <div class="faq-item-custom" data-category="${faq.category}">
                    <div class="faq-question-custom">
                        <span>${faq.question}</span>
                        <span class="icon">+</span>
                    </div>
                    <div class="faq-answer-custom">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `);
            faq_list.append(faq_item);
        });

        // Accordion functionality
        $('.faq-question-custom').on('click', function() {
            const item = $(this).closest('.faq-item-custom');
            const icon = $(this).find('.icon');

            // Toggle active class on the item
            item.toggleClass('active');

            // Slide toggle the answer
            item.find('.faq-answer-custom').slideToggle(200);

            // Change icon text
            if (item.hasClass('active')) {
                icon.text('-');
            } else {
                icon.text('+');
            }
        });
    }
};
