
import frappe

def check():
    try:
        frappe.init(site="frappe-his.sumasoft.com")
        frappe.connect()
        
        print("Checking Letterhead table...")
        try:
            res = frappe.db.sql("SELECT name, content FROM `tabLetterhead`", as_dict=True)
            print(f"Found {len(res)} letterheads.")
            for lh in res:
                print(f"Letterhead: {lh.name}")
                print(f"Content Sample: {lh.content[:100] if lh.content else 'None'}...")
                if "FPA Inda" in (lh.content or ""):
                    print("!!! TYPO CONFIRMED IN CONTENT !!!")
        except Exception as e:
            print(f"SQL Error: {e}")

        print("\nChecking Letterhead via ORM...")
        try:
            lhs = frappe.get_all("Letterhead", fields=["name", "content"])
            print(f"ORM found {len(lhs)} letterheads.")
        except Exception as e:
            print(f"ORM Error: {e}")
            
    finally:
        frappe.destroy()

if __name__ == "__main__":
    check()
