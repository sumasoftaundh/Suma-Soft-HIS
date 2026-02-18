import frappe
from frappe import _
from frappe.utils.nestedset import get_root_of
from frappe.exceptions import ValidationError

def manage_invoice_submit_cancel(doc, method):
	if not doc.patient:
		return

	if doc.items:
		for item in doc.items:
			if item.get("reference_dt") and item.get("reference_dn"):
				# TODO check
				# if frappe.get_meta(item.reference_dt).has_field("invoiced"):
				set_invoiced(item, method, doc.name)

		if method == "on_submit" and frappe.db.get_single_value(
			"Healthcare Settings", "create_observation_on_si_submit"
		):
			create_sample_collection_and_observation(doc)

	if method == "on_submit":
		if frappe.db.get_single_value("Healthcare Settings", "create_lab_test_on_si_submit"):
			create_multiple("Sales Invoice", doc.name)

		if (
			not frappe.db.get_single_value("Healthcare Settings", "show_payment_popup")
			and frappe.db.get_single_value("Healthcare Settings", "enable_free_follow_ups")
			and doc.items
		):
			for item in doc.items:
				if item.reference_dt == "Patient Appointment":
					fee_validity = frappe.db.exists("Fee Validity", {"patient_appointment": item.reference_dn})
					if fee_validity:
						frappe.db.set_value("Fee Validity", fee_validity, "sales_invoice_ref", doc.name)

	if method == "on_cancel":
		if doc.items and (doc.additional_discount_percentage or doc.discount_amount):
			for item in doc.items:
				if (
					item.get("reference_dt")
					and item.get("reference_dn")
					and item.get("reference_dt") == "Patient Appointment"
				):
					frappe.db.set_value(
						item.get("reference_dt"),
						item.get("reference_dn"),
						{
							"paid_amount": item.amount,
							"ref_sales_invoice": None,
						},
					)


def set_invoiced(item, method, ref_invoice=None):
	invoiced = False
	if method == "on_submit":
		validate_invoiced_on_submit(item)
		invoiced = True

	if item.reference_dt == "Clinical Procedure":
		service_item = frappe.db.get_single_value(
			"Healthcare Settings", "clinical_procedure_consumable_item"
		)
		if service_item == item.item_code:
			frappe.db.set_value(item.reference_dt, item.reference_dn, "consumption_invoiced", invoiced)
		else:
			frappe.db.set_value(item.reference_dt, item.reference_dn, "invoiced", invoiced)
	else:
		if item.reference_dt not in ["Service Request", "Medication Request"]:
			frappe.db.set_value(item.reference_dt, item.reference_dn, "invoiced", invoiced)

	if item.reference_dt == "Patient Appointment":
		if frappe.db.get_value("Patient Appointment", item.reference_dn, "procedure_template"):
			dt_from_appointment = "Clinical Procedure"
		else:
			dt_from_appointment = "Patient Encounter"
		manage_doc_for_appointment(dt_from_appointment, item.reference_dn, invoiced)

	elif item.reference_dt == "Lab Prescription":
		manage_prescriptions(
			invoiced, item.reference_dt, item.reference_dn, "Lab Test", "lab_test_created"
		)

	elif item.reference_dt == "Procedure Prescription":
		manage_prescriptions(
			invoiced, item.reference_dt, item.reference_dn, "Clinical Procedure", "procedure_created"
		)
	elif item.reference_dt in ["Service Request", "Medication Request"]:
		# if order is invoiced, set both order and service transaction as invoiced
		hso = frappe.get_doc(item.reference_dt, item.reference_dn)
		if invoiced:
			hso.update_invoice_details(item.qty)
		else:
			hso.update_invoice_details(item.qty * -1)

		# service transaction linking to HSO
		if item.reference_dt == "Service Request":
			template_map = {
				"Clinical Procedure Template": "Clinical Procedure",
				"Therapy Type": "Therapy Session",
				"Lab Test Template": "Lab Test"
				# 'Healthcare Service Unit': 'Inpatient Occupancy'
			}


def validate_invoiced_on_submit(item):
	if item.reference_dt in ["Lab Prescription", "Procedure Prescription"]:
		if frappe.db.get_value(item.reference_dt, item.reference_dn, "invoiced"):
			frappe.throw(
				_("{0} {1} is already invoiced").format(item.reference_dt, item.reference_dn),
				ValidationError,
			)

	if item.reference_dt == "Patient Appointment":
		appointment_invoiced = frappe.db.get_value(item.reference_dt, item.reference_dn, "invoiced")
		if appointment_invoiced:
			service_unit = frappe.db.get_value(
				item.reference_dt, item.reference_dn, "service_unit"
			)
			frappe.throw(
				_("{0} {1} at Service Unit {2} is already invoiced").format(
					item.reference_dt, item.reference_dn, service_unit
				),
				ValidationError,
			)


