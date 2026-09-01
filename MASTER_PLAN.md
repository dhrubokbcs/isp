# ISP Digital Campus — Master Architecture & Project Specification

This document serves as the permanent master reference for the ISP (Indicator Student's Point) Digital Campus management and academic platform.

---

## 1. System Architecture Overview

```
                         ISP DIGITAL CAMPUS
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
       PEOPLE                ACADEMIC              FINANCE
          │                     │                     │
     Students              Academic Year            Fees
     Teachers              Program                  Payments
     Guardians             Class Level              Receipts
          │                Batch                    Due
          │                Subject
          │                Timetable
          │                Sessions
          │                Attendance
          │
          └─────────────────────┐
                                │
                           EXAMINATION
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                  Exams      Questions    Results
                                │
                                │
                            LEARNING
                                │
                     ┌──────────┼──────────┐
                     │          │          │
                 Materials  Assignments  Model Tests
                     │
                     │
                 COMMUNICATION
                     │
              Notices / Notifications
```

### Core Hierarchy
```
Academic Year ➔ Program ➔ Class Level ➔ Batch ➔ Subject ➔ Teacher Assignment
                                          │
                                          └── Enrollment ➔ Student
```

---

## 2. Technology Stack & Boundaries

- **Framework**: Next.js App Router (TypeScript, React 19)
- **Subdomain Routing Architecture**:
  - **`console.*` (`console.ispctg.live` / `console.localhost:3000`)**:
    - Strictly for **SUPERADMIN**, **ADMIN**, and **TEACHER**.
    - Internal rewrites via Edge Middleware to `/console/*` routes.
    - Staff authentication: Email / Password.
  - **Root Domain (`ispctg.live` / `localhost:3000`)**:
    - For **STUDENTS** and **GUARDIANS**.
    - Student authentication: Google OAuth (strictly linked to pre-verified records).
    - Guardian authentication: Email / Password.
- **UI Library**: Material UI (MUI) via official `@mui/material-nextjs` App Router integration.
- **Components**: MUI Core, MUI X DataGrid, MUI X Date Pickers, MUI Icons.
- **Strictly Disallowed**: Tailwind CSS, shadcn/ui, Chakra UI, Ant Design, Bootstrap, DaisyUI.
- **Database**: Supabase PostgreSQL + Prisma ORM.
- **Authentication**: Supabase Auth
- **Validation**: Zod (strict server-side and client-side schemas)
- **Forms**: React Hook Form
- **Storage**: Supabase Storage (private buckets for documents, academic assets, receipts)
- **Architecture**: Modular Monolith inside Next.js (clean domain separation)

---

## 3. Core Business Rules

1. **Permanent Student ID**:
   - Format: `YYYYSSSS` (e.g., `20280001` to `20289999`).
   - `YYYY` = admission academic year, `SSSS` = 4-digit sequential serial.
   - Never regenerated upon promotion.
   - Never generated with `count() + 1`. Generated via atomic PostgreSQL transaction / sequence mechanism with safety lock per AcademicYear.
2. **Academic Year & History Preservation**:
   - Academic years and historical enrollments are immutable once completed.
   - Promotion creates a new `Enrollment` record; never mutates past records.
3. **Class Level vs. Batch**:
   - Class Level (e.g. Class 9, Class 10) is an abstract reusable grade.
   - Batch (e.g. "SSC 2027 Science A", "Morning Batch") is an operational instance with schedule, capacity, and student enrollments.
4. **Attendance**:
   - Belongs to a concrete `ClassSession`, not directly to a recurring timetable slot.
5. **Multi-Parent / Multi-Student Guardianship**:
   - Many-to-many relationship via `GuardianStudent` with relationship types (FATHER, MOTHER, GUARDIAN, OTHER) and primary flags.
6. **Financial Integrity**:
   - No floating-point arithmetic. High-precision `Decimal` types.
   - No hard deletes for completed payments or fees; audit trail with cancellation/reversal status.
7. **Server-Side RBAC Enforcement**:
   - Never rely on frontend route guards or UI element hiding.
   - Every Server Action / Route Handler verifies `Auth -> Role -> Permission -> Ownership -> Database Operation`.

---

## 4. Master Prompt Specification (Preserved)

```text
You are a senior full-stack architect and engineer.

Build a production-ready coaching center management and academic platform for:
ISP — Indicator Student's Point (Class 6 to Class 12, SSC, HSC, University Admission).

Primary domains:
- Academic years, Programs, Class levels, Batches, Subjects, Rooms, Timetable, Sessions, Attendance
- People: Teachers, Students, Guardians, Enrollments
- Examination: Exams, Question bank, Results
- Learning: Assignments, Study materials
- Finance: Fees, Payments, Receipts, Due tracking
- Communication: Notices, Notifications
- System: Audit logs, Users, Roles, Permissions, System settings
```

