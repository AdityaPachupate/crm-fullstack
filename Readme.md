# Panchakarma CRM: Feature & API Integration Guide

This guide details the application's capabilities across its core modules and the corresponding API endpoints that power them.

---

## 🏗️ Leads Module
*Management of potential patients and their initial contact history.*

### 🌟 What you can do:
1.  **Register New Leads**: Capture patient details and initial interest.
    - `POST /api/leads`
2.  **Browse & Search**: View active leads with paging and filtering. Includes **Calculated Flags** (`HasEnrollment`, `HasMedicine`) for instant status context.
    - `GET /api/leads`
3.  **Deep Dive History**: View a lead's full timeline including follow-ups, enrollments, and **Billing History**.
    - `GET /api/leads/{id}` (Note: Soft-deleted leads are filtered out by default)
4.  **Maintain Accuracy**: Update patient contact info or status as it evolves.
    - `PUT /api/leads/{id}`
    - **Soft Delete (Cascading)**: Move leads to "Trash" while preserving data. This **automatically** trashes all associated Follow-ups, Enrollments, and Bills.
      - `DELETE /api/leads/{id}`
    - **Restore (Cascading)**: Bring a lead and all its associated history back from the trash.
      - `POST /api/leads/{id}/restore`
    - **Permanent Delete**: Completely remove data (Admins only).
      - `DELETE /api/leads/{id}?isPermanent=true`

---

## 📞 Follow-up Module
*Tracking interactions and automating the patient conversion pipeline.*

### 🌟 What you can do:
1.  **Schedule Next Contact**: Assign a follow-up task with a specific priority and communication source (WhatsApp, Call, etc.).
    - `POST /api/followups` (Validation: Follow-up date cannot be in the past)
2.  **Daily Action Dashboard**: Instantly see what needs attention today. Includes automatic calculation of **Overdue** tasks.
    - `GET /api/followups/today`
3.  **Record Outcomes**: Complete a task and document the result (e.g., Busy, Interested).
    - `POST /api/followups/{id}/complete`
4.  **Automation (The Workflow Engine)**:
    - **Auto-Rescheduling**: Completing a task as `Busy` automatically creates a new follow-up for the next day.
    - **Lead Updates**: Completing a task as `Not Interested` automatically marks the parent Lead as `Lost`.
5.  **Task Cleanup**:
    - **Soft Delete**: Remove accidental or redundant tasks.
      - `DELETE /api/followups/{id}`
    - **Restore**: Recover a deleted follow-up.
      - `POST /api/followups/{id}/restore`

---

## 📦 Packages Module
*Defining service offerings, durations, and financial baseline.*

### 🌟 What you can do:
1.  **Define Offerings**: Create standardized treatment packages with fixed durations and costs.
    - `POST /api/packages`
2.  **Manage Catalog**: List all active packages available for enrollment.
    - `GET /api/packages`
3.  **Audit Details**: View the specific parameters of a package.
    - `GET /api/packages/{id}`
4.  **Evolution**: Update package prices or durations as business needs change.
    - `PUT /api/packages/{id}`
5.  **Inventory Control**:
    - **Deactivate**: Soft-delete packages that are no longer offered.
      - `DELETE /api/packages/{id}`
    - **Reactivate**: Restore legacy packages.
      - `POST /api/packages/{id}/restore`

---

## 🎓 Enrollments Module
*The bridge between Leads and Packages—converting interest into active participation.*

### 🌟 What you can do:
1.  **Convert a Lead**: Enroll a patient into a package. This **automatically** generates an initial `Bill` and updates the Lead's status to `Converted`.
    - `POST /api/enrollments`
2.  **Track Participation**: View all enrollments with advanced logic:
    - **Real-time Status**: Filter by `isActive=true` to see who is currently in treatment.
    - **Financial Snapshot**: View `PendingAmount` directly in the list.
      - `GET /api/enrollments`
3.  **Detailed Review**: View an enrollment with its **historical snapshots** and its **Unified Financial Status** (Initial Cost, Medicines, Paid vs Pending).
    - `GET /api/enrollments/{id}`
4.  **Adjust Schedules**: Update enrollment dates. Note: The `EndDate` automatically recalculates if you change the `StartDate` or the `Package`.
    - `PUT /api/enrollments/{id}`
5.  **Lifecycle Management**:
    - **Soft Delete**: Trash an enrollment. Note: This unlinks but preserves the associated Bill.
      - `DELETE /api/enrollments/{id}`
    - **Restore**: Recover a trashed enrollment.
      - `POST /api/enrollments/{id}/restore`

---

## 🧾 Bills Module
*Financial tracking and itemized medicine billing.*

### 🌟 What you can do:
1.  **Itemized Billing**: Create bills with multiple medicine items, quantities, and automatic price snapshots.
    - `POST /api/bills`
2.  **Global Financial Overview**: View a paginated list of all bills across the entire clinic. Supports filtering by `LeadId` or `IsTrash`.
    - `GET /api/bills`
