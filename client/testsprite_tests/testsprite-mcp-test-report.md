# TestSprite AI Testing Report — Peta Tematik Padang Pariaman (Frontend)

---

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| **Project Name** | client (Peta Tematik Interaktif Kabupaten Padang Pariaman) |
| **Test Target** | http://localhost:5174 (Vite production preview) |
| **Date** | 2026-05-13 |
| **Prepared by** | TestSprite AI + Kiro |
| **Total Tests** | 28 |
| **Completed** | 18 |
| **Passed** | 10 (35.7%) |
| **Failed** | 8 (28.6%) |
| **Blocked** | 10 (35.7%) |

---

## 2️⃣ Requirement Validation Summary

### REQ-1: Admin Authentication

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC001 | Sign in to the admin dashboard | ✅ Passed | Login with valid credentials works correctly |
| TC002 | Log in and reach the protected admin dashboard | ✅ Passed | JWT auth flow and redirect to dashboard confirmed |
| TC016 | Open the admin dashboard from the protected root route | ✅ Passed | `/admin` redirect to `/admin/dashboard` works |
| TC026 | See a login error for invalid admin credentials | ✅ Passed | Error message shown for wrong credentials |

**Result: 4/4 passed ✅** — Authentication is fully functional.

---

### REQ-2: Admin Dashboard

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC018 | View dashboard summary counts and navigate to management sections | ✅ Passed | Summary cards and navigation links work correctly |

**Result: 1/1 passed ✅** — Dashboard is functional.

---

### REQ-3: Admin Category Management

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC009 | Create a new category | ❌ Failed | Text inputs truncate to first character — form unusable |
| TC015 | Edit an existing category | ❌ Failed | Same input truncation bug blocks editing |
| TC019 | Delete an unused category | BLOCKED | Prerequisite (create category) fails due to input bug |
| TC027 | Prevent deleting a category that is in use | BLOCKED | Prerequisite (create category) fails due to input bug |

**Result: 0/2 executed passed ❌** — Critical bug: text inputs in the Kategori form only accept the first character typed. All category CRUD is broken.

**Root cause:** The `Input` component or the `onChange` handler in `Kategori.tsx` is likely re-rendering and resetting the field on every keystroke, causing only the last typed character to persist.

---

### REQ-4: Admin Infrastructure Management

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC008 | Create an infrastructure record with photo | ❌ Failed | Form validation blocked submission — required fields not filled by test |
| TC011 | Browse and filter infrastructure records | ✅ Passed | Pagination, search, and filters work correctly |
| TC014 | Edit an infrastructure record | ❌ Failed | Same input truncation bug — name/lat/lng fields only accept first character |
| TC021 | Delete an infrastructure record | ❌ Failed | Delete confirmation clicked but record remains in table |
| TC022 | Import infrastructure data from Excel | BLOCKED | No `.xlsx` fixture available in test environment |
| TC024 | Export filtered infrastructure data | ✅ Passed | Excel export download triggered correctly |

**Result: 2/4 executed passed** — Browse and export work. Create/edit/delete are broken by the same input truncation bug. Delete has an additional issue where the confirmation does not remove the record.

---

### REQ-5: Admin Statistics Management

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC012 | Create a statistics record | ❌ Failed | Input truncation bug — typed values don't persist in form fields |
| TC017 | Browse and filter statistics records | ✅ Passed | Pagination and filters work correctly |
| TC020 | Edit a statistics record | ❌ Failed | Input truncation bug — edits not saved |
| TC023 | Delete a statistics record | ✅ Passed | Delete confirmation works and record is removed |
| TC025 | Import statistics data from Excel | BLOCKED | No `.xlsx` fixture available in test environment |
| TC028 | Export filtered statistics data | ✅ Passed | Excel export download triggered correctly |

**Result: 3/4 executed passed** — Browse, delete, and export work. Create/edit broken by input truncation bug. Note: delete works for statistics but not for infrastructure (inconsistency).

---

### REQ-6: Public Interactive Map

