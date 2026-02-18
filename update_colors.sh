#!/bin/bash

# Define the pink colors
PRIMARY_COLOR='#ff69b4'
LIGHT_PINK='#fff0f6'

# Find and replace colors in all SCSS files
find /home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss -type f -name "*.scss" | while read file; do
    # Replace gray colors with pink
    sed -i 's/\(color:\|background-color:\|border-color:\)\s*var(--gray-\w*\)/\1 var(--primary)/g' "$file"
    sed -i 's/\(color:\|background-color:\|border-color:\)\s*#\w\w\w\w\w\w/\1 var(--primary)/g' "$file"
    
    # Replace white backgrounds with light pink
    sed -i 's/\(background-color:\)\s*white/\1 var(--bg-color)/g' "$file"
    sed -i 's/\(background-color:\)\s*#ffffff/\1 var(--bg-color)/g' "$file"
    
    # Replace accent colors with primary
    sed -i 's/\(color:\|background-color:\|border-color:\)\s*var(--accent)/\1 var(--primary)/g' "$file"
done

# Update CSS variables file with pink colors
sed -i 's/--primary:\s*#[^;]*/--primary: #ff69b4;/' "/home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss/common/css_variables.scss"
sed -i 's/--bg-color:\s*#[^;]*/--bg-color: #fff0f6;/' "/home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss/common/css_variables.scss"
sed -i 's/--bg-accent:\s*#[^;]*/--bg-accent: #fff0f6;/' "/home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss/common/css_variables.scss"
sed -i 's/--card-bg:\s*#[^;]*/--card-bg: #fff0f6;/' "/home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss/common/css_variables.scss"
sed -i 's/--navbar-bg:\s*#[^;]*/--navbar-bg: #fff0f6;/' "/home/devuser/sumasoft-bench/apps/frappe/frappe/public/scss/common/css_variables.scss"
