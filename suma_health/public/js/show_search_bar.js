$(document).ready(function() {
    // This script ONLY ensures the navbar search bar is always visible on admin pages.
    // It is carefully designed to not interfere with any other page elements.

    const showSearchBar = () => {
        // Only target the search bar in the navbar
        const searchBar = document.querySelector('.search-bar');
        const searchIcon = document.querySelector('.search-icon');

        if (searchBar) {
            // Make search bar visible without affecting other elements
            searchBar.classList.remove('hidden', 'd-none');

            // Only modify the search bar's display properties
            if (searchBar.style.display === 'none') {
                searchBar.style.display = '';
            }
            if (searchBar.style.visibility === 'hidden') {
                searchBar.style.visibility = 'visible';
            }
            
            // Ensure proper positioning without disrupting layout
            searchBar.style.position = 'relative';
        }

        if (searchIcon) {
            // Handle mobile search icon without affecting sidebar
            if (window.innerWidth <= 768) {
                searchIcon.classList.remove('hidden');
            } else {
                searchIcon.classList.add('hidden');
            }
        }
    };

    // Short delay to let other scripts finish their work
    setTimeout(showSearchBar, 1000);

    // Update on resize without interfering with sidebar functionality
    window.addEventListener('resize', showSearchBar);
});