| TC | Title | Status | Notes |
|----|-------|--------|-------|
| TC003 | Browse the public map and view a marker popup | BLOCKED | Full-page error modal "Terjadi Kesalahan" on map load |
| TC004 | Open the public map and browse infrastructure markers | ❌ Failed | Error boundary triggered — no Leaflet container rendered |
| TC005 | Search for infrastructure and open result on map | BLOCKED | Map error prevents reaching search UI |
| TC006 | Filter the map by category and territory | BLOCKED | Map error / loading spinner — no filters accessible |
| TC007 | Open a marker popup and read location details | BLOCKED | Map error prevents accessing markers |
| TC010 | Switch the basemap while keeping map overlays | BLOCKED | Map error — no basemap toggle accessible |
| TC013 | Review updated statistics on mobile after territory filter change | BLOCKED | Map error prevents reaching filter/stats panels |

**Result: 0/1 executed passed ❌** — The public map page (`/`) crashes with an unhandled error that triggers the React ErrorBoundary. The Leaflet map never renders.

**Root cause:** The `SearchBar` component now calls `useMap()` (a react-leaflet hook) at the top level, but `SearchBar` is rendered inside `PublicHeader` which is **outside** the `MapContainer` (i.e., outside the Leaflet `MapProvider` context). This causes a runtime error that bubbles up to the ErrorBoundary.

---

## 3️⃣ Coverage & Matching Metrics

| Requirement | Total Tests | ✅ Passed | ❌ Failed | BLOCKED |
|-------------|-------------|-----------|-----------|---------|
| Admin Authentication | 4 | 4 | 0 | 0 |
| Admin Dashboard | 1 | 1 | 0 | 0 |
| Admin Category Management | 4 | 0 | 2 | 2 |
| Admin Infrastructure Management | 6 | 2 | 3 | 1 |
| Admin Statistics Management | 6 | 3 | 2 | 1 |
| Public Interactive Map | 7 | 0 | 1 | 6 |
| **Total** | **28** | **10** | **8** | **10** |

**Overall pass rate (of completed tests): 10/18 = 55.6%**
**Overall pass rate (of all tests): 10/28 = 35.7%**

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical — Fix Immediately

**BUG-1: Text inputs truncate to first character in all admin forms**
- Affects: Category create/edit, Infrastructure create/edit, Statistics create/edit
- Symptom: Typing "Jalan Raya" results in only "J" in the field
- Impact: All create and edit operations are broken across 3 management pages
- Likely cause: The `Input` component's `onChange` handler or the controlled state in the form pages is resetting on every render cycle. Check if `setForm(f => ({...f, field: e.target.value}))` is being called inside a re-rendering closure, or if the `Input` component is being remounted on each keystroke (e.g., due to a key prop change or unstable component reference inside a modal).

**BUG-2: Public map page crashes with React ErrorBoundary**
- Affects: All public map features (TC003–TC007, TC010, TC013)
- Symptom: "Terjadi Kesalahan" error modal on `/` — Leaflet map never renders
- Impact: The entire public-facing feature is inaccessible
- Root cause: `SearchBar` now calls `useMap()` (react-leaflet hook) but is rendered in `PublicHeader` which is outside the Leaflet `MapContainer`. Fix: move the `useMap()` call inside a child component that is rendered within `MapContainer`, or pass the map instance as a prop to `SearchBar` instead of using the hook directly.

### 🟡 Medium — Fix Before Release

**BUG-3: Infrastructure delete confirmation does not remove the record**
- Affects: TC021 (Delete infrastructure)
- Symptom: Clicking "Hapus" in the confirmation dialog leaves the record in the table
- Impact: Admins cannot delete infrastructure records
- Note: Statistics delete (TC023) works correctly — the issue is specific to the infrastructure delete flow. Check the `handleDelete` function in `Infrastruktur.tsx` and verify the API call and list refresh after deletion.

### 🟠 Environment / Test Setup Gaps

**GAP-1: No Excel fixture files for import tests**
- Affects: TC022 (infrastructure import), TC025 (statistics import)
- Both tests were blocked because no `.xlsx` file was available in the test environment
- Recommendation: Add sample Excel fixture files to `client/testsprite_tests/fixtures/` for future test runs

### ✅ Working Well

- Admin login / logout / JWT auth flow
- Admin dashboard summary and navigation
- Infrastructure list with pagination, search, and filters
- Infrastructure Excel export
- Statistics list with pagination and filters
- Statistics delete
- Statistics Excel export
- Invalid login error handling
