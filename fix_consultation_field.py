#!/usr/bin/env python3
"""
Script to fix the consultation field in Patient Encounter customization
"""

import frappe

def fix_consultation_field():
    """Fix or remove the consultation custom field that's missing options"""
    frappe.init(site='frappe-ggfc.sumasoft.com')
    frappe.connect()
    
    try:
        # Try to find custom field with fieldname 'consultation' in Patient Encounter
        custom_fields = frappe.get_all(
            'Custom Field',
            filters={
                'dt': 'Patient Encounter',
                'fieldname': 'consultation'
            },
            fields=['name', 'fieldtype', 'options', 'label']
        )
        
        if custom_fields:
            print(f"Found {len(custom_fields)} custom field(s) with fieldname 'consultation':")
            for cf in custom_fields:
                print(f"  - {cf.name}: {cf.label} ({cf.fieldtype}), Options: {cf.options}")
                
                # Fix the field by setting options
                if cf.fieldtype == 'Table MultiSelect' and not cf.options:
                    print(f"\nFixing field {cf.name}...")
                    doc = frappe.get_doc('Custom Field', cf.name)
                    doc.options = 'Patient Encounter Consultation'
                    doc.save()
                    frappe.db.commit()
                    print(f"✅ Fixed! Set options to 'Patient Encounter Consultation'")
        else:
            print("No custom field with fieldname 'consultation' found in Patient Encounter")
            
            # Check if it's in Property Setter
            property_setters = frappe.get_all(
                'Property Setter',
                filters={
                    'doc_type': 'Patient Encounter',
                    'field_name': 'consultation'
                },
                fields=['name', 'property', 'value']
            )
            
            if property_setters:
                print(f"\nFound {len(property_setters)} Property Setter(s):")
                for ps in property_setters:
                    print(f"  - {ps.name}: {ps.property} = {ps.value}")
            else:
                print("No Property Setter found either")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        frappe.destroy()

if __name__ == '__main__':
    fix_consultation_field()
