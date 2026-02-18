$(document).ready(function() {
    // This script adds the search bar to the header of the 'Build' workspace page.

    const addSearchBarToWorkspace = () => {
        // Use safe route handling with suma utils
        try {
            // Only run on the 'Build' workspace page if frappe.router is available
            if (!frappe || !frappe.router || !frappe.router.slug || !frappe.router.get_route) {
                console.log('[workspace_search] frappe.router not available, skipping');
                return;
            }
            
            const route = frappe.router.get_route();
            if (!route || frappe.router.slug(route) !== 'build') {
                return;
            }
        } catch (e) {
            console.error('[workspace_search] Error checking route:', e);
            return;
        }

        const observer = new MutationObserver((mutationsList, observer) => {
            const workspaceHeader = document.querySelector('.workspace-header');
            if (workspaceHeader) {
                // Header is found, disconnect observer to avoid re-running
                observer.disconnect();

                // Check if search bar is already added
                if (document.getElementById('workspace-search-container')) {
                    return;
                }

                // Create the search bar container
                const searchContainer = document.createElement('div');
                searchContainer.id = 'workspace-search-container';
                searchContainer.style.flexGrow = '1';
                searchContainer.style.maxWidth = '600px';
                searchContainer.style.marginLeft = 'auto';
                searchContainer.style.marginRight = '20px';
                searchContainer.innerHTML = '<div id="workspace-search-bar"></div>';

                // Append search bar to the header
                workspaceHeader.appendChild(searchContainer);

                // Ensure header has flex properties to align items correctly
                workspaceHeader.style.display = 'flex';
                workspaceHeader.style.alignItems = 'center';
                workspaceHeader.style.width = '100%';

                // Initialize the AwesomeBar
                try {
                    if (frappe.search && frappe.search.AwesomeBar) {
                        let awesome_bar = new frappe.search.AwesomeBar();
                        awesome_bar.setup("#workspace-search-bar");
                    } else {
                        console.warn('AwesomeBar not ready, will retry.');
                        setTimeout(() => awesome_bar.setup("#workspace-search-bar"), 500);
                    }
                } catch (e) {
                    console.error('Failed to initialize AwesomeBar:', e);
                }
            }
        });

        const targetNode = document.querySelector('body');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }
    };

    // Handle route changes to re-run the script if needed
    frappe.router.on('routeChange', addSearchBarToWorkspace);

    // Initial run
    addSearchBarToWorkspace();
});
