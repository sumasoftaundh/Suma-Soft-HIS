🏥 HMIS on Frappe Framework
Low-Code, Metadata-Driven Hospital Management System built on Frappe
A full-stack HMIS built using the Frappe Framework (Python, MariaDB, JS) designed for real-world hospital workflows, patient records, OPD/IPD management, and healthcare operations.
Built with semantics, extensibility, and real hospital workflows in mind.

🌐 Website | 📘 Documentation | 💻 GitHub
Website link : https://frappe-his.sumasoft.com/Documentation link : https://docs.frappe.io/framework/user/en/introductionGitHub : 
https://github.com/sumasoftaundh/Suma-Soft-HIS.git

🚀 About HMIS
This HMIS is a production-grade hospital management system developed using the Frappe Framework. It leverages Frappe’s metadata-driven architecture to create a highly extensible, role-based, and API-ready healthcare platform.
The system covers:
	•	Patient Registration & EMR
	•	OPD / IPD Management
	•	Doctor & Staff Management
	•	Appointment Scheduling
	•	Billing & Invoicing
	•	Lab & Reports
	•	Role-based access
	•	REST APIs for integrations (ABDM / FHIR / XDS ready)

🧠 Philosophy
“The best code is the one that is not written.”
By using Frappe’s DocType, Role, and Metadata architecture, the HMIS avoids heavy custom coding and instead builds on semantic healthcare entities like:
	•	Patient
	•	Encounter
	•	Practitioner
	•	Observation
	•	Invoice
	•	Lab Test
This makes the system:
	•	Consistent
	•	Extensible
	•	Integration-friendly
	•	Easy to customize for any hospital

✨ Key Features
Feature
Description
Full Stack
Python + MariaDB + JS (Frappe)
Role Based Access
Doctor, Nurse, Receptionist, Admin
Auto REST APIs
For all healthcare entities
Custom Forms
Dynamic healthcare forms
Reporting
No-code report builder for hospital analytics
EMR Ready
Structured patient records
Integration Ready
ABDM / FHIR / XDS compatible design
Admin Dashboard
Built-in Frappe desk for hospital ops

🖼️ Screenshots
Patient List : 

Appointment List : 
          

Billing List : 	
          


Reports list : 
       


🏭 Production Setup
☁️ Managed Hosting (Recommended)
You can deploy this HMIS easily on:
	•	Frappe Cloud
	•	AWS / DigitalOcean / Azure
	•	Any Docker compatible server

🐳 Self Hosting using Docker (Fastest Way)
Prerequisites
	•	Docker
	•	Docker Compose
	•	Git
Steps
git clone https://github.com/sumasoftaundh/Suma-Soft-HIS.gitUse installation guide : https://docs.frappe.io/framework/user/en/installation
After 2–3 minutes, open:
Bench start
http://localhost:8080
Login:
Username: AdministratorPassword: admin
Install the HMIS app from Desk → Apps.

🛠️ Development Setup (Manual)
Step 1 — Install Bench
Follow official bench install: https://github.com/frappe/bench

Step 2 — Start bench
bench start

Step 3 — Create New Site
bench new-site hmis.localhost

Step 4 — Get the HMIS app
bench get-app https://github.com/<your-username>/hmis_frappe.gitbench --site hmis.localhost install-app hmis
Open:
http://hmis.localhost:8000/app

🧩 HMIS Modules
	•	Patient Management
	•	Appointment Management
	•	Doctor/Staff Management
	•	OPD/IPD Workflow
	•	Billing & Invoicing
	•	Laboratory
	•	Reports & Analytics
	•	User & Role Permissions

🔌 API & Integrations
Frappe automatically generates REST APIs for all DocTypes.
Examples:
/api/resource/Patient/api/resource/Appointment/api/resource/Invoice
This allows easy integration with:
	•	ABDM
	•	FHIR servers
	•	XDS Toolkit
	•	External EMR / Lab systems

📊 Reports
Use Frappe Report Builder to create:
	•	Daily OPD count
	•	Revenue reports
	•	Doctor workload
	•	Lab test analytics
No code required.

🎓 Learning Resources
	•	Frappe Documentation
	•	Frappe School
	•	Community Forum

🤝 Contributing
We welcome contributions from the Frappe and Healthcare community.
	•	Report issues
	•	Suggest features
	•	Create pull requests

🔐 Security
If you find any security issue, please report privately.

📜 License
MIT License (or your preferred license)

❤️ Built With
	•	Frappe Framework
	•	MariaDB
	•	Python
	•	JavaScript

⭐ Why This HMIS is Special
Unlike traditional HMIS built with heavy custom code, this system is:
	•	Metadata driven
	•	Easily customizable for any hospital
	•	API first
	•	Open source
	•	Future ready for ABDM / FHIR / Interoperability

✅ Before Publishing
	•	Clean hardcoded data
	•	Export fixtures (roles, doctypes, workflows)
	•	Add screenshots
	•	Add demo hospital data
	•	Push to GitHub
