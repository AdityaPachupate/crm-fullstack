# Panchakarma CRM: High-Performance Clinical Management

A production-ready, mobile-first CRM engineered for extreme clinical efficiency. This project implements advanced architectural patterns to solve real-world data persistence, performance, and scalability challenges.

---

## 🚀 Engineering Excellence (Industry Standards)
*Advanced architectural patterns implemented to meet enterprise-grade stability and performance requirements.*

### 🗄️ Offline-First Resilience Engine
Implemented a high-durability persistence layer using **TanStack Query (React Query)** and **IndexedDB**.
- **Data Durability**: Application state survives page refreshes and browser restarts via a custom IndexedDB persister.
- **Smart Hydration**: 24-hour `gcTime` ensures patient records are available instantly on launch, providing a native-app feel even during network outages.

### 🧩 Vertical Slice Architecture (Backend)
Transitioned from traditional N-Tier/Onion architecture to **Vertical Slices**. All logic for a single feature (Request, Response, Handler, Validator, and Persistence) is encapsulated in one logical slice, maximizing cohesion and maintainability.

### ⚡ Performance: Zero-Latency Experience
- **Intelligent Prefetching**: Utilizes high-precision prefetching strategies on user interactions to eliminate perceived API latency.
- **Optimistic UI with Rollbacks**: All state mutations reflect instantly in the UI with a transactional rollback strategy ensuring the local cache remains accurate if background synchronization fails.

### 🏗️ CQRS & MediatR Pattern
Decoupled Read and Write operations using the **Command Query Responsibility Segregation** pattern.
- **Clean API Surface**: MediatR simplifies controllers into simple dispatchers.
- **Pipeline Behaviors**: Integrated global validation (FluentValidation) and standardized exception handling via MediatR pipelines.

---

## ✨ Modern Frontend Features
*Display-worthy UI component innovations built for recruiter assessment.*

1.  **Direct-Action Patient Cards**: Lead cards feature **One-Tap Direct Calling** via `tel:` integration, enabling instant staff outreach from the list view.
2.  **Geometric Minimalism**: A rigorous "Squareish" design system utilizing unified `rounded-lg` and `rounded-2xl` tokens to create a structured, professional clinical aesthetic.
3.  **Real-Time Context Indicators**: Instant visual confirmation of active enrollments and pharmacy records via dedicated, metadata-driven status icons on each lead.
4.  **High-Speed Filter Navigation**: A custom-built **Quick Status Bar** at the top of the Leads List allowing for rapid, single-tap switching between lead pipelines.
5.  **Automated Serial Indexing**: Clean, automated serial numbering on all cards to maintain clear information hierarchy during patient check-ins.
6.  **Unified Metadata Registry**: All UI badges (Status, Priority, Source) are rendered through a global component fueled by a lookup registry, ensuring 100% design consistency.

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

## 🔮 Roadmap & Missing Features
*Planned enhancements for upcoming versions.*

- **📁 Document Vault**: Capability to upload and manage prescriptions and lab reports directly within a lead's profile.
- **🔔 Automated Notifications**: Automated WhatsApp/SMS alerts for upcoming follow-ups and treatment dates.
- **📊 Business Analytics**: Interactive charts for revenue trends, conversion rates, and source performance.
- **🔐 Role-Based Access**: Granular permissions for Doctors, Receptionists, and Pharmacy staff.

---

## 🚀 Technical Standards & Architecture

### 🛤️ Global Routing Standard
All API endpoints are prefixed with `/api/`. 
- **Routes**: Do not include `/api` in your feature route string; the global group prefix handles this.
- **Health Checks**: Full (`/api/health`), Liveness (`/api/health/live`), and Readiness (`/api/health/ready`).

### 🏗️ Vertical Slice Architecture
Code is organized by **Features** (`Features/Leads/CreateLead`). All requirements for a single functionality (Request, Response, Handler, Validator) are encapsulated in one place.

### ⚡ CQRS & MediatR
- **Commands**: Modifications (Create, Update, Delete).
- **Queries**: Retrievals (GetById, List).

### 🛡️ Pipeline Behaviors & Validation
Input validation uses **FluentValidation**. 
- **Pattern**: Validators inherit from `AbstractValidator<TCommand>` for MediatR pipeline integration.
- **Error Handling**: A centralized `GlobalExceptionHandler` ensures consistent 400 (Validation), 409 (Conflict), and 500 (Internal) error responses.

### 🗑️ Lifecycle & Trash System
- **Cascading Trash**: Trashing a top-level entity (like a Lead) automatically trashes all dependent records (Follow-ups, Enrollments, Bills).
- **Soft Delete Filtering**: Normal views and `GetById` endpoints respect soft-delete status unless explicitly asked for trash views.

---

## 🚀 Technical Stack
- **Frontend**: React 18, Vite, TanStack Query v5, Zustand, Tailwind CSS, IndexedDB.
- **Backend**: .NET 8, MediatR, EF Core, FluentValidation, PostgreSQL.
- **Architecture**: Vertical Slice Architecture, CQRS, Optimistic State Updates.