/**
 * Direct and immediate icon removal script
 * This script targets the exact icons shown in the screenshot
 * It uses the most aggressive approach to ensure they are removed
 */

(function() {
    // Execute immediately on script load
    removeNavbarIcons();
    
    // Also set a timer to run after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            removeNavbarIcons();
            setupObserver();
        });
    } else {
        removeNavbarIcons();
        setupObserver();
    }
    
    // Function to remove icons
    function removeNavbarIcons() {
        // Direct approach - find by class
        const bellIcons = document.querySelectorAll('.fa-bell, .fa-bell-o');
        const plusIcons = document.querySelectorAll('.fa-plus');
        
        // Remove the icons themselves
        bellIcons.forEach(icon => {
            icon.style.display = 'none';
            // Also try to remove parent elements that might be dropdowns
            let parent = icon.parentElement;
            for (let i = 0; i < 4; i++) {
                if (!parent) break;
                if (parent.classList.contains('dropdown')) {
                    parent.style.display = 'none';
                    break;
                }
                parent = parent.parentElement;
            }
        });
        
        plusIcons.forEach(icon => {
            icon.style.display = 'none';
            // Also try to remove parent elements that might be dropdowns
            let parent = icon.parentElement;
            for (let i = 0; i < 4; i++) {
                if (!parent) break;
                if (parent.classList.contains('dropdown')) {
                    parent.style.display = 'none';
                    break;
                }
                parent = parent.parentElement;
            }
        });
        
        // Target by data attributes
        const dataElements = document.querySelectorAll('[data-original-title="Notifications"], [data-original-title="Create a new..."]');
        dataElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Target specific navbar elements by position - rightmost elements
        const navbar = document.querySelector('.navbar-right');
        if (navbar) {
            const children = navbar.children;
            // Hide the right-side elements which typically contain notifications and new buttons
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.classList.contains('dropdown')) {
                    child.style.display = 'none';
                }
            }
        }
        
        // Apply inline CSS to force hide these elements
        const style = document.createElement('style');
        style.textContent = `
            .fa-bell, .fa-bell-o, .fa-plus { 
                display: none !important; 
            }
            .navbar-right .dropdown:nth-last-child(1),
            .navbar-right .dropdown:nth-last-child(2) {
                display: none !important;
            }
            [data-navbar-default="notifications"],
            [data-navbar-default="new"] {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Setup observer to keep watching for dynamic content
    function setupObserver() {
        const observer = new MutationObserver(function() {
            removeNavbarIcons();
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
    
    // Also run when jQuery is available (more reliable in Frappe)
    if (typeof jQuery !== 'undefined') {
        jQuery(document).ready(function($) {
            // Hide using jQuery
            $('.fa-bell, .fa-bell-o, .fa-plus').hide();
            $('.navbar-right .dropdown:has(.fa-bell)').hide();
            $('.navbar-right .dropdown:has(.fa-plus)').hide();
            $('[data-navbar-default="notifications"]').hide();
            $('[data-navbar-default="new"]').hide();
            
            // Setup route change handlers
            $(document).on('page-change', removeNavbarIcons);
            $(document).on('route-change', removeNavbarIcons);
        });
    }
})();
