// FAQ page functionality
frappe.ready(function() {
    // Initialize FAQ items
    function initFAQ() {
        // Add ARIA attributes for accessibility
        $('.faq-item').each(function(index) {
            const id = 'faq-' + (index + 1);
            const $item = $(this);
            const $question = $item.find('.faq-question');
            const $answer = $item.find('.faq-answer');
            
            // Set up ARIA attributes
            $item.attr({
                'role': 'button',
                'tabindex': '0',
                'aria-expanded': 'false',
                'aria-controls': id + '-answer',
                'data-category': $item.data('category') || 'general'
            });
            
            $question.attr('id', id + '-question');
            $answer.attr({
                'id': id + '-answer',
                'aria-labelledby': id + '-question'
            });
            
            // Add focus styles for keyboard navigation
            $item.on('focus', function() {
                $(this).addClass('faq-item-focused');
            }).on('blur', function() {
                $(this).removeClass('faq-item-focused');
            });
        });

        // Toggle FAQ items with smooth animation
        $(document).on('click', '.faq-item', function(e) {
            // Don't toggle if clicking on a button or link inside the FAQ item
            if ($(e.target).is('a, button, .btn, [role="button"]')) {
                return;
            }
            
            const $item = $(this);
            const $answer = $item.find('.faq-answer');
            const isOpening = !$item.hasClass('active');
            const $icon = $item.find('.plus-icon');

            // Close all other open items if opening this one
            if (isOpening) {
                $('.faq-item').not($item).removeClass('active')
                    .find('.faq-answer').slideUp(200);
                $('.faq-item').not($item).find('.plus-icon')
                    .text('+')
                    .css('transform', 'rotate(0deg)')
                    .css('background-color', 'var(--primary-color)');
                $('.faq-item').not($item).attr('aria-expanded', 'false');
            }

            // Toggle current item
            $item.toggleClass('active');
            $answer.slideToggle(200);
            const isExpanded = $item.attr('aria-expanded') === 'true';
            $item.attr('aria-expanded', !isExpanded);
            
            // Update icon and style
            if ($item.hasClass('active')) {
                $icon.text('−')
                    .css('transform', 'rotate(45deg)')
                    .css('background-color', 'var(--primary-hover)');
            } else {
                $icon.text('+')
                    .css('transform', 'rotate(0deg)')
                    .css('background-color', 'var(--primary-color)');
            }
        });

        // Add keyboard navigation
        $('.faq-item').on('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).trigger('click');
            }
            
            // Keyboard arrow navigation between FAQ items
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const $items = $('.faq-item:visible');
                const currentIndex = $items.index(this);
                let nextIndex;
                
                if (e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % $items.length;
                } else {
                    nextIndex = (currentIndex - 1 + $items.length) % $items.length;
                }
                
                $items.eq(nextIndex).focus();
            }
        });
    }

    // Filter FAQ items by category
    function filterFAQs(category) {
        if (category === 'all') {
            $('.faq-item').show();
        } else {
            $('.faq-item').each(function() {
                const $item = $(this);
                const itemCategory = $item.data('category');
                $item.toggle(itemCategory === category);
            });
        }
        
        // Update active state of filter buttons
        $('.filter-btn').removeClass('active');
        $(`.filter-btn[data-category="${category}"]`).addClass('active');
        
        // Update URL hash
        window.location.hash = category === 'all' ? '' : `#${category}`;
    }

    // Search functionality
    function searchFAQs(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            $('.faq-item').show();
            return;
        }
        
        $('.faq-item').each(function() {
            const $item = $(this);
            const text = $item.text().toLowerCase();
            const matches = text.includes(searchTerm);
            $item.toggle(matches);
            
            // Highlight matching text
            if (matches) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                const question = $item.find('.faq-question').html();
                const answer = $item.find('.faq-answer').html();
                
                $item.find('.faq-question').html(
                    question.replace(regex, '<span class="highlight">$1</span>')
                );
                
                if ($item.hasClass('active')) {
                    $item.find('.faq-answer').html(
                        answer.replace(regex, '<span class="highlight">$1</span>')
                    );
                }
            }
        });
        
        // Show no results message if no matches
        const $noResults = $('.no-results');
        if ($('.faq-item:visible').length === 0) {
            if ($noResults.length === 0) {
                $('.faq-list').append(
                    '<div class="no-results text-center py-5">' +
                    '<i class="fas fa-search fa-3x mb-3 text-muted"></i>' +
                    '<h4>No results found</h4>' +
                    '<p class="text-muted">Try different keywords or check the spelling</p>' +
                    '</div>'
                );
            } else {
                $noResults.show();
            }
        } else {
            $noResults.hide();
        }
    }

    // Initialize the FAQ functionality
    initFAQ();

    // Handle filter button clicks
    $('.filter-btn').on('click', function() {
        const category = $(this).data('category');
        filterFAQs(category);
    });

    // Handle search input
    let searchTimeout;
    $('#faq-search').on('input', function() {
        clearTimeout(searchTimeout);
        const query = $(this).val();
        
        searchTimeout = setTimeout(() => {
            searchFAQs(query);
        }, 300);
    });

    // Handle clear search button
    $('.clear-search').on('click', function() {
        $('#faq-search').val('').trigger('input');
    });

    // Handle URL hash on page load
    if (window.location.hash) {
        const category = window.location.hash.substring(1);
        if ($(`.filter-btn[data-category="${category}"]`).length) {
            filterFAQs(category);
        }
    }

    // Handle print styles
    if (window.matchMedia) {
        const mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(mql => {
            if (mql.matches) {
                $('.faq-answer').show();
            }
        });
    }
});
