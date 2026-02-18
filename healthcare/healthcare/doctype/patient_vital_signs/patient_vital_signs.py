# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class PatientVitalSigns(Document):
    def before_save(self):
        if self.height and self.weight:
            # Calculate BMI
            height_in_m = self.height / 100
            self.bmi = self.weight / (height_in_m * height_in_m)