3.  **Detailed Lead Billing**: Get the full financial history for a specific lead.
    - `GET /api/leads/{id}/bills`
4.  **Unified Financial Status**: Manage `InitialAmount` (Package), `MedicineBillingAmount`, `AmountPaid`, and `PendingAmount`.
5.  **Historical Integrity**: Soft-deleted bills and inactive medicines remain visible in detail views for audit trails.
6.  **Lifecycle Management**:
    - **Soft Delete**: Move individual bills to the trash.
      - `DELETE /api/bills/{id}`
    - **Update**: Adjust bill totals or itemized medicine lists.
      - `PUT /api/bills/{id}`
    - **Restore**: Recover a trashed bill.
      - `POST /api/bills/{id}/restore`
    - **Permanent Delete**: Hard-delete bills from the system (Admins only).
      - `DELETE /api/bills/{id}?isPermanent=true`

---

## 💊 Medicines Module
*Pharmacy inventory and pricing management.*

### 🌟 What you can do:
1.  **Inventory Control**: Define available medicines and their current unit prices.
    - `POST /api/medicines`
2.  **Pharmacy List**: View all active medicines in stock.
    - `GET /api/medicines`
3.  **Audit Logs**: View history and details for a specific medicine.
    - `GET /api/medicines/{id}`
4.  **Price Updates**: Change pricing or stock status. Note: Historical bills use **price snapshots** and are NOT affected by current price changes.
    - `PUT /api/medicines/{id}`
5.  **Lifecycle**: Deactivate medicines through soft-delete.
    - `DELETE /api/medicines/{id}`

---

## 🔄 Rejoin Module
*Managing returning patients and recurring service revenue.*

### 🌟 What you can do:
1.  **Renew Service**: Rejoin a former patient into a new package subscription.
    - `POST /api/rejoins`
2.  **Retention Dashboard**: View all rejoining records and their financial impact.
    - `GET /api/rejoins`
3.  **Detailed History**: Review a specific rejoin event and its associated bills.
    - `GET /api/rejoins/{id}`
4.  **Adjust Schedules**: Update rejoin start dates.
    - `PUT /api/rejoins/{id}`
5.  **Lifecycle**: Soft-delete, Restore, and Hard-delete rejoin records.
    - `DELETE /api/rejoins/{id}`
    - `POST /api/rejoins/{id}/restore`

---

## 🛠️ Lookups Module
*System-wide configuration and category management.*

### 🌟 What you can do:
1.  **Register Constants**: Add new lookup values (Sources, Reasons, Follow-up Statuses).
    - `POST /api/lookups`
2.  **Global Reference**: View lists by Category (e.g., `LeadSource`, `LeadStatus`).
    - `GET /api/lookups`
3.  **Config Updates**: Rename or modify existing codes and values.
    - `PUT /api/lookups/{id}`
4.  **Lifecycle**: Soft-delete and Restore system configurations.
    - `DELETE /api/lookups/{id}`
    - `POST /api/lookups/{id}/restore`

---

## 🚀 Technical Standards & Architecture

### 🛤️ Global Routing Standard
All API endpoints are prefixed with `/api/`. 
- **Routes**: Do not include `/api` in your feature route string; the global group prefix handles this.
- **Health Checks**: 
    - Full: `/api/health`
    - Liveness: `/api/health/live`
    - Readiness: `/api/health/ready`

### 🏗️ Vertical Slice Architecture
Code is organized by **Features** (`Features/Leads/CreateLead`). All requirements for a single functionality (Request, Response, Handler, Validator) are encapsulated in one place.

### ⚡ CQRS & MediatR
- **Commands**: Modifications (Create, Update, Delete).
- **Queries**: Retrievals (GetById, List).

### 🛡️ Pipeline Behaviors & Validation
Input validation uses **FluentValidation**. 
- **Pattern**: Validators must inherit from `AbstractValidator<TCommand>` (not `TRequest`) to be picked up by the MediatR `ValidationBehavior` pipeline.
- **Error Responses**: 
    - **400 Bad Request**: Used for structural validation errors and malformed JSON.
    - **409 Conflict**: Used for business rule violations like uniqueness constraints (handled via `BusinessException`).

### 🧐 Exception Handling
A centralized `GlobalExceptionHandler` ensures consistent responses:
- **ValidationException** & **BadHttpRequestException** $\rightarrow$ `400 Bad Request`
- **BusinessException** $\rightarrow$ Customizable (usually `409 Conflict` or `404 Not Found`)
- **Unhandled Exceptions** $\rightarrow$ `500 Internal Server Error`

### 🗑️ Lifecycle & Trash System
- **Cascading Trash**: Trashing a top-level entity (like a Lead) automatically trashes all dependent records (Follow-ups, Enrollments, Bills).
- **Soft Delete Filtering**: Normal views and `GetById` endpoints respect soft-delete status unless explicitly asked for trash views.