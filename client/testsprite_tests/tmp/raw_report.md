
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** client
- **Date:** 2026-05-13
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Sign in to the admin dashboard
- **Test Code:** [TC001_Sign_in_to_the_admin_dashboard.py](./TC001_Sign_in_to_the_admin_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/1c5c22b3-ff13-401f-8a64-d6f9dbfc35af
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Log in and reach the protected admin dashboard
- **Test Code:** [TC002_Log_in_and_reach_the_protected_admin_dashboard.py](./TC002_Log_in_and_reach_the_protected_admin_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/8db1dd67-c468-4c92-bdb5-5b4a671e2e7d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Browse the public map and view a marker popup
- **Test Code:** [TC003_Browse_the_public_map_and_view_a_marker_popup.py](./TC003_Browse_the_public_map_and_view_a_marker_popup.py)
- **Test Error:** TEST BLOCKED

The public map feature could not be reached — an unexpected error modal prevents interacting with the map and its controls, and reload attempts did not recover the SPA.

Observations:
- A full-page error modal is shown with the message 'Terjadi Kesalahan' and a single 'Muat Ulang' button.
- No map controls, filters, or markers are visible; the page reports 0 other interactive elements.
- Clicking 'Muat Ulang' (two attempts) and forcing a reload did not remove the modal or restore the map.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/ab82bad5-aca5-41b0-b221-f81bfa11ddce
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Open the public map and browse infrastructure markers
- **Test Code:** [TC004_Open_the_public_map_and_browse_infrastructure_markers.py](./TC004_Open_the_public_map_and_browse_infrastructure_markers.py)
- **Test Error:** TEST FAILURE

The public map failed to load — the page displayed an unexpected error and the interactive map could not be found.

Observations:
- The page shows an error card with the title 'Terjadi Kesalahan' and a 'Muat Ulang' (Reload) button.
- No map container or marker elements were detected in the DOM or on the page (no #map, .leaflet-container, canvas, svg, .mapboxgl-canvas, or marker icons).

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/a10b40d2-1bd3-4afd-9674-1fc5dbb0846c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Search for an infrastructure and open its result on the map
- **Test Code:** [TC005_Search_for_an_infrastructure_and_open_its_result_on_the_map.py](./TC005_Search_for_an_infrastructure_and_open_its_result_on_the_map.py)
- **Test Error:** TEST BLOCKED

The public map UI could not be reached — the page shows an unexpected error overlay that prevents using the search and map features.

Observations:
- The page displays an error card with the heading 'Terjadi Kesalahan' and a 'Muat Ulang' button.
- No map, no infrastructure search input, and no map controls are present on the page, so the search and selection steps cannot be performed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/2aefb7ca-8f2d-4d62-afac-6e2598613950
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Filter the map by category and territory
- **Test Code:** [TC006_Filter_the_map_by_category_and_territory.py](./TC006_Filter_the_map_by_category_and_territory.py)
- **Test Error:** TEST BLOCKED

The public map page could not be reached — the UI remains in a loading/error state and filters and markers are not available, so the test cannot be executed.

Observations:
- The page shows a persistent loading spinner ('Memuat halaman...') and no interactive elements are present.
- The 'Muat Ulang' (Reload) action was used twice but the page did not recover to reveal filters or map markers.
- The DOM reports zero interactive elements, preventing selection of Category/Kecamatan/Nagari/Korong filters.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/e0de9195-2fa6-4f08-81e3-1e4d7043b0f2
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Open a marker popup and read location details
- **Test Code:** [TC007_Open_a_marker_popup_and_read_location_details.py](./TC007_Open_a_marker_popup_and_read_location_details.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the public map page shows an unexpected error and reload attempts did not restore the map, so markers cannot be accessed.

Observations:
- The page displays an error card 'Terjadi Kesalahan' with a 'Muat Ulang' button.
- Clicking 'Muat Ulang' twice left the page in an error/loading state and no interactive map markers were available.
- No map popup or marker UI was present to click and verify location details.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/a792ef57-ed92-4f17-9d0d-c3391bb2326f
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Create an infrastructure record with photo details
- **Test Code:** [TC008_Create_an_infrastructure_record_with_photo_details.py](./TC008_Create_an_infrastructure_record_with_photo_details.py)
- **Test Error:** TEST FAILURE

The infrastructure record was not created — the form submission was blocked by client-side validation and no new entry appeared in the table.

Observations:
- The 'Tambah Infrastruktur' modal remained open and a tooltip displayed: 'Please fill out this field.'
- No new infrastructure row is visible in the table; the existing entries remain listed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/ad6a1bb1-4b56-4d41-955d-86fcf093a720
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Create a new category
- **Test Code:** [TC009_Create_a_new_category.py](./TC009_Create_a_new_category.py)
- **Test Error:** TEST FAILURE

The category creation feature is accessible but does not work — inputs are not being accepted correctly and submitting the form does not add a category.

Observations:
- The Label input repeatedly truncates entered text (typed 'Jalan Raya' but field showed 'J').
- After submitting the create form the category list still shows 'Belum ada kategori.' (no new category appeared).
- Attempts to set the slug and color did not persist (slug remained empty/unchanged when typed).

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/ddeb1eab-4928-4121-96b8-662c77f15d02
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Switch the basemap while keeping map overlays available
- **Test Code:** [TC010_Switch_the_basemap_while_keeping_map_overlays_available.py](./TC010_Switch_the_basemap_while_keeping_map_overlays_available.py)
- **Test Error:** TEST BLOCKED

The public map could not be tested — the page shows an unexpected error and the map did not render, so the basemap toggle and overlays could not be accessed.

Observations:
- The page displays an error message 'Terjadi Kesalahan' with a 'Muat Ulang' button.
- No map canvas, basemap control, or overlay controls are visible on the page.
- Only interactive element present is the 'Muat Ulang' button, which indicates the app encountered an error before rendering the map.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/ad432d97-7347-4992-90db-62a14805d48c
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Browse and filter infrastructure records
- **Test Code:** [TC011_Browse_and_filter_infrastructure_records.py](./TC011_Browse_and_filter_infrastructure_records.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/e674730e-938f-4d0b-ad27-2ac9e8c7e485
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Create a statistics record
- **Test Code:** [TC012_Create_a_statistics_record.py](./TC012_Create_a_statistics_record.py)
- **Test Error:** TEST FAILURE

The admin interface did not accept and persist the new statistics entry. The create-statistics form and Wilayah selector are reachable, but typed field values did not persist and the newly submitted record is not visible in the table.

Observations:
- The create-statistics modal opened and Kecamatan 130501 was selectable.
- Typed values for Indikator, Nilai, Satuan, and Tahun did not persist (actual field values differed or remained empty after typing).
- After clicking 'Simpan', a search of the table did not find 'Automated Test Indicator 999'.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/4cbc5f67-2c84-4487-8e45-8e2934ac3498
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Review updated statistics after changing territory filters on mobile
- **Test Code:** [TC013_Review_updated_statistics_after_changing_territory_filters_on_mobile.py](./TC013_Review_updated_statistics_after_changing_territory_filters_on_mobile.py)
- **Test Error:** TEST BLOCKED

The public map page could not be tested because the UI failed to load an interactive map or controls. The error prevents opening the filter or statistics panels required by the test.

Observations:
- The page displays an error dialog with the text 'Terjadi Kesalahan' and a single 'Muat Ulang' (Reload) button.
- No filter or statistics panel controls are present or accessible on the page, only the reload action is available.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/52efeb3f-07ed-46d4-9882-978bafa5ea7d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Edit an infrastructure record
- **Test Code:** [TC014_Edit_an_infrastructure_record.py](./TC014_Edit_an_infrastructure_record.py)
- **Test Error:** TEST FAILURE

The infrastructure record could not be updated — changes were not saved to the table.

Observations:
- The infrastructure table still shows "Klinik Sehat Bersama" with coordinates "-0.5610, 100.1310".
- The edit modal did not accept the full name (the Name input value remained a single character 'K') and the Latitude/Longitude fields did not retain typed values.
- The Save action was clicked but no UI update or persisted change was observed in the table.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/3315c761-4722-41a2-ae43-510ed5ce56e6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Edit an existing category
- **Test Code:** [TC015_Edit_an_existing_category.py](./TC015_Edit_an_existing_category.py)
- **Test Error:** TEST FAILURE

Creating a category did not work — the add-category form did not accept the label and slug input, so no category could be created or edited.

Observations:
- The Kategori page shows 'Belum ada kategori.' and the category list remains empty.
- The 'Tambah Kategori' modal opened but typing the Label and Value fields repeatedly resulted in truncated or empty values (example: typed 'Jalan Raya' produced only 'J').
- Multiple attempts (7) to create a category through the UI failed and no new category appears in the list.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/59099885-1a02-45f6-b9b0-40ba3ecfcc7a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Open the admin dashboard from the protected root route
- **Test Code:** [TC016_Open_the_admin_dashboard_from_the_protected_root_route.py](./TC016_Open_the_admin_dashboard_from_the_protected_root_route.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/4c017f44-8ed7-45f9-a0ec-2340b0c8bd90
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Browse and filter statistics records
- **Test Code:** [TC017_Browse_and_filter_statistics_records.py](./TC017_Browse_and_filter_statistics_records.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/547a8076-1fc4-4935-87b6-7c07d41ffebf
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 View dashboard summary counts and navigate to management sections
- **Test Code:** [TC018_View_dashboard_summary_counts_and_navigate_to_management_sections.py](./TC018_View_dashboard_summary_counts_and_navigate_to_management_sections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/d7eb8a06-fa6a-4c10-bb79-a9bebdf519c7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Delete an unused category
- **Test Code:** [TC019_Delete_an_unused_category.py](./TC019_Delete_an_unused_category.py)
- **Test Error:** TEST BLOCKED

A prerequisite category could not be created through the admin UI, so the deletion test could not be run.

Observations:
- The 'Tambah Kategori' add form opened but input fields did not accept the full entered text (only a partial value appeared).
- Submitting the add form did not create a category; the page still shows 'Belum ada kategori.'

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/ac95c85e-cf2f-430b-87ce-bbd3f212ea72
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Edit a statistics record
- **Test Code:** [TC020_Edit_a_statistics_record.py](./TC020_Edit_a_statistics_record.py)
- **Test Error:** TEST FAILURE

Editing and saving an existing statistic did not work — changes to the Indikator and Nilai fields were not applied and the updated record did not appear in the table.

Observations:
- The Edit Data Statistik modal remains open with original values (Indikator='Luas Wilayah', Nilai='42.5').
- Multiple typing attempts reported the actual field values did not match the typed text (typed text truncated or not applied).
- A page search for the intended updated indicator name ('Luas Wilayah Updated') returned 0 matches in the table.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/c19703a6-13e1-4a39-b0ee-2e57faa31919
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Delete an infrastructure record
- **Test Code:** [TC021_Delete_an_infrastructure_record.py](./TC021_Delete_an_infrastructure_record.py)
- **Test Error:** TEST FAILURE

The infrastructure record was not removed after confirming deletion.

Observations:
- The deletion confirmation button 'Hapus' was clicked.
- The table still displays 'Klinik Sehat Bersama' after the confirmation (visible in the page and DOM).
- The deletion modal behavior showed ambiguity (modal persisted briefly) and no change to the list occurred.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/6c6a2d7b-99f2-4abf-8007-b1663169bd91
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Import infrastructure data from Excel
- **Test Code:** [TC022_Import_infrastructure_data_from_Excel.py](./TC022_Import_infrastructure_data_from_Excel.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the required Excel file is not available to upload from the test environment.

Observations:
- The Import Excel workflow opened and a file input (index 399) is visible.
- No file path 'infrastruktur.xlsx' was available to the agent for upload.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/0349405f-92b7-44be-8e32-b6531d3c23ef
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Delete a statistics record
- **Test Code:** [TC023_Delete_a_statistics_record.py](./TC023_Delete_a_statistics_record.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/0b4ff939-732a-49a4-9dcf-23ecdc0c9b36
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Export filtered infrastructure data
- **Test Code:** [TC024_Export_filtered_infrastructure_data.py](./TC024_Export_filtered_infrastructure_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/b597d563-b880-49f1-a2f9-83be53c5263a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Import statistics data from Excel
- **Test Code:** [TC025_Import_statistics_data_from_Excel.py](./TC025_Import_statistics_data_from_Excel.py)
- **Test Error:** TEST BLOCKED

A valid Excel (.xlsx) file is required to continue, but no accessible .xlsx file is available in the test environment to upload.

Observations:
- The Statistik page shows a file input that accepts .xlsx at element index 397.
- The test environment contains no provided Excel file/fixture to select for upload (no file available to attach).

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/1457f90d-395b-4605-a75b-250a070e103d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 See a login error for invalid admin credentials
- **Test Code:** [TC026_See_a_login_error_for_invalid_admin_credentials.py](./TC026_See_a_login_error_for_invalid_admin_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/17adf997-1690-4fa5-898b-5fe28d6548c5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Prevent deleting a category that is already in use
- **Test Code:** [TC027_Prevent_deleting_a_category_that_is_already_in_use.py](./TC027_Prevent_deleting_a_category_that_is_already_in_use.py)
- **Test Error:** TEST BLOCKED

The test could not be run — the UI prevents creating the prerequisite category so the deletion behavior cannot be verified.

Observations:
- The Kategori page shows 'Belum ada kategori.' and no categories are listed.
- The 'Tambah Kategori' modal opens but the text inputs only recorded the first character of typed values, so full label/slug could not be entered.
- After submitting the add form, no new category appears in the list.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/77d7b769-f98b-4042-85f2-02c75ac94101
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Export filtered statistics data
- **Test Code:** [TC028_Export_filtered_statistics_data.py](./TC028_Export_filtered_statistics_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/19745b52-674b-4527-846b-a56b7cba7d54/6bdd9570-8c2e-4158-9848-31bf899ce35a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **35.71** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---