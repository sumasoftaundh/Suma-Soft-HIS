(() => {
  // ../healthcare/healthcare/public/js/patient_quick_entry.js
  frappe.provide("frappe.ui.form");
  frappe.ui.form.PatientQuickEntryForm = class PatientQuickEntryForm extends frappe.ui.form.QuickEntryForm {
    constructor(doctype, after_insert, init_callback, doc, force) {
      super(doctype, after_insert, init_callback, doc, force);
      this.skip_redirect_on_error = true;
    }
    render_dialog() {
      let custom_fields = this.mandatory.filter(
        (field) => !this.get_standard_fields().map((field2) => field2.fieldname).includes(field.fieldname)
      );
      this.mandatory = this.get_standard_fields();
      this.mandatory.splice(3, 0, ...custom_fields);
      super.render_dialog();
    }
    get_standard_fields() {
      return [
        {
          label: __("First Name"),
          fieldname: "first_name",
          fieldtype: "Data"
        },
        {
          label: __("Middle Name"),
          fieldname: "middle_name",
          fieldtype: "Data"
        },
        {
          label: __("last Name"),
          fieldname: "last_name",
          fieldtype: "Data"
        },
        {
          fieldtype: "Section Break",
          collapsible: 0
        },
        {
          label: __("Gender"),
          fieldname: "sex",
          fieldtype: "Link",
          options: "Gender"
        },
        {
          label: __("Blood Group"),
          fieldname: "blood_group",
          fieldtype: "Select",
          options: frappe.meta.get_docfield("Patient", "blood_group").options
        },
        {
          fieldtype: "Column Break"
        },
        {
          label: __("Birth Date"),
          fieldname: "dob",
          fieldtype: "Date"
        },
        {
          label: __("Identification Number (UID)"),
          fieldname: "uid",
          fieldtype: "Data"
        },
        {
          fieldtype: "Section Break",
          label: __("Primary Contact"),
          collapsible: 1
        },
        {
          label: __("Email Id"),
          fieldname: "email",
          fieldtype: "Data",
          options: "Email"
        },
        {
          label: __("Invite as User"),
          fieldname: "invite_user",
          fieldtype: "Check"
        },
        {
          fieldtype: "Column Break"
        },
        {
          label: __("Mobile Number"),
          fieldname: "mobile",
          fieldtype: "Data",
          options: "Phone"
        },
        {
          fieldtype: "Section Break",
          label: __("Primary Address"),
          collapsible: 1
        },
        {
          label: __("Address Line 1"),
          fieldname: "address_line1",
          fieldtype: "Data"
        },
        {
          label: __("Address Line 2"),
          fieldname: "address_line2",
          fieldtype: "Data"
        },
        {
          label: __("ZIP Code"),
          fieldname: "pincode",
          fieldtype: "Data"
        },
        {
          fieldtype: "Column Break"
        },
        {
          label: __("City"),
          fieldname: "city",
          fieldtype: "Data"
        },
        {
          label: __("State"),
          fieldname: "state",
          fieldtype: "Data"
        },
        {
          label: __("Country"),
          fieldname: "country",
          fieldtype: "Link",
          options: "Country"
        }
      ];
    }
  };

  // ../healthcare/healthcare/public/js/observation.js
  frappe.provide("healthcare");
  healthcare.Observation = class Observation {
    constructor(opts) {
      $.extend(this, opts);
    }
    refresh() {
      var me = this;
      this.notes_wrapper.find(".observation-section").remove();
      frappe.run_serially([
        () => frappe.call({
          method: "healthcare.healthcare.doctype.observation.observation.get_observation_details",
          args: {
            docname: me.frm.doc.name
          },
          freeze: true,
          callback: function(r) {
            let observation_details = r.message || [];
            let observation_html = frappe.render_template(
              "observation",
              {
                observation_details,
                create_observation: me.create_observation
              }
            );
            $(observation_html).appendTo(me.observation_wrapper);
          }
        }),
        () => {
          me.add_observations();
          $(".observations").find(".edit-observation-btn").on("click", function() {
            me.edit_observation(this);
          });
          document.getElementById("result-text").onchange = function() {
            me.frm.dirty();
          };
          $(".observations").find(".result-text").change(function() {
            me.frm.dirty();
          });
        }
      ]);
    }
    add_observations() {
      let me = this;
      let _add_observations = () => {
        var d = new frappe.ui.Dialog({
          title: __("Add Observation"),
          fields: [
            {
              "label": "Observation Template",
              "fieldname": "observation_template",
              "fieldtype": "Link",
              "options": "Observation Template",
              "reqd": 1
            },
            {
              "label": "Permitted Data Type",
              "fieldname": "permitted_data_type",
              "fieldtype": "Data",
              "read_only": 1
            },
            {
              "label": "Result Text",
              "fieldname": "result_text",
              "fieldtype": "Text Editor",
              "depends_on": "eval:doc.permitted_data_type=='Text'"
            },
            {
              "label": "Result Float",
              "fieldname": "result_float",
              "fieldtype": "Float",
              "depends_on": "eval:['Quantity', 'Numeric'].includes(doc.permitted_data_type)"
            },
            {
              "label": "Result Data",
              "fieldname": "result_data",
              "fieldtype": "Data",
              "depends_on": "eval:['Range', 'Ratio'].includes(doc.permitted_data_type)"
            }
          ],
          primary_action: function() {
            var data = d.get_values();
            var result = "";
            if (["Range", "Ratio"].includes(data.permitted_data_type)) {
              result = data.result_data;
            } else if (["Quantity", "Numeric"].includes(data.permitted_data_type)) {
              result = data.result_float;
            } else if (data.permitted_data_type == "Text") {
              result = data.result_text;
            }
            frappe.call({
              method: "healthcare.healthcare.doctype.observation.observation.add_observation",
              args: {
                patient: me.frm.doc.patient,
                template: data.observation_template,
                data_type: data.permitted_data_type || "",
                result,
                doc: me.frm.doc.doctype,
                docname: me.frm.doc.name
              },
              freeze: true,
              callback: function(r) {
                if (!r.exc) {
                  me.refresh();
                }
                d.hide();
              }
            });
          },
          primary_action_label: __("Add Observation")
        });
        d.fields_dict["observation_template"].df.onchange = () => {
          if (d.get_value("observation_template")) {
            frappe.db.get_value("Observation Template", { "name": d.get_value("observation_template") }, ["permitted_data_type", "has_component"], (r) => {
              if (r.permitted_data_type && !r.has_component) {
                d.set_value("permitted_data_type", r.permitted_data_type);
              }
            });
          }
        };
        d.show();
      };
      $(".new-observation-btn").click(_add_observations);
    }
    edit_observation(edit_btn) {
      var me = this;
      let row = $(edit_btn).closest(".observation");
      let observation_name = row.attr("name");
      let permitted_data_type = row.attr("addatatype");
      let result = $(row).find(".result-content").html().trim();
      var d = new frappe.ui.Dialog({
        title: __("Edit Observation"),
        fields: [
          {
            "label": "Observation",
            "fieldname": "observation",
            "fieldtype": "Link",
            "options": "Observation",
            "default": observation_name,
            "read_only": 1
          },
          {
            "label": "Permitted Data Type",
            "fieldname": "permitted_data_type",
            "fieldtype": "Data",
            "read_only": 1,
            "default": permitted_data_type
          },
          {
            "label": "Result Text",
            "fieldname": "result_text",
            "fieldtype": "Text Editor",
            "depends_on": "eval:doc.permitted_data_type=='Text'",
            "default": result
          },
          {
            "label": "Result Float",
            "fieldname": "result_float",
            "fieldtype": "Float",
            "depends_on": "eval:['Quantity', 'Numeric'].includes(doc.permitted_data_type)",
            "default": result
          },
          {
            "label": "Result Data",
            "fieldname": "result_data",
            "fieldtype": "Data",
            "depends_on": "eval:['Range', 'Ratio'].includes(doc.permitted_data_type)",
            "default": result
          }
        ],
        primary_action: function() {
          var data = d.get_values();
          var result2 = "";
          if (["Range", "Ratio"].includes(data.permitted_data_type)) {
            result2 = data.result_data;
          } else if (["Quantity", "Numeric"].includes(data.permitted_data_type)) {
            result2 = data.result_float;
          } else if (data.permitted_data_type == "Text") {
            result2 = data.result_text;
          }
          frappe.call({
            method: "healthcare.healthcare.doctype.observation.observation.edit_observation",
            args: {
              observation: data.observation,
              data_type: data.permitted_data_type || "",
              result: result2
            },
            freeze: true,
            callback: function(r) {
              if (!r.exc) {
                me.refresh();
                d.hide();
              }
            }
          });
        },
        primary_action_label: __("Edit")
      });
      d.show();
    }
  };

  // frappe-html:/home/devuser/sumasoft-bench/apps/healthcare/healthcare/public/js/observation.html
  frappe.templates["observation"] = `<div class="observation-section">
	<div class="new-btn pb-3">
		<span>
			<button class="btn btn-sm small new-observation-btn mr-1">
				<svg class="icon icon-sm">
					<use href="#icon-add"></use>
				</svg>
				{{ __("New Observation") }}
			</button>
		</span>
	</div>
	<div class="observation-details row" style="width: 100%; color:rgb(169, 169, 169); padding-left: 35px;">
		<div style="width: 20%;">
			{{ __("Observation") }}
		</div>
		<div style="width: 19%;">
			{{ __("Date Time") }}
		</div>
		<div style="padding-left:30px; padding-right:10px; width: 20%;">
			{{ __("Result") }}
		</div>
		<div style="width: 7%;">
			{{ __("UOM") }}
		</div>
		<div style="width: 20%;">
			{{ __("Method") }}
		</div>
		<div style="width: 10%;">
			{{ __("Reference Range") }}
		</div>
	</div>
	<div class="section-body">
		<div class="observations pr-1">
			{% if (observation_details && observation_details.length) { %}
				{% for(var i=0, l=observation_details.length; i<l; i++) { %}
					{% if (observation_details[i].observation || observation_details[i].template_reference) { %}
						<div class="observation" style="width: 100%;" name="{{ observation_details[i].observation.name }}" addatatype="{{ observation_details[i].observation.permitted_data_type }}">
							<div class="observation-details row">
								<div style="width: 20%;">
									<a href="/app/observation/{{ observation_details[i].observation.name }}" title="{{ __('Observation') }}">
										{% if (observation_details[i].template_reference.preferred_display_name) { %}
											{%= observation_details[i].template_reference.preferred_display_name %}
										{% } else { %}
											{%= observation_details[i].observation.observation_template %}
										{% } %}
									</a>
								</div>
								<div style="width: 19%;">
									{% if (observation_details[i].observation.posting_datetime) { %}
										{{ frappe.datetime.global_date_format(observation_details[i].observation.posting_datetime) }}
									{% } %}
								</div>
								<div class="result" style="width: 20%;">
									{% if( ['Range', 'Ratio'].includes(observation_details[i].observation.permitted_data_type)) { %}
										<div class="text-muted  ml-1 result-content">
											<input type="text" id="result-text" name="fname" size="6" value="">
											{%= observation_details[i].observation.result_data %}
									{% } else if (['Quantity', 'Numeric'].includes(observation_details[i].observation.permitted_data_type)) { %}
										<div class="text-muted ml-1 result-content">
											<input type="text" id="result-text" name="fname" size="6" value="">
											{%= observation_details[i].observation.result_float %}

									{% } else if (observation_details[i].observation.permitted_data_type=='Text') { %}
										<div class="text-muted ml-1 result-content">
											<input type="text" id="result-text" name="fname" size="6" value="">
											{%= observation_details[i].observation.result_text %}
									{% } %}
									</div>
								</div>
								<div style="width: 7%;">
									{% if (observation_details[i].template_reference) { %}
										{%= observation_details[i].template_reference.permitted_unit %}
									{% } %}
								</div>
								<div style="width: 20%;">
									{% if (observation_details[i].template_reference) { %}
										{%= observation_details[i].template_reference.method %}
									{% } %}
								</div>
								<div style="width: 10%;">
									{% if (observation_details[i].template_reference) { %}
										{{observation_details[i].template_reference.normal_from}}-{{observation_details[i].template_reference.normal_to}}
									{% } %}
								</div>
								<div style="width: 1%;">
									<span class="edit-observation-btn btn btn-link">
										<svg class="icon icon-sm"><use xlink:href="#icon-edit"></use></svg>
									</span>
								</div>
					</div>
				</div>
					{% } else { %}
					{% for (let key in observation_details[i]) { %}
					<div class="grouped-obs">
							<div class="flex justify-between" style="padding-bottom: 10px;">
									<b>
										<a href="/app/observation/{{ key.split('|')[1] }}" title="{{ __('Grouped Observations') }}">
											{%= key.split("|")[0] %}
										</a>
									</b>
							</div>
							{% for(var j=0, k=observation_details[i][key].length; j<k; j++) { %}
								{% if (observation_details[i][key][j].observation || observation_details[i][key][j].template_reference) { %}
									<div class="observation" name="{{ observation_details[i][key][j].observation.name }}" addatatype="{{ observation_details[i][key][j].observation.permitted_data_type }}">
										<div class="observation-details row" style="width: 100%;">
											<div style="width: 20%;">
												<a href="/app/observation/{{ observation_details[i][key][j].observation.name }}" title="{{ __('Observation') }}">
													{% if (observation_details[i][key][j].template_reference.preferred_display_name) { %}
														{%= observation_details[i][key][j].template_reference.preferred_display_name %}
													{% } else { %}
														{%= observation_details[i][key][j].observation.observation_template %}
													{% } %}
												</a>
											</div>
											<div style="width: 19%;">
												{% if (observation_details[i][key][j].observation.posting_datetime) { %}
													{{ frappe.datetime.global_date_format(observation_details[i][key][j].observation.posting_datetime) }}
												{% } %}
											</div>
											<div class="result" style="padding-left:30px; padding-right:10px; width: 23%;">
												{% if( ['Range', 'Ratio'].includes(observation_details[i][key][j].observation.permitted_data_type)) { %}
													<div class="text-muted  ml-1 result-content">
														<input class="result-text" type="text" id="result-text" name="fname" size="6" value="">
														{%= observation_details[i][key][j].observation.result_data %}
												{% } else if (['Quantity', 'Numeric'].includes(observation_details[i][key][j].observation.permitted_data_type)) { %}
													<div class="text-muted ml-1 result-content">
														<input class="result-text" type="text" id="result-text" name="fname" size="6" value="">
														{%= observation_details[i][key][j].observation.result_float %}
												{% } else if (observation_details[i][key][j].observation.permitted_data_type=='Text') { %}
													<div class="text-muted ml-1 result-content">
														<input class="result-text" type="text" id="result-text" name="fname" size="6" value="">
														{%= observation_details[i][key][j].observation.result_text %}
												{% } %}
												</div>
											</div>
											<div style="width: 7%;">
												{% if (observation_details[i][key][j].template_reference) { %}
													{%= observation_details[i][key][j].template_reference.permitted_unit %}
												{% } %}
											</div>
											<div style="width: 20%;">
												{% if (observation_details[i][key][j].template_reference) { %}
													{%= observation_details[i][key][j].template_reference.method %}
												{% } %}
											</div>
											<div style="width: 10%;">
												{% if (observation_details[i][key][j].template_reference) { %}
													{{observation_details[i][key][j].template_reference.normal_from}}-{{observation_details[i][key][j].template_reference.normal_to}}
												{% } %}
											</div>
											<div style="width: 1%;">
												<span class="edit-observation-btn btn btn-link">
													<svg class="icon icon-sm"><use xlink:href="#icon-edit"></use></svg>
												</span>
											</div>
									</div>
								</div>
								{% } %}
							{% } %}
							</div>
					{% } %}
					{% } %}
			    {% } %}
            {% } else { %}
			<div class="no-obs text-muted">
                    {{ __("No Observations") }}
                </div>
		    {% } %}
		</div>
	</div>
</div>
	</div>
</div>
</div>
</div>


<style>
.observation-section {
	min-height: 50px;
	padding-left: 0px;
	padding-bottom: 15px !important;
}

.observation-section .new-btn {
	text-align: right;
}

.observation {
	min-height: 90px;
	border: 1px solid var(--border-color);
	padding-right: 0;
	font-size: 11px;
	padding-left: 15px;
	padding-top: 35px;
	margin-bottom: 25px;
	border-radius: 10px;
}

.grouped-obs {
	border: 1px solid var(--border-color);
	padding-right: 15px;
	font-size: 11px;
	padding-left: 15px;
	padding-top: 15px;
	margin-bottom: 25px;
	border-radius: 10px;
}

.single-activity:last-child {
	border-bottom: 1px solid var(--border-color);
}

.checkbox {
	min-width: 22px;
}

.observations {
	width: 100%;
}

.observations:first-child {
	border-right: 0;
}

.no-obs {
    text-align: center;
    padding: 30px;
}

.form-footer {
	background-color: var(--bg-color);
}

.observation-details {
	padding-left: 14px;
	padding-right: 14px;
}


</style>`;

  // ../healthcare/healthcare/public/js/diagnostic_report_controller.js
  frappe.provide("healthcare.Diagnostic.DiagnosticReport");
  healthcare.Diagnostic.DiagnosticReport = class DiagnosticReport {
    constructor(opts) {
      $.extend(this, opts);
    }
    refresh() {
      var me = this;
      this.ObservationWidgets = [];
      frappe.call({
        method: "healthcare.healthcare.doctype.observation.observation.get_observation_details",
        args: {
          docname: me.frm.doc.name
        },
        freeze: true,
        callback: function(r) {
          me.create_widget(r);
          let new_ob_list = [];
          const inputContainer = document.querySelectorAll(".input-with-feedback");
          for (let i = 0; i < inputContainer.length; i++) {
            new_ob_list.push(inputContainer[i]);
          }
          document.addEventListener("keydown", function(event) {
            const focusedElement = document.activeElement;
            let current_index = 0;
            let next_index = 0;
            for (let key in new_ob_list) {
              if (new_ob_list.hasOwnProperty(key) && new_ob_list.includes(focusedElement)) {
                current_index = new_ob_list.indexOf(focusedElement);
              }
            }
            if (["ArrowDown", "Enter"].includes(event.key)) {
              next_index = current_index + 1;
            } else if (event.key === "ArrowUp") {
              next_index = current_index - 1;
            }
            if (new_ob_list[next_index]) {
              new_ob_list[next_index].focus();
            }
          });
        }
      });
      me.save_action("load");
    }
    create_widget(r) {
      var me = this;
      if (r && r.message[0]) {
        this.result = [];
        for (let key in r.message[0]) {
          me.ObservationWidgets[key] = new healthcare.ObservationWidget({
            wrapper: me.observation_wrapper,
            data: r.message[0][key],
            frm: me.frm,
            result: this.result
          });
        }
      }
    }
    save_action(func) {
      var me = this;
      if (func == "save") {
        frappe.call({
          method: "healthcare.healthcare.doctype.observation.observation.record_observation_result",
          args: {
            values: this.result
          },
          freeze: true,
          callback: function(r) {
          }
        });
      }
    }
  };

  // ../healthcare/healthcare/public/js/observation_widget.js
  frappe.provide("healthcare.ObservationWidget");
  healthcare.ObservationWidget = class {
    constructor(opts) {
      $.extend(this, opts);
      this.init_widget();
    }
    init_widget() {
      var me = this;
      if (me.data.has_component || me.data.has_component == "true") {
        if (!me.wrapper.find(`.${me.data.observation}`).length == 0) {
          return;
        }
        let grouped_html = `<div class="${me.data.observation} grouped-obs"
					style="
						border: 1px solid var(--border-color);
						padding-right: 0;
						font-size: 11px;
						padding-left: 15px;
						padding-top: 5px;
						padding-bottom: 5px;
						margin-bottom: 3px;
						border-radius: 10px;
						background-color:var(--bg-color);">
						<b>
						<a href="/app/observation/${me.data.observation}">
							${me.data.display_name}
						</a>
						</b></div>`;
        me.wrapper.append(grouped_html);
        let component_wrapper = me.wrapper.find(`.${me.data.observation}`);
        for (var j = 0, k = me.data[me.data.observation].length; j < k; j++) {
          var obs_data = me.data[me.data.observation][j].observation;
          component_wrapper.append(`<div class="observations-${obs_data.name} observs"
						style="border: 1px solid var(--border-color);
						padding-right: 0;
						font-size: 11px;
						padding-left: 15px;
						margin-right: 15px;
						padding-bottom: 5px;
						margin-bottom: 3px;
						border-radius: var(--border-radius-md);
						background-color: var(--fg-color);
						box-shadow: var(--card-shadow);"
						value=${obs_data.name}>
					</div>`);
          me.init_field_group(obs_data, component_wrapper.find(`.observations-${obs_data.name}`));
        }
      } else {
        if (!me.wrapper.find(`.observations-${me.data.observation.name}`).length == 0) {
          return;
        }
        me.wrapper.append(
          `<div class="grouped-obs"
					style="me.data.observation
						border: 1px solid var(--border-color);
						padding-right: 0;
						font-size: 11px;
						padding-left: 15px;
						padding-top: 5px;
						padding-bottom: 5px;
						margin-bottom: 3px;
						border-radius: 10px;
						background-color:var(--bg-color);">
					<div class="observations-${me.data.observation.name} observs"
						style="border: 1px solid var(--border-color);
						padding-right: 0;
						font-size: 11px;
						padding-left: 15px;
						margin-right: 15px;
						border-radius: var(--border-radius-md);
						background-color: var(--fg-color);
						box-shadow: var(--card-shadow);"
						value=${me.data.observation.name}>
					</div>
				</div>`
        );
        if (me.data.observation.name) {
          var obs_data = me.data.observation;
          me.init_field_group(obs_data, me.wrapper.find(`.observations-${me.data.observation.name}`));
          me.$widget = me.wrapper.find(`.grouped-obs`);
        }
      }
      me.$widget = me.wrapper.find(`.grouped-obs`);
    }
    init_field_group(obs_data, wrapper) {
      var me = this;
      var default_input = "";
      if (["Range", "Ratio", "Quantity", "Numeric"].includes(obs_data.permitted_data_type)) {
        default_input = obs_data.result_data;
      } else if (obs_data.permitted_data_type == "Text") {
        default_input = trim_html(obs_data.result_text);
      }
      let fieldtype = "Data";
      let options = "";
      if (obs_data.permitted_data_type == "Select") {
        fieldtype = "Select";
        options = obs_data.options;
        default_input = obs_data.result_select;
      }
      me[obs_data.name] = new frappe.ui.FieldGroup({
        fields: [
          {
            fieldtype: "Section Break"
          },
          {
            fieldname: "observation",
            fieldtype: "HTML"
          },
          {
            fieldname: "note_button",
            fieldtype: "HTML"
          },
          {
            "fieldtype": "Column Break"
          },
          {
            fieldname: "specimen",
            fieldtype: "HTML"
          },
          {
            "fieldtype": "Column Break"
          },
          {
            fieldname: "result",
            fieldtype,
            options,
            read_only: 1 ? obs_data.status == "Approved" : 0,
            change: (s) => {
              me.frm.dirty();
              me.set_result_n_name(obs_data.name);
            },
            default: default_input,
            hidden: 1 ? obs_data.observation_category == "Imaging" : 0
          },
          {
            fieldname: "result_date",
            fieldtype: "HTML",
            hidden: 1 ? obs_data.observation_category == "Imaging" : 0
          },
          {
            "fieldtype": "Column Break"
          },
          {
            fieldname: "unit",
            fieldtype: "HTML"
          },
          {
            fieldname: "method",
            fieldtype: "HTML"
          },
          {
            "fieldtype": "Column Break"
          },
          {
            fieldname: "reference",
            fieldtype: "HTML"
          },
          {
            "fieldtype": "Column Break"
          },
          {
            fieldname: "auth_btn",
            fieldtype: "HTML"
          },
          {
            fieldtype: "Section Break"
          },
          {
            fieldname: "note_text",
            fieldtype: "Text",
            read_only: 1
          },
          {
            fieldtype: "Section Break",
            hidden: 1 ? obs_data.observation_category != "Imaging" : 0
          },
          {
            label: __("Findings"),
            fieldname: "findings",
            fieldtype: "Button",
            click: () => me.add_finding_interpretation(obs_data, "Findings")
          },
          {
            fieldname: "findings_text",
            fieldtype: "Text",
            read_only: 1
          },
          {
            "fieldtype": "Column Break"
          },
          {
            label: __("Interpretation"),
            fieldname: "interpretation",
            fieldtype: "Button",
            click: () => me.add_finding_interpretation(obs_data, "Interpretation")
          },
          {
            fieldname: "result_interpretation",
            fieldtype: "Text",
            read_only: 1
          }
        ],
        body: wrapper
      });
      me[obs_data.name].make();
      me.set_values(this, obs_data);
    }
    set_values(th, obs_data) {
      var me = this;
      let name_html = `<div class="observation-name obs-field" style="font-size:10px; padding-top:20px;" value="{{observation_details.observation.name}}">
			<a href="/app/observation/${obs_data.name}" title="${obs_data.name}">`;
      if (obs_data.preferred_display_name) {
        name_html += obs_data.preferred_display_name;
      } else {
        name_html += obs_data.observation_template;
      }
      name_html += `</a>
		<div>`;
      me[obs_data.name].get_field("observation").html(name_html);
      let specimen_html = `<div class="text-muted" style="font-size:10px; padding-top:20px;">`;
      if (obs_data.specimen) {
        specimen_html += `<a href="/app/specimen/{{ observation_details.observation.specimen }}" title="{{ observation_details.observation.specimen }}">`;
        specimen_html += obs_data.specimen + "</a>";
      }
      specimen_html += `</div>
			<div class="text-muted" style="font-size: 8px;">`;
      if (obs_data.received_time) {
        specimen_html += frappe.datetime.global_date_format(obs_data.received_time);
      }
      specimen_html += `</div>`;
      me[obs_data.name].get_field("specimen").html(specimen_html);
      let result_date_html = `<div class="text-muted" style="font-size:8px; margin-top:-12px;">${obs_data.time_of_result ? frappe.datetime.global_date_format(obs_data.time_of_result) : ""}</div>`;
      me[obs_data.name].get_field("result_date").html(result_date_html);
      let method_html = `<div style="display:flex"><div style="font-size:10px; padding-top:20px; padding-right:45px; width:10%;">${obs_data.permitted_unit ? obs_data.permitted_unit : ""}</div>`;
      method_html += `<div class="text-muted" style="font-size:10px; padding-top:20px;">`;
      if (obs_data.method) {
        method_html += `${obs_data.method}`;
      }
      method_html += `</div></div>`;
      me[obs_data.name].get_field("unit").html(method_html);
      let reference_html = `<div style="display:flex;"><div class="text-muted" style="font-size:10px; padding-top:20px;">`;
      if (obs_data.reference) {
        reference_html += `${obs_data.reference}`;
      }
      reference_html += `</div>`;
      me[obs_data.name].get_field("reference").html(reference_html);
      let auth_html = "";
      if (!["Approved"].includes(obs_data.status)) {
        auth_html += `<div style="float:right;">
				<button class="btn btn-xs btn-secondary small" id="authorise-observation-btn-${obs_data.name}">
				<span style="font-size:10px;">Approve</span>
				</button>`;
        auth_html += `</div></div>`;
        me[obs_data.name].get_field("auth_btn").html(auth_html);
        var authbutton = document.getElementById(`authorise-observation-btn-${obs_data.name}`);
        authbutton.addEventListener("click", function() {
          me.auth_observation(obs_data.name, "Approved");
        });
      } else if (obs_data.status == "Approved") {
        auth_html += `<div style="float:right;">
				<button class="btn btn-xs btn-del btn-secondary small" id="unauthorise-observation-btn-${obs_data.name}">
				<span class="btn-observ" style="font-size:10px;">Disapprove</span>
				</button>`;
        auth_html += `</div></div>`;
        me[obs_data.name].get_field("auth_btn").html(auth_html);
        var authbutton = document.getElementById(`unauthorise-observation-btn-${obs_data.name}`);
        authbutton.addEventListener("click", function() {
          me.auth_observation(obs_data.name, "Disapproved");
        });
      }
      let note_html = `<div><span class="add-note-observation-btn btn btn-link"
			id="add-note-observation-btn-${obs_data.name}">
			<svg class="icon icon-sm"><use xlink:href="#icon-small-message"></use></svg>
			</span>`;
      note_html += `</div>`;
      me[obs_data.name].get_field("note_button").html(note_html);
      var myButton = document.getElementById(`add-note-observation-btn-${obs_data.name}`);
      myButton.addEventListener("click", function() {
        me.add_note(obs_data.name, obs_data.note);
      });
      if (obs_data.note) {
        me[obs_data.name].set_value("note_text", obs_data.note);
      }
      if (obs_data.observation_category == "Imaging") {
        me[obs_data.name].set_value("findings_text", obs_data.result_text);
        me[obs_data.name].set_value("result_interpretation", obs_data.result_interpretation);
      }
    }
    set_result_n_name(observation) {
      var me = this;
      let dialog_values = me[observation].get_values();
      dialog_values["observation"] = observation;
      let valuexists = me.result.some((dict) => dict.observation === observation);
      for (var res of me.result) {
        if (observation == res.observation) {
          res["result"] = dialog_values.result;
        }
      }
      if (!valuexists) {
        me.result.push(dialog_values);
      }
    }
    add_note(observation, note) {
      var me = this;
      let observation_name = observation;
      let note_text = me[observation].get_value("note_text") || note;
      var d = new frappe.ui.Dialog({
        title: __("Add Note"),
        static: true,
        fields: [
          {
            "label": __("Observation"),
            "fieldname": "observation",
            "fieldtype": "Link",
            "options": "Observation",
            "default": observation_name,
            "hidden": 1
          },
          {
            "label": __("Note"),
            "fieldname": "note",
            "fieldtype": "Text Editor",
            "default": note_text
          }
        ],
        primary_action: function() {
          me.frm.dirty();
          var data = d.get_values();
          me[observation].set_value("note_text", data.note);
          if (me.result.length > 0) {
            me.result.forEach(function(res) {
              if (res.observation == observation) {
                res["note"] = data.note;
              }
            });
          } else {
            me.result.push({ "observation": observation, "note": data.note });
          }
          d.hide();
        },
        primary_action_label: __("Add Note")
      });
      d.show();
      d.get_close_btn().show();
    }
    auth_observation(observation, status) {
      var me = this;
      if (status == "Approved") {
        frappe.confirm(__("Are you sure you want to authorise Observation <b>" + observation + "</b>"), function() {
          frappe.call({
            method: "healthcare.healthcare.doctype.observation.observation.set_observation_status",
            args: {
              observation,
              status
            },
            callback: function(r) {
              me.frm.reload_doc();
            }
          });
        });
      } else if (status == "Disapproved") {
        var d = new frappe.ui.Dialog({
          title: __("Reason For Disapproval"),
          fields: [
            {
              "label": __("Reason"),
              "fieldname": "unauthorisation_reason",
              "fieldtype": "Text",
              reqd: 1
            }
          ],
          primary_action: function() {
            var data = d.get_values();
            frappe.call({
              method: "healthcare.healthcare.doctype.observation.observation.set_observation_status",
              args: {
                observation,
                status,
                reason: data.unauthorisation_reason
              },
              freeze: true,
              callback: function(r) {
                if (!r.exc) {
                  me.frm.reload_doc();
                }
                d.hide();
              }
            });
          },
          primary_action_label: __("Disapprove")
        });
        d.show();
      }
    }
    add_finding_interpretation(obs_data, type) {
      var me = this;
      let template = "";
      let note = "";
      if (type == "Findings") {
        template = obs_data.result_template;
        note = me[obs_data.name].get_value("result_text") || obs_data.result_text;
      } else if (type == "Interpretation") {
        template = obs_data.interpretation_template;
        note = me[obs_data.name].get_value("result_interpretation") || obs_data.result_interpretation;
      }
      var d = new frappe.ui.Dialog({
        title: __(type),
        static: true,
        fields: [
          {
            "label": "Observation",
            "fieldname": "observation",
            "fieldtype": "Link",
            "options": "Observation",
            "default": obs_data.name,
            "hidden": 1
          },
          {
            "label": "Template",
            "fieldname": "template",
            "fieldtype": "Link",
            "options": "Terms and Conditions",
            "default": template
          },
          {
            "label": "Note",
            "fieldname": "note",
            "fieldtype": "Text Editor",
            "default": note
          }
        ],
        primary_action: function() {
          me.frm.dirty();
          var data = d.get_values();
          let val_dict = {};
          var values = [];
          val_dict["observation"] = obs_data.name;
          val_dict["result"] = "";
          if (type == "Findings") {
            val_dict["result"] = data.note;
            me[obs_data.name].set_value("findings_text", data.note);
          } else if (type == "Interpretation") {
            val_dict["interpretation"] = data.note;
            me[obs_data.name].set_value("result_interpretation", data.note);
          }
          d.hide();
          values.push(val_dict);
          me.result.push(val_dict);
        },
        primary_action_label: __("Add")
      });
      if ((!note || note == "") && d.get_values("template")) {
        set_text_to_dialog(d);
      }
      d.fields_dict["template"].df.onchange = () => {
        const regex = /<p>(.*?)<\/p>/;
        const match = d.get_value("note").match(regex);
        const result_value = match ? match[1] : null;
        if (d.get_value("template") && (!result_value || result_value == "<br>")) {
          set_text_to_dialog(d);
        }
      };
      d.show();
      d.get_close_btn().show();
    }
  };
  var trim_html = function(text_result) {
    if (text_result && text_result.includes("</div>")) {
      var tempElement = document.createElement("div");
      tempElement.innerHTML = text_result;
      var paragraphElement = tempElement.querySelector("p");
      return paragraphElement.textContent;
    } else {
      return text_result;
    }
  };
  var set_text_to_dialog = function(d) {
    if (d.get_value("template")) {
      frappe.call({
        method: "healthcare.healthcare.doctype.observation.observation.get_observation_result_template",
        args: {
          template_name: d.get_value("template"),
          observation: d.get_value("observation")
        },
        callback: function(r) {
          d.set_value("note", r.message);
        }
      });
    }
  };

  // ../healthcare/healthcare/public/js/healthcare_note.js
  frappe.provide("healthcare");
  healthcare.ClinicalNotes = class ClinicalNotes {
    constructor(opts) {
      $.extend(this, opts);
    }
    refresh() {
      var me = this;
      this.notes_wrapper.find(".clinical-notes-section").remove();
      frappe.run_serially([
        () => frappe.call({
          method: "get_clinical_notes",
          doc: me.frm.doc,
          args: {
            patient: me.frm.doc.patient
          },
          freeze: true,
          callback: function(r) {
            let clinical_notes = r.message || [];
            let clinical_notes_html = frappe.render_template(
              "healthcare_note",
              {
                clinical_notes
              }
            );
            $(clinical_notes_html).appendTo(me.notes_wrapper);
          }
        }),
        () => {
          me.add_clinical_note();
          $(".clinical-notes-section").find(".edit-note-btn").on("click", function() {
            me.edit_clinical_note(this);
          });
          $(".clinical-notes-section").find(".delete-note-btn").on("click", function() {
            me.delete_clinical_note(this);
          });
        }
      ]);
    }
    add_clinical_note() {
      let me = this;
      let _add_clinical_note = () => {
        var d = new frappe.ui.Dialog({
          title: __("Add Clinical Note"),
          fields: [
            {
              "label": "Clinical Note Type",
              "fieldname": "note_type",
              "fieldtype": "Link",
              "options": "Clinical Note Type"
            },
            {
              "label": "Note",
              "fieldname": "note",
              "fieldtype": "Text Editor",
              "reqd": 1,
              "enable_mentions": true
            }
          ],
          primary_action: function() {
            var data = d.get_values();
            frappe.call({
              method: "add_clinical_note",
              doc: me.frm.doc,
              args: {
                note: data.note,
                note_type: data.note_type
              },
              freeze: true,
              callback: function(r) {
                if (!r.exc) {
                  me.refresh();
                }
                d.hide();
              }
            });
          },
          primary_action_label: __("Add")
        });
        d.show();
      };
      $(".new-note-btn").click(_add_clinical_note);
    }
    edit_clinical_note(edit_btn) {
      var me = this;
      let row = $(edit_btn).closest(".comment-content");
      let note_name = row.attr("name");
      let note_type = $(row).find(".note-type").html().trim();
      let row_content = $(row).find(".content").html();
      var d = new frappe.ui.Dialog({
        title: __("Edit Clinical Note"),
        fields: [
          {
            "label": "Clinical Note Type",
            "fieldname": "note_type",
            "fieldtype": "Link",
            "options": "Clinical Note Type",
            "default": note_type
          },
          {
            "label": "Note",
            "fieldname": "note",
            "fieldtype": "Text Editor",
            "default": row_content
          }
        ],
        primary_action: function() {
          var data = d.get_values();
          frappe.call({
            method: "edit_clinical_note",
            doc: me.frm.doc,
            args: {
              note: data.note,
              note_name
            },
            freeze: true,
            callback: function(r) {
              if (!r.exc) {
                me.refresh();
                d.hide();
              }
            }
          });
        },
        primary_action_label: __("Done")
      });
      d.show();
    }
    delete_clinical_note(delete_btn) {
      var me = this;
      let note_name = $(delete_btn).closest(".comment-content").attr("name");
      frappe.confirm(
        "Are you sure you want to proceed?",
        () => {
          frappe.call({
            method: "delete_clinical_note",
            doc: me.frm.doc,
            args: {
              note_name
            },
            freeze: true,
            callback: function(r) {
              if (!r.exc) {
                me.refresh();
              }
            }
          });
        }
      );
    }
  };
  healthcare.Orders = class Orders {
    constructor(opts) {
      $.extend(this, opts);
    }
    refresh() {
      var me = this;
      $(this.open_activities_wrapper).empty();
      let cur_form_footer = this.form_wrapper.find(".form-footer");
      frappe.call({
        method: "healthcare.healthcare.doctype.patient_encounter.patient_encounter.get_encounter_details",
        args: {
          "doc": me.frm.doc
        },
        callback: (r) => {
          if (!r.exc) {
            var activities_html = frappe.render_template("healthcare_orders", {
              service_requests: r.message[1],
              medication_requests: r.message[0],
              status_code_map: r.message[3],
              create_orders: me.create_orders,
              show_encounter: this.show_encounter
            });
            $(activities_html).appendTo(me.open_activities_wrapper);
            $(".service-request").find(".service-request-onhold").on("click", function() {
              me.update_status(this, "Service Request", "On Hold");
            });
            $(".service-request").find(".service-request-active").on("click", function() {
              me.update_status(this, "Service Request", "Active");
            });
            $(".service-request").find(".order-cancel").on("click", function() {
              me.update_status(this, "Service Request", "Cancel");
            });
            $(".service-request").find(".service-request-replace").on("click", function() {
              me.update_status(this, "Service Request", "Replaced");
            });
            $(".medication-request").find(".service-request-onhold").on("click", function() {
              me.update_status(this, "Medication Request", "On Hold");
            });
            $(".medication-request").find(".service-request-active").on("click", function() {
              me.update_status(this, "Medication Request", "Active");
            });
            $(".medication-request").find(".order-cancel").on("click", function() {
              me.update_status(this, "Medication Request", "Cancel");
            });
            $(".medication-request").find(".service-request-replace").on("click", function() {
              me.update_status(this, "Medication Request", "Replaced");
              me.create_medication_request();
            });
            me.create_service_request();
            me.create_medication_request();
          }
        }
      });
    }
    create_service_request() {
      let me = this;
      let _create_service_request = () => {
        var d = new frappe.ui.Dialog({
          title: __("Create Service Request"),
          fields: [
            {
              "label": "Order Template Type",
              "fieldname": "order_template_type",
              "fieldtype": "Link",
              "options": "DocType",
              "reqd": 1,
              get_query: () => {
                let order_template_doctypes = [
                  "Therapy Type",
                  "Lab Test Template",
                  "Clinical Procedure Template",
                  "Observation Template"
                ];
                return {
                  filters: {
                    name: ["in", order_template_doctypes]
                  }
                };
              }
            },
            {
              "label": "Order Template",
              "fieldname": "order_template",
              "fieldtype": "Dynamic Link",
              "options": "order_template_type",
              "depends_on": "eval:doc.order_template_type;",
              "reqd": 1,
              onchange: function(frm) {
                let field_name = d.get_value("order_template_type") == "Lab Test Template" ? "department" : "medical_department";
                frappe.db.get_value(d.get_value("order_template_type"), d.get_value("order_template"), field_name).then((r) => {
                  if (r.message) {
                    d.set_value("department", r.message[field_name]);
                  }
                });
              }
            },
            {
              "fieldname": "department",
              "fieldtype": "Link",
              "label": "Department",
              "options": "Medical Department",
              "depends_on": "eval: doc.order_template",
              "read_only": 1
            },
            {
              "fieldname": "column_break_4",
              "fieldtype": "Column Break",
              "depends_on": "eval:doc.order_template_type=='Lab Test Template';"
            },
            {
              "fieldname": "practitioner",
              "fieldtype": "Link",
              "label": "Referred to Practitioner",
              "options": "Healthcare Practitioner",
              "depends_on": "eval:doc.order_template_type=='Clinical Procedure Template';"
            },
            {
              "fieldname": "date",
              "fieldtype": "Date",
              "label": "Date",
              "depends_on": "eval:doc.order_template_type=='Clinical Procedure Template';"
            },
            {
              "fieldname": "description",
              "fieldtype": "Small Text",
              "label": "Comments",
              "depends_on": "eval:['Lab Test Template', 'Clinical Procedure Template'].includes(doc.order_template_type);"
            },
            {
              "fieldname": "no_of_sessions",
              "fieldtype": "Int",
              "label": "No of Sessions",
              "depends_on": "eval:doc.order_template_type=='Therapy Type';"
            }
          ],
          primary_action: function() {
            var data = d.get_values();
            frappe.call({
              method: "healthcare.healthcare.doctype.patient_encounter.patient_encounter.create_service_request_from_widget",
              args: {
                encounter: me.frm.doc.name,
                data
              },
              freeze: true,
              callback: function(r) {
                if (!r.exc) {
                  me.refresh();
                  d.hide();
                }
              }
            });
          },
          primary_action_label: __("Create")
        });
        d.show();
      };
      $(".new-service-request-btn").click(_create_service_request);
    }
    create_medication_request() {
      let me = this;
      let _create_medication_request = () => {
        var d = new frappe.ui.Dialog({
          title: __("Create Medication Request"),
          fields: [
            {
              "fieldname": "medication",
              "fieldtype": "Link",
              "in_list_view": 1,
              "label": "Medication",
              "options": "Medication",
              onchange: function(e) {
                frappe.call({
                  method: "healthcare.healthcare.doctype.patient_encounter.patient_encounter.get_medications",
                  freeze: true,
                  args: {
                    medication: d.get_value("medication")
                  },
                  callback: function(r) {
                    if (r.message) {
                      if (r.message.length == 1) {
                        d.set_value("drug_code", r.message[0].item);
                      } else if (r.message.length > 1) {
                        d.set_value("drug_code", "");
                        var drug_list = r.message.map(({ item }) => item);
                        d.fields_dict["drug_code"].get_query = function() {
                          return {
                            filters: {
                              name: ["in", drug_list]
                            }
                          };
                        };
                      }
                    }
                  }
                });
                frappe.db.get_value(
                  "Medication",
                  d.get_value("medication"),
                  [
                    "default_prescription_dosage",
                    "default_prescription_duration",
                    "dosage_form",
                    "default_interval",
                    "default_interval_uom",
                    "strength",
                    "strength_uom"
                  ]
                ).then((r) => {
                  let values = r.message;
                  d.set_values({
                    "dosage": values.default_prescription_dosage,
                    "period": values.default_prescription_duration,
                    "dosage_form": values.dosage_form,
                    "interval": values.default_interval,
                    "interval_uom": values.default_interval_uom,
                    "strength": values.strength,
                    "strength_uom": values.strength_uom
                  });
                });
              }
            },
            {
              "fieldname": "drug_code",
              "fieldtype": "Link",
              "ignore_user_permissions": 1,
              "label": "Drug Code",
              "options": "Item"
            },
            {
              "fetch_from": "medication.default_prescription_duration",
              "fieldname": "period",
              "fieldtype": "Link",
              "label": "Period",
              "options": "Prescription Duration",
              "reqd": 1
            },
            {
              "fetch_from": "medication.dosage_form",
              "fieldname": "dosage_form",
              "fieldtype": "Link",
              "label": "Dosage Form",
              "options": "Dosage Form",
              "reqd": 1
            },
            {
              "depends_on": "eval:!doc.dosage_by_interval",
              "fetch_from": "medication.default_prescription_dosage",
              "fieldname": "dosage",
              "fieldtype": "Link",
              "label": "Dosage",
              "mandatory_depends_on": "eval:!doc.dosage_by_interval",
              "options": "Prescription Dosage"
            },
            {
              "fieldname": "column_break_7",
              "fieldtype": "Column Break"
            },
            {
              "fieldname": "description",
              "fieldtype": "Small Text",
              "label": "Comment"
            },
            {
              "fetch_from": "medication.strength",
              "fieldname": "strength",
              "fieldtype": "Float",
              "label": "Strength",
              "read_only_depends_on": "eval: doc.medication"
            },
            {
              "depends_on": "strength",
              "fetch_from": "medication.strength_uom",
              "fieldname": "strength_uom",
              "fieldtype": "Link",
              "label": "Strength UOM",
              "options": "UOM",
              "read_only_depends_on": "eval: doc.medication"
            },
            {
              "fieldname": "number_of_repeats_allowed",
              "fieldtype": "Float",
              "label": "Number Of Repeats Allowed"
            },
            {
              "default": "0",
              "fieldname": "dosage_by_interval",
              "fieldtype": "Check",
              "label": "Dosage by Time Interval"
            },
            {
              "fieldname": "section_break_7",
              "fieldtype": "Section Break",
              "depends_on": "eval:doc.dosage_by_interval"
            },
            {
              "depends_on": "eval:doc.dosage_by_interval",
              "fetch_from": "medication.default_interval",
              "fieldname": "interval",
              "fieldtype": "Int",
              "label": "Interval",
              "mandatory_depends_on": "eval:doc.dosage_by_interval"
            },
            {
              "depends_on": "eval:doc.dosage_by_interval",
              "fetch_from": "medication.default_interval_uom",
              "fieldname": "interval_uom",
              "fieldtype": "Select",
              "label": "Interval UOM",
              "mandatory_depends_on": "eval:doc.dosage_by_interval",
              "options": "\nHour\nDay"
            }
          ],
          primary_action: function() {
            var data = d.get_values();
            frappe.call({
              method: "healthcare.healthcare.doctype.patient_encounter.patient_encounter.create_service_request_from_widget",
              args: {
                encounter: me.frm.doc.name,
                data,
                medication_request: true
              },
              freeze: true,
              callback: function(r) {
                if (!r.exc) {
                  me.refresh();
                  d.hide();
                }
              }
            });
          },
          primary_action_label: __("Create")
        });
        d.show();
      };
      $(".new-medication-btn").click(_create_medication_request);
    }
    async update_status(status_btn, doctype, status) {
      let me = this;
      let row = "";
      if (doctype == "Service Request") {
        row = $(status_btn).closest(".service-request");
      } else {
        row = $(status_btn).closest(".medication-request");
      }
      let order_name = row.attr("name");
      if (status == "Cancel") {
        frappe.confirm(
          "Are you sure you want to proceed?",
          () => {
            frappe.call({
              method: "healthcare.healthcare.doctype.patient_encounter.patient_encounter.cancel_request",
              freeze: true,
              args: {
                doctype,
                request: order_name
              },
              callback: function(r) {
                if (r && !r.exc) {
                  me.refresh();
                }
              }
            });
          }
        );
      } else {
        await frappe.db.set_value(doctype, order_name, "status", status);
        me.refresh();
      }
    }
  };

  // frappe-html:/home/devuser/sumasoft-bench/apps/healthcare/healthcare/public/js/healthcare_note.html
  frappe.templates["healthcare_note"] = `<div class="clinical-notes-section col-xs-12">
	<div class="new-btn pb-3">
		<button class="btn btn-sm small new-note-btn mr-1">
			<svg class="icon icon-sm">
				<use href="#icon-add"></use>
			</svg>
			{{ __("New Clinical Note") }}
		</button>
	</div>
	<div class="all-clinical-notes">
		{% if (clinical_notes.length) { %}
			{% for(var i=0, l=clinical_notes.length; i<l; i++) { %}
				<div class="comment-content p-3 row" name="{{ clinical_notes[i].name }}">
					<div class="mb-2 head col-xs-3">
						<div class="row">
							<div class="col-xs-2">
								{{ frappe.avatar(clinical_notes[i].user) }}
							</div>
							<div class="col-xs-10">
								<div class="mr-2 title font-weight-bold">
									{{ strip_html(clinical_notes[i].added_by) }}
								</div>
								<div class="time small text-muted">
									{{ frappe.datetime.global_date_format(clinical_notes[i].posting_date) }}<br>
									{{ clinical_notes[i].practitioner }}<br>
									<div class="note-type">
										{{ clinical_notes[i].clinical_note_type }}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="content col-xs-8">
						{{ clinical_notes[i].note }}
					</div>
					<div class="col-xs-1 text-right">
						<span class="edit-note-btn btn btn-link">
							<svg class="icon icon-sm"><use xlink:href="#icon-edit"></use></svg>
						</span>
						<span class="delete-note-btn  btn btn-link pl-2">
							<svg class="icon icon-xs"><use xlink:href="#icon-delete"></use></svg>
						</span>
					</div>
				</div>
			{% } %}
		{% } else { %}
            <div class="no-clinical-notes text-muted pt-6">
                {{ __("No Clinical Notes") }}
            </div>
		    {% } %}
	</div>
</div>

<style>

.comment-content {
    border: 1px solid var(--border-color);
	border-bottom: none;
}

.comment-content:last-child {
    border-bottom: 1px solid var(--border-color);
}

.new-btn {
	text-align: right;
}

.clinical-notes-section .no-clinical-notes {
	min-height: 100px;
	text-align: center;
}

.clinical-notes-section .btn {
	padding: 0.2rem 0.2rem;
}

</style>`;

  // frappe-html:/home/devuser/sumasoft-bench/apps/healthcare/healthcare/public/js/healthcare_orders.html
  frappe.templates["healthcare_orders"] = `<div class="orders">
	<div class="new-btn pb-3">
		{% if (create_orders) { %}
		<span>
			<button class="btn btn-sm small new-service-request-btn mr-1">
				<svg class="icon icon-sm">
					<use href="#icon-add"></use>
				</svg>
				{{ __("New Service Request") }}
			</button>
			<button class="btn btn-sm small new-medication-btn">
				<svg class="icon icon-sm">
					<use href="#icon-add"></use>
				</svg>
				{{ __("New Medication Request") }}
			</button>
		</span>
		{% } %}
	</div>
	<div class="section-body">
		<div class="service-requests pr-1">
			<div class="open-section-head">
				<span class="ml-2">{{ __("Service Requests") }}</span>
			</div>
			{% if (service_requests && service_requests.length) { %}
				{% for(var i=0, l=service_requests.length; i<l; i++) { %}
					<div class="service-request" name="{{ service_requests[i].name }}">
						<div class="flex justify-between">
							<div class="row label-area font-md ml-1">
								<span class="mr-2">
									<svg class="icon icon-sm">
										<use href="#icon-menu"></use>
									</svg>
								</span>
								<a href="/app/service-request/{{ service_requests[i].name }}" title="{{ __('Service Requests') }}">
									{%= service_requests[i].name %}
								</a> - <span style="font-size: 10px;">{{service_requests[i].order_group}}</span>
							</div>
							<div class="colo-sm-2" style="float:right; padding-right:10px; padding-top:10px; padding-bottom:10px;">
								{% if(service_requests[i].billing_status=="Invoiced") { %}
									<div class="invoiced">
										{{ __("Invoiced") }}
									</div>
								{% } %}
								<button data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="btn btn-xs btn-secondary order-btn">
									{%= status_code_map[service_requests[i].status] %}
								</button>
								<ul class="dropdown-menu dropdown-menu-right"
									style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-172px, 26px, 0px);"
									x-placement="bottom-end">
									{% if(service_requests[i].status == "Active") { %}
									<li><a class="dropdown-item service-request-onhold" data-action="on-hold">{{ __("On Hold") }}</a></li>
									<li><a class="dropdown-item service-request-replace" data-action="replace">{{ __("Replace") }}</a></li>
									{% } else if (service_requests[i].status == "On Hold") { %}
									<li><a class="dropdown-item service-request-active" data-action="active">{{ __("Active") }}</a></li>
									{% } %}
									{% if(service_requests[i].docstatus == 1 && service_requests[i].status == "Active") { %}
									<li><a class="dropdown-item order-cancel" data-action="cancel">{{ __("Cancel") }}</a></li>
									{% } %}
								</ul>
								</div>
						</div>
						<div class="service-request-details row" style="width: 100%;">
							<div class="mb-2 head col-xs-3">
								<div class="row">
									<div class="col-xs-2">
										{{ frappe.avatar(service_requests[i].practitioner_email) }}
									</div>
									<div class="col-xs-10">
										<div class="time small text-muted">
											{{ frappe.datetime.global_date_format(service_requests[i].order_date) }} {{ service_requests[i].order_time }}<br>
											{{ service_requests[i].practitioner_name }}
										</div>
									</div>
								</div>
							</div>
							 <div style="padding-bottom:20px; padding-left:30px; padding-right:10px;">
								{% if(service_requests[i].template_dt) { %}
									<div class="text-muted  ml-1">
										{{ __("Order Type:") }}
										<b>{%= service_requests[i].template_dt %}</b>
									</div>
								{% } %}
								{% if(service_requests[i].template_dn) { %}
									<div class="text-muted ml-1">
										{{ __("Order Name:") }}
										<b>{%= service_requests[i].template_dn %}</b>
									</div>
								{% } %}
							 </div>
						</div>
						{% if(service_requests[i].lab_details) { %}
						<div class="text-muted lab-details">
							{%= service_requests[i].lab_details %}
						</div>
					{% } %}
				</div>
			    {% } %}
            {% } else { %}
			<div class="no-orders text-muted">
                    {{ __("No Service Requests") }}
                </div>
		    {% } %}
		</div>
		<div class="medication-requests pr-1">
			<div class="open-section-head">
				<span class="ml-2">{{ __("Medication Requests") }}</span>
			</div>
			{% if (medication_requests && medication_requests.length) { %}
				{% for(var i=0, l=medication_requests.length; i<l; i++) { %}
					<div class="medication-request" name="{{ medication_requests[i].name }}">
						<div class="flex justify-between">
							<div class="row label-area font-md ml-1">
								<span class="mr-2">
									<svg class="icon icon-sm">
										<use href="#icon-menu"></use>
									</svg>
								</span>
								<a href="/app/medication-request/{{ medication_requests[i].name }}" title="{{ __('Medication Requests') }}">
									{%= medication_requests[i].name %}
								</a> - <span style="font-size: 10px;">{{medication_requests[i].order_group}}</span>
							</div>
							<div class="colo-sm-2" style="float:right; padding-right:10px; padding-top:10px; padding-bottom:10px;">
								{% if(medication_requests[i].billing_status=="Invoiced") { %}
									<div class= "invoiced" style="float: left; padding-right: 10px;">
										{{ __("Invoiced") }}
									</div>
								{% } %}
								<button data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="btn btn-xs btn-secondary order-btn">
									{%= status_code_map[service_requests[i].status] %}
									</button>
									<ul class="dropdown-menu dropdown-menu-right"
									style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-172px, 26px, 0px);"
									x-placement="bottom-end">
									{% if(medication_requests[i].status == "Active") { %}
									<li><a class="dropdown-item service-request-onhold" data-action="on-hold">{{ __("On Hold") }}</a></li>
									<li><a class="dropdown-item service-request-replace" data-action="replace">{{ __("Replace") }}</a></li>
									{% } else if (medication_requests[i].status == "On Hold") { %}
									<li><a class="dropdown-item service-request-active" data-action="active">{{ __("Active") }}</a></li>
									{% } %}
									{% if(medication_requests[i].docstatus == 1 && medication_requests[i].status == "Active") { %}
									<li><a class="dropdown-item order-cancel" data-action="cancel">{{ __("Cancel") }}</a></li>
									{% } %}
								</ul>
								</div>
						</div>
						<div class="medication-request-details row" style="width: 100%;">
							<div class="mb-2 head col-xs-3">
								<div class="row">
									<div class="col-xs-2">
										{{ frappe.avatar(medication_requests[i].practitioner_email) }}
									</div>
									<div class="col-xs-10">
										<div class="time small text-muted">
											{{ frappe.datetime.global_date_format(medication_requests[i].order_date) }}-{{medication_requests[i].order_time}}<br>
											{{ medication_requests[i].practitioner_name }}
										</div>
									</div>
								</div>
							</div>
							<div style="padding-bottom:20px; padding-right:10px;">
								{% if(medication_requests[i].medication) { %}
									<div class="text-muted  ml-1">
										{{ __("Medication:") }}
										<b>{%= medication_requests[i].medication %}</b>
									</div>
								{% } %}
								{% if(medication_requests[i].period) { %}
								<div class="text-muted  ml-1">
									{{ __("Period:") }}
									<b>{%= medication_requests[i].period %}</b>
								</div>
								{% } %}
							 </div>
							 <div style="padding-bottom:20px; padding-left:30px; padding-right:10px;">
								{% if(medication_requests[i].dosage_form) { %}
									<div class="text-muted  ml-1">
										{{ __("Dosage Form:") }}
										<b>{%= medication_requests[i].dosage_form %}</b>
									</div>
								{% } %}
								{% if(medication_requests[i].dosage) { %}
									<div class="text-muted  ml-1">
										{{ __("Dosage:") }}
										<b>{%= medication_requests[i].dosage %}</b>
									</div>
								{% } %}
							 </div>
							 <div style="padding-bottom:20px; padding-left:30px; padding-right:10px;">
								{% if(medication_requests[i].quantity) { %}
									<div class="text-muted  ml-1">
										{{ __("Quantity:") }}
										<b>{%= medication_requests[i].quantity %}</b>
									</div>
								{% } %}
							 </div>
						</div>
				</div>
			    {% } %}
            {% } else { %}
			<div class="no-orders text-muted">
                    {{ __("No Medication Requests") }}
                </div>
		    {% } %}
		</div>
</div>


<style>
.orders {
	min-height: 50px;
	padding-left: 0px;
	padding-bottom: 15px !important;
}

.orders .new-btn {
	text-align: right;
}

.service-request, .medication-request {
	min-height: 90px;
	border: 1px solid var(--border-color);
	padding-right: 0;
	font-size: 11px;
	padding-left: 5px;
	padding-top: 10px;
}

.single-activity:last-child {
	border-bottom: 1px solid var(--border-color);
}

.checkbox {
	min-width: 22px;
}

.service-requests {
	width: 100%;
}

.service-requests:first-child {
	border-right: 0;
}

.medication-requests {
	width: 100%;
}

.open-section-head {
	background-color: var(--bg-color);
	min-height: 30px;
	border-bottom: 1px solid var(--border-color);
	padding: 10px;
	font-weight: bold;
}

.no-orders {
    text-align: center;
    padding: 30px;
}

.form-footer {
	background-color: var(--bg-color);
}

.lab-details {
	font-size: 10px;
	padding-left: 4px;
	padding-right: 12px;
	width: 100%;
}

.service-request-details, .medication-request-details {
	padding-left: 14px;
	padding-right: 14px;
}

.invoiced {
	float: left;
	padding-right: 10px;
	color:rgb(163, 160, 160)
}

</style>`;
})();
//# sourceMappingURL=healthcare.bundle.3B5NXUSN.js.map