def manage_doc_for_appointment(dt_from_appointment, appointment, invoiced):
	# if appointment is invoiced, create encounter/procedure
	# if invoice is cancelled, cancel encounter/procedure
	if dt_from_appointment:
		filters = {"appointment": appointment}
		# Note: There's no need for additional filters for Patient Encounter
		# as the appointment reference is sufficient
		if dt_from_appointment != "Patient Encounter":
			filters["procedure_created"] = 1

		created = frappe.db.get_value(dt_from_appointment, filters, "name")

		if invoiced and not created:
			if dt_from_appointment == "Patient Encounter":
				create_encounter(appointment)
			elif dt_from_appointment == "Clinical Procedure":
				create_procedure(appointment)
		elif not invoiced and created:
			frappe.get_doc(dt_from_appointment, created).cancel()


def manage_prescriptions(invoiced, ref_dt, ref_dn, dt, created_check_field):
	created = frappe.db.get_value(ref_dt, ref_dn, created_check_field)
	if created:
		frappe.db.set_value(
			dt, frappe.db.get_value(ref_dt, ref_dn, dt.lower().replace(" ", "_")), "invoiced", invoiced
		)


def create_sample_collection_and_observation(doc):
	for item in doc.items:
		if item.get("reference_dt") and item.get("reference_dn") and item.reference_dt == "Service Request":
			sr = frappe.get_doc("Service Request", item.reference_dn)
			if (
				sr.docstatus == 1
				and sr.template_dt == "Lab Test Template"
				and sr.sample_type
				and not frappe.db.exists("Sample Collection", {"service_request": sr.name})
			):
				sample_exist = frappe.db.exists(
					"Sample Collection", {"patient": sr.patient, "sample_type": sr.sample_type}
				)
				lt = frappe.db.exists("Lab Test", {"service_request": sr.name})
				if not sample_exist and not lt:
					try:
						sample = frappe.new_doc("Sample Collection")
						sample.patient = sr.patient
						sample.patient_age = sr.patient_age
						sample.patient_sex = sr.patient_sex
						sample.company = sr.company
						sample.service_request = sr.name
						sample.sample_type = sr.sample_type
						sample.save()
						sample.submit()
					except Exception:
						frappe.log_error(title=_("{0} Error").format("Sample Collection"))


def create_multiple(dt, dn):
	if dt == "Sales Invoice":
		create_lab_tests_from_invoice(dt, dn)


def create_lab_tests_from_invoice(dt, dn):
	from suma_health.healthcare.doctype.lab_test.lab_test import load_result_format

	sales_invoice = frappe.get_doc(dt, dn)
	for item in sales_invoice.items:
		# In ERPNext Healthcare, user has the ability to select Lab Test Template on Sales Invoice Item.
		# To identify whether the sales invoice item refers to lab test prescription or not, link Sales Invoice Item
		# and Lab Prescription is maintained.
		if item.reference_dt != "Lab Prescription":
			continue

		prescription = frappe.get_doc(item.reference_dt, item.reference_dn)
		# check if a lab test has already been linked with this prescription
		if prescription.lab_test_created == 1:
			# mark the sales invoice patient field if patient link missing
			if not sales_invoice.patient and prescription.get("patient"):
				patient = frappe.get_doc("Patient", prescription.get("patient"))
				sales_invoice.patient = patient.name
				sales_invoice.patient_name = patient.patient_name
				sales_invoice.save()
			continue

		template = frappe.get_doc("Lab Test Template", item.item_code)
		lab_test = create_lab_test_from_template(template, prescription, sales_invoice)
		lab_test.save()
		# save UOM and Qty
		if prescription.get("quantity") and prescription.get("test_uom"):
			lab_test.test_uom = prescription.get("test_uom")
			lab_test.quantity = prescription.get("quantity")

		# mark the sales invoice patient field if patient link missing
		if not sales_invoice.patient and lab_test.patient:
			sales_invoice.patient = lab_test.patient
			sales_invoice.patient_name = frappe.get_value("Patient", lab_test.patient, "patient_name")
			sales_invoice.save()

		frappe.db.set_value("Lab Prescription", item.reference_dn, "lab_test_created", 1)
		frappe.db.set_value("Lab Prescription", item.reference_dn, "lab_test", lab_test.name)


def create_lab_test_from_template(template, prescription, sales_invoice):
	from suma_health.healthcare.doctype.lab_test.lab_test import load_result_format

	lab_test = frappe.new_doc("Lab Test")
	lab_test.service_request = prescription.get("order_id")
	lab_test.patient = prescription.patient if prescription.get("patient") else sales_invoice.patient
	lab_test.consultant = prescription.practitioner if prescription.get("practitioner") else sales_invoice.ref_practitioner
	lab_test.company = prescription.company if prescription.get("company") else sales_invoice.company
	lab_test.department = template.department
	lab_test.employee = prescription.get("employee")
	lab_test.ref_doctype = "Sales Invoice"
	lab_test.ref_docname = sales_invoice.name
	lab_test.template = template.name
	lab_test.template_name = template.lab_test_name
	lab_test.test_group = template.lab_test_group
	lab_test = load_result_format(lab_test, template, prescription)

	if hasattr(template, "sample_type") and template.sample_type:
		sample_type = template.sample_type
		lab_test.sample = frappe.db.get_value(
			"Sample Collection",
			{
				"patient": lab_test.patient,
				"docstatus": 1,
				"sample_type": sample_type,
				"service_request": lab_test.service_request,
			},
			"name",
		)

	return lab_test
