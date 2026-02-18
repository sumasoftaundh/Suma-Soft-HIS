frappe.listview_settings['Patient'] = {
    hide_name_column: true,
    get_indicator: function(doc) {
        if (doc.status === 'Active') {
            return [__('Active'), 'green', 'status,=,Active'];
        } else if (doc.status === 'Disabled') {
            return [__('Disabled'), 'red', 'status,=,Disabled'];
        }
    },

    add_fields: ["patient_name", "mobile", "email", "custom_is_liked"],

    button: {
        show(doc) {
            return true;
        },
        get_label() {
            return frappe.utils.icon('heart', 'sm');
        },
        get_description(doc) {
            return __(doc.custom_is_liked ? 'Unlike' : 'Like')
        },
        action(doc) {
            frappe.db.set_value('Patient', doc.name, 'custom_is_liked', !doc.custom_is_liked)
                .then(r => {
                    if (r.message) {
                        doc.custom_is_liked = r.message.custom_is_liked;
                        cur_list.refresh_row(doc);
                    }
                });
        },
        add_class(doc) {
            return doc.custom_is_liked ? 'liked' : '';
        }
    }
};
