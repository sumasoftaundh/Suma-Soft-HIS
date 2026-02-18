/**
 * Script to load and inject the CSS to remove bell and plus icons
 * This will ensure the CSS is loaded on all pages of the application
 */

(function() {
    // Function to inject CSS into the page
    function injectCSS() {
        // Create link element for our CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.type = 'text/css';
        linkElement.href = '/assets/healthcare/css/remove_icons.css';
        linkElement.id = 'remove-icons-css';
        
        // Add timestamp to prevent caching
        linkElement.href += '?v=' + new Date().getTime();
        
        // Add to document head
        document.head.appendChild(linkElement);
        
        console.log('Injected CSS to remove bell and plus icons');
    }
    
    // Additionally, use direct DOM manipulation to hide specific elements
    function hideSpecificElements() {
        // Hide elements with direct JavaScript for immediate effect
        const selectors = [
            // Standard Frappe navbar items
            '.navbar-right .dropdown-notifications', 
            '.navbar-right .dropdown-help',
            '.navbar .notifications-icon',
            '.navbar .fa-bell-o',
            '.navbar .fa-bell',
            '.navbar .fa-plus',
            
            // Elements in the header (shown in screenshot)
            '.page-head .fa-bell',
            '.page-head .fa-plus',
            '.page-title .fa-bell',
            '.page-title .fa-plus',
            
            // Frappe standard navbar items
            '[data-navbar-default="notifications"]',
            '[data-navbar-default="help"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                element.classList.add('hidden-by-suma');
            });
        });
        
        // Try to find elements by their icons and hide their parent containers
        const iconElements = document.querySelectorAll('.fa-bell, .fa-bell-o, .fa-plus');
        iconElements.forEach(icon => {
            // Navigate up to potential dropdown parent
            let parent = icon.parentElement;
            for (let i = 0; i < 3; i++) { // Check up to 3 levels up
                if (parent && (parent.classList.contains('dropdown') || 
                               parent.hasAttribute('data-navbar-default'))) {
                    parent.style.display = 'none';
                    parent.classList.add('hidden-by-suma');
                    break;
                }
                if (parent) parent = parent.parentElement;
            }
        });
    }
    
    // Function to run all our hiding methods
    function removeAllIcons() {
        injectCSS();
        hideSpecificElements();
        
        // Also attempt to use direct jQuery if available
        if (typeof $ !== 'undefined') {
            $('.navbar-right .dropdown:has(.fa-bell)').hide();
            $('.navbar-right .dropdown:has(.fa-plus)').hide();
            $('[data-navbar-default="notifications"]').hide();
            $('[data-navbar-default="new"]').hide();
        }
    }
    
    // Run once on page load
    removeAllIcons();
    
    // Set up a mutation observer to handle dynamically added elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // If new nodes are added, run our code again
                removeAllIcons();
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also run on any route change (for single page applications)
    if (typeof frappe !== 'undefined') {
        $(document).on('route-change', function() {
            setTimeout(removeAllIcons, 100); // Small delay to allow DOM updates
        });
    }
})();
