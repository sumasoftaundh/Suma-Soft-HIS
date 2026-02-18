import frappe
from frappe.utils import add_days, getdate, nowdate

@frappe.whitelist()
def get_dashboard_data():
    """Fetches all data required for the Pharmacy Dashboard."""
    today = nowdate()

    stats = get_quick_stats(today)
    charts = get_chart_data(today)
    inventory = get_inventory_data()
    prescriptions = get_prescription_data()
    alerts = get_alerts_data()

    return {
        "stats": stats,
        "charts": charts,
        "inventory": inventory,
        "prescriptions": prescriptions,
        "alerts": alerts
    }

def get_quick_stats(today):


    stock_count = frappe.db.sql("""SELECT COUNT(*) FROM `tabItem` WHERE has_variants = 0 AND is_stock_item = 1 AND item_group = 'Drug'""")[0][0]

    low_stock = frappe.db.sql("""SELECT COUNT(*) FROM `tabBin` WHERE projected_qty < 10""")[0][0]
    near_expiry = frappe.db.sql("""SELECT COUNT(*) FROM `tabBatch` WHERE expiry_date BETWEEN %s AND %s""", (today, add_days(today, 30)))[0][0]
    pending_prescriptions = frappe.db.sql("""SELECT COUNT(*) FROM `tabMedication Request` WHERE status = 'Pending'""")[0][0]

    return {
        "stock-count": stock_count,
        "low-stock": low_stock,
        "near-expiry": near_expiry,
        "pending-prescriptions": pending_prescriptions
    }

def get_chart_data(today):
    """Fetches data for sales trends and top selling items charts."""
    # Sales trends for the last 7 days
    sales_data = frappe.db.sql("""
        SELECT posting_date, SUM(grand_total) as total_sales
        FROM `tabSales Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        GROUP BY posting_date
        ORDER BY posting_date
    """, (add_days(today, -6), today), as_dict=True)

    sales_trends = {
        'labels': [getdate(d).strftime('%a') for d in [add_days(today, i) for i in range(-6, 1)]],
        'datasets': [{'name': 'Sales', 'values': [0]*7}]
    }
    for record in sales_data:
        try:
            idx = (record.posting_date - add_days(today, -6)).days
            if 0 <= idx < 7:
                sales_trends['datasets'][0]['values'][idx] = record.total_sales
        except (TypeError, AttributeError):
            continue

    # Top 5 selling items
    top_items_data = frappe.db.sql("""
        SELECT item_name, SUM(qty) as total_qty
        FROM `tabSales Invoice Item`
        WHERE parenttype = 'Sales Invoice' AND docstatus = 1
        GROUP BY item_code, item_name
        ORDER BY total_qty DESC
        LIMIT 5
    """, as_dict=True)

    top_items = {
        'labels': [item.item_name for item in top_items_data],
        'datasets': [{'name': 'Quantity Sold', 'values': [item.total_qty for item in top_items_data]}]
    }

    return {
        "sales_trends": sales_trends,
        "top_items": top_items
    }

def get_inventory_data():
    inventory_data = frappe.db.sql("""
        SELECT
            i.item_name,
            (SELECT SUM(b.actual_qty) FROM `tabBin` b WHERE b.item_code = i.name) AS stock,
            (SELECT batch.batch_id FROM `tabBatch` batch WHERE batch.item = i.name ORDER BY batch.expiry_date DESC LIMIT 1) AS batch_no,
            (SELECT expiry_date FROM `tabBatch` batch WHERE batch.item = i.name AND batch.expiry_date IS NOT NULL ORDER BY batch.expiry_date DESC LIMIT 1) as expiry_date,
            (SELECT ip.price_list_rate FROM `tabItem Price` ip WHERE ip.item_code = i.name ORDER BY ip.price_list DESC LIMIT 1) AS price,
            i.item_group AS category
        FROM
            `tabItem` AS i
        WHERE
            i.is_stock_item = 1
            AND i.item_group = 'Drug'
            AND i.disabled = 0
        LIMIT 50
    """, as_dict=True)

    return inventory_data

def get_prescription_data():
    return frappe.db.sql("""
        SELECT name, patient_name, practitioner_name as doctor, status
        FROM `tabMedication Request`
        WHERE status = 'Pending'
        LIMIT 20
    """, as_dict=True)

def get_alerts_data():
    alerts = []
    out_of_stock = frappe.db.sql("""SELECT item_name FROM `tabItem` WHERE total_projected_qty <= 0 AND is_stock_item = 1 AND item_group = 'Drug' LIMIT 5""")
    for item in out_of_stock:
        alerts.append({"type": "danger", "message": f"{item[0]} is out of stock."})

    expiring_soon = frappe.db.sql("""SELECT item_name FROM `tabItem` WHERE name IN (SELECT item FROM `tabBatch` WHERE expiry_date BETWEEN %s AND %s) LIMIT 5""", (nowdate(), add_days(nowdate(), 30)))
    for item in expiring_soon:
        alerts.append({"type": "warning", "message": f"{item[0]} is expiring soon."})

    return alerts
