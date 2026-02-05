import frappe

# Find and fix the consultation custom field
custom_fields = frappe.get_all(
    'Custom Field',
    filters={
        'dt': 'Patient Encounter',
        'fieldname': 'consultation'
    },
    fields=['name', 'fieldtype', 'options', 'label']
)

if custom_fields:
    print(f"Found {len(custom_fields)} custom field(s):")
    for cf in custom_fields:
        print(f"  - {cf.name}: {cf.label} ({cf.fieldtype}), Options: '{cf.options}'")
        
        # Fix the field by setting options
        if cf.fieldtype == 'Table MultiSelect' and not cf.options:
            print(f"\nFixing field {cf.name}...")
            doc = frappe.get_doc('Custom Field', cf.name)
            doc.options = 'Patient Encounter Consultation'
            doc.save()
            frappe.db.commit()
            print(f"✅ Fixed! Set options to 'Patient Encounter Consultation'")
else:
    print("No custom field with fieldname 'consultation' found")
