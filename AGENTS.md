# Project Rules & Agent Instructions

This document persists context and execution rules for AI Studio coding agents working on **XLR8 Real-Time CDP**. These guidelines ensure token-efficient, consistent, and high-velocity engineering.

---

## 1. Project Overview & Architecture
- **Application**: XLR8 Real-Time Customer Data Platform (Adobe Experience Platform / Real-Time CDP inspired architecture).
- **Core Stack**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons.
- **State Management**: Centralized React Context (`/src/context/CDPContext.tsx`) with durable demo state persistence.
- **Domain Modeling**: Types and interfaces declared in `/src/types/cdp.ts`.

### Core Functional Modules
1. **Data Management**:
   - **XDM Schemas**: Standardized Experience Data Model schemas (Profile, ExperienceEvent, Tenant Mixins).
   - **Data Ingestion & Streams**: Real-time event endpoints, batch ingestion, streaming pipelines.
   - **Datasets & DULE Labeling**: Catalog of datasets with Adobe RT-CDP Data Usage Labeling & Enforcement (DULE).
   - **Create New Dataset**: Dedicated onboarding workflow for schema binding, ingestion mode, and initial privacy governance.
   - **Federated Zero-Copy Mesh**: Pushdown queries across cloud data warehouses (Snowflake, BigQuery, Databricks).
2. **Privacy & Governance (DULE)**:
   - **Taxonomy**: Four core label series:
     - `C-Series`: Contractual Restrictions (e.g., C1–C12, email, on-site, 3rd party).
     - `I-Series`: Identity Data (e.g., I1 directly identifiable, I2 pseudo-identifiable).
     - `S-Series`: Sensitive Data (e.g., S1 geo, S2 health, S3 financial).
     - `R-Series`: Regulatory Compliance (e.g., R1 GDPR, R2 CCPA/CPRA, R3 HIPAA).
   - **Enforcement Engine**: Policy definitions evaluating destinations, audiences, and label violations (`Block`, `Mask SHA-256`, `Consent Gated`).
3. **Customer 360 & Real-Time Profiles**:
   - Identity graph, merged unified profiles, computed traits, and real-time behavioral timelines.
4. **Audiences & Activation**:
   - Rule-based segment builder and outbound destination connectors (Facebook, Google Ads, Amazon S3, Braze, Snowflake, Webhooks).

---

## 2. Token Optimization & Execution Rules
To minimize token consumption and avoid context limits:
- **Targeted Edits**: Use surgical search-and-replace edits. Do not rewrite or output entire multi-hundred line component files when modifying isolated behaviors.
- **Modular Component Design**: Split distinct subviews, modals, and tables into `/src/components/*` rather than inflating existing monolithic files.
- **No Unsolicited Scope**: Implement exactly what is requested. Avoid inventing secondary backends, mock telemetry generators, or redundant navigation hierarchies.
- **Verification First**: Always run `lint_applet` and `compile_applet` to confirm compilation before finalizing turns.

---

## 3. Visual Design & UI Standards
- **Color Palette & Contrast**: Enterprise SaaS light palette with high-contrast text (`#1E2229`), Adobe primary blue (`#1473E6`), subtle slate borders (`#E1E5EA`, `#D0D7DE`), and semantic badge states (Success, Warning, Block/Danger).
- **Typography & Layout**: Clean typography, mathematical padding (`outer >= inner`), 12-16px container radiuses, and single-line labels on action pills and buttons.
- **Icons**: Always import icons exclusively from `lucide-react`.
