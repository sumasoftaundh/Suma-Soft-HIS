# Project Overview – sumasoft‑bench

## Repository Structure
- **apps/** – contains the main applications:
  - `frappe/` – the core Frappe framework (web framework, ORM, UI components, etc.).
  - `healthcare/` – a comprehensive healthcare module with over 130 doctypes covering patients, encounters, prescriptions, labs, procedures, and more.
  - `erpnext/` – (present in the repo but not examined in detail for this overview).
- Various configuration files, scripts, and CI assets at the repository root.

## Core Applications
### Frappe
- Provides the underlying web‑application framework.
- Key directories: `frappe/public/` (static assets), `frappe/desk/` (UI components), `frappe/model/`, `frappe/api/`, etc.
- Styling is managed via SCSS files under `frappe/public/scss/`.

### Healthcare
- Implements a full‑stack health‑care solution.
- Doctype hierarchy located in `apps/healthcare/healthcare/healthcare/doctype/`.
- Notable doctypes (selected examples):
  - `patient`, `encounter_consultation`, `encounter_examination`, `lab_test`, `prescription`, `therapy_plan`.
- Each doctype includes a JSON schema and accompanying Python/JS logic.

## Styling – Sidebar SCSS (`frappe/public/scss/desk/sidebar.scss`)
- Defines CSS custom properties for colors, widths, and dark‑mode variants:
  - `--sidebar-hover-color`, `--sidebar-active-color`, `--sidebar-border-color`.
  - Widths: `--sidebar-width: 220px`, `--left-sidebar-width: 240px`.
- Contains mixins such as `body-sidebar-expanded` to handle hover‑expand behavior and responsive media queries for mobile.
- Styles for logo, icons, hover effects, and collapse/expand transitions.

## Data Model Summary (Healthcare Doctypes)
- **Total doctypes:** 133 sub‑directories (each representing a doctype) plus a few utility files.
- **Key domains:**
  - Patient management (patient, patient_encounter, patient_consultation).
  - Clinical documentation (clinical_note, diagnosis, observation).
  - Lab & test management (lab_test, lab_test_template, lab_test_sample).
  - Medication & prescription (medication, prescription_dosage, drug_interaction).
  - Therapy & treatment planning (therapy_plan, treatment_plan_template).
  - Scheduling & appointments (appointment_type, practitioner_schedule).
- JSON schema files (e.g., `patient.json`) describe fields, links, and permissions for each doctype.

## Summary
The **sumasoft‑bench** repository houses a robust Frappe framework alongside a feature‑rich Healthcare application. Styling is centrally managed via SCSS, with the sidebar receiving detailed theming and responsive behavior. The healthcare module defines an extensive set of data models to support end‑to‑end clinical workflows.

*Generated on 2025‑12‑30.*
