// Add FAQ icon to navigation bar
frappe.ready(function() {
    // Wait for the navigation bar to be fully loaded
    let checkExist = setInterval(function() {
        let $navbar = $('.navbar-nav.ml-auto');
        if ($navbar.length) {
            clearInterval(checkExist);
            
            // Check if FAQ link already exists
            if ($('.nav-item .nav-link[href*="faq"]').length === 0) {
                // Create FAQ list item
                let faqItem = $(
                    '<li class="nav-item">' +
                    '<a class="nav-link" href="/faq">FAQ</a>' +
                    '</li>'
                );
                
                // Insert FAQ item before the login button
                $navbar.find('.btn-login-area').closest('li').before(faqItem);
                
                // If user is logged in, add it to the right side
                if (frappe.session.user !== 'Guest') {
                    // Remove if it was added to the left side
                    faqItem.remove();
                    
                    // Add to the right side before the user dropdown
                    faqItem = $(
                        '<li class="nav-item">' +
                        '<a class="nav-link" href="/faq">FAQ</a>' +
                        '</li>'
                    );
                    
                    $navbar.find('.nav-avatar').closest('li').before(faqItem);
                }
            }
        }
    }, 100); // check every 100ms
});