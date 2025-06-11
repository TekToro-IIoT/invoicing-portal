-- TekToro Invoice Database Export
-- Generated on: June 10, 2025
-- Contains all invoice records, clients, users, and related data

-- ========================= USERS =========================
INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, created_at, updated_at, regular_rate, overtime_rate, username, password) VALUES
('masteradmin', 'admin@tektoro.com', 'Admin', 'User', '', 'admin', '2025-05-31 02:20:13.076903', '2025-05-31 23:30:14.937', 100, 150, 'masteradmin', '$2b$10$CRrv7f4VYDL1KsKw0eml7O4PhuW3mz1a2lN0..BH8zb03dDMFwLM.');

-- ========================= CLIENTS =========================
INSERT INTO clients (id, name, email, phone, address, city, state, zip_code, country, contact_person, user_id, created_at, updated_at, company_id) VALUES
(2, 'TekToro Digital IIoT Solutions Inc', 'billing@tektoro.com', '555-0123', '123 Main St', 'Houston', 'TX', '77001', 'United States', '', '42614138', '2025-05-31 20:46:17.269767', '2025-05-31 20:46:17.269767', 1),
(3, 'Headington Energy Partners', 'billing@headingtonenergy.com', '555-0456', '456 Energy Blvd', 'Dallas', 'TX', '75201', 'United States', '', '42614138', '2025-05-31 20:49:42.804177', '2025-05-31 20:49:42.804177', 2),
(5, 'Headington Energy Partners LLC', 'ap@headingtonenergy.com', '1 (361) 885-0110', '500 N Shoreline Blvd, Suite 902, Corpus Christi, TX 78401', 'Corpus Christi', 'TX', '78401', 'USA', '', '42614138', '2025-06-02 02:09:23.818665', '2025-06-02 02:09:23.818665', 2);

-- ========================= INVOICES =========================
INSERT INTO invoices (id, invoice_number, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, notes, user_id, created_at, updated_at, equipment_purchased_description, service_date) VALUES
(23, 'INV-TDS-2025-001', 5, '2025-05-01', '2025-07-31', 750.00, 0.00, 0.00, 750.00, 'sent', '- Discussions with Scott and Tucker about Pipeline Variance monitoring. 
- Implement these changes into the Daily production report and ignition system. 
- Transition systems from Crossroad to TekToro.', '42614138', '2025-06-02 02:09:23.883556', '2025-06-02 02:16:23.366', '', '2025-05-01'),
(24, 'INV-TDS-2025-002', 5, '2025-05-02', '2025-07-01', 1050.00, 0.00, 0.00, 1050.00, 'sent', '- Meter 965-4090 went to field with technician and reviewed programming. 
- Implement changes to PV report in Ignition. 
- Worked on maps in Ignition. Implement Visnaga Asset into SCADA system.', '42614138', '2025-06-02 02:27:06.701721', '2025-06-02 03:27:50.888', '', '2025-05-02'),
(25, 'INV-TDS-2025-003', 5, '2025-05-05', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Review and Troubleshoot Meter 965-4090 with field technician, review programming. 
- Worked on PV report and Daily Production report and made changes requested by HEP. 
- Working in the project to write custom scripting for map functions. 
- Working project scripts for the communication comms page. ', '42614138', '2025-06-02 02:31:58.036945', '2025-06-02 03:27:52.15', '', '2025-05-05'),
(26, 'INV-TDS-2025-004', 5, '2025-05-06', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Discussions with Scott, about morning Daily Report. Made adjustment in the system to meet Scotts request. 
- Worked on validating the new PV report data for import into Prodview. 
- Tested the script functions that were implemented this week. 
- Continued working on programming the map feature. Review KMZ files and filtered SCADA locations. 
', '42614138', '2025-06-02 03:00:05.120203', '2025-06-02 03:27:53.243', '', '2025-05-06'),
(27, 'INV-TDS-2025-005', 5, '2025-05-07', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP team. 
- Review and sort through KMZ file to associate the proper assets into the system. 
- Worked design and functionality of Map feature. 
- Continued to validate New PV report line by line to ensure accuracy. 
', '42614138', '2025-06-02 03:10:43.094632', '2025-06-02 03:27:54.848', '', '2025-05-07'),
(28, 'INV-TDS-2025-006', 5, '2025-05-08', '2025-07-01', 1200.00, 0.00, 0.00, 1200.00, 'sent', '- Communication with HEP 
- Programing of sorted map assets for KMZ Started to implement into the SCADA system.
- Setup development Gateway on local system to not disrupt production project when developing. 
- Continued to validate New PV data for implementation into Prodview. 
', '42614138', '2025-06-02 03:14:38.844626', '2025-06-02 03:27:56.675', '', '2025-05-08'),
(29, 'INV-TDS-2025-007', 5, '2025-05-09', '2025-07-01', 900.00, 0.00, 0.00, 900.00, 'sent', '- Communication with HEP 
- Continue working on Map feature. 
- Tested the new 544-4090 meter that was changed to new ETC C/M meter. 
- Validated new PV report for production data. 
', '42614138', '2025-06-02 03:25:16.885329', '2025-06-02 03:27:58.439', '', '2025-05-09'),
(30, 'INV-TDS-2025-008', 5, '2025-05-10', '2025-07-01', 750.00, 0.00, 0.00, 750.00, 'sent', '- Communication with HEP  
- Imported KMZ asset to ignition on the Test Gateway . 
- continued SCADA programming', '42614138', '2025-06-02 03:31:59.518924', '2025-06-02 03:27:59.721', '', '2025-05-10'),
(31, 'INV-TDS-2025-009', 5, '2025-05-13', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Communication with HEP  
- 562-3020 went to field with Ryder and Reviewed meter. 
- 544-4090 in communication, meter swapped out for ETC C/M meter. 
- 8177-3512 meter ETC sales meter troubleshoot communication issue. 
- Continued SCADA programming', '42614138', '2025-06-02 03:44:48.82084', '2025-06-02 03:28:01.046', '', '2025-05-13'),
(32, 'INV-TDS-2025-010', 5, '2025-05-14', '2025-07-01', 1200.00, 0.00, 0.00, 1200.00, 'sent', '- Communication with HEP  
- Review meter 965-4090 with field Technician. Communication was lost with meter. Worked on the meter to restore communications. 
- Continued SCADA programming. ', '42614138', '2025-06-02 03:50:06.697468', '2025-06-02 03:28:02.448', '', '2025-05-14'),
(33, 'INV-TDS-2025-011', 5, '2025-05-15', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Communication with HEP Team 
- Meter 965-4090 Meter issue resolved and back communicating. 
- Continued SCADA programming and map feature development. ', '42614138', '2025-06-02 03:58:31.334433', '2025-06-02 03:28:03.795', '', '2025-05-15'),
(34, 'INV-TDS-2025-012', 5, '2025-05-16', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP 
- Continued working on Map feature and SCADA programming.', '42614138', '2025-06-02 04:10:52.524069', '2025-06-02 03:28:05.034', '', '2025-05-16'),
(35, 'INV-TDS-2025-013', 5, '2025-05-17', '2025-07-01', 1200.00, 0.00, 0.00, 1200.00, 'sent', '- Communication with HEP  
- Meter 965-4080 was reviewed with field technician. Issue with the SOGu functionality. 
- continued SCADA Programming.', '42614138', '2025-06-02 04:18:38.050831', '2025-06-02 03:28:06.308', '', '2025-05-17'),
(36, 'INV-TDS-2025-014', 5, '2025-05-20', '2025-07-01', 750.00, 0.00, 0.00, 750.00, 'sent', '- Communication with HEP  
- Meter 923-3188 Review with field Technician, Risken #6 meter was reviewed for communication issue. 
- Continued SCADA programming . ', '42614138', '2025-06-02 04:25:58.628654', '2025-06-02 03:28:07.603', '', '2025-05-20'),
(37, 'INV-TDS-2025-015', 5, '2025-05-21', '2025-07-01', 750.00, 0.00, 0.00, 750.00, 'sent', '- Communication with HEP  
- Meter 923-3023 Mifflin Flash Gas Communication Issue. In the field with technician and reviewed meter and communication restored. 
- Continued SCADA programming . ', '42614138', '2025-06-02 04:32:20.570516', '2025-06-02 03:28:08.927', '', '2025-05-21'),
(38, 'INV-TDS-2025-016', 5, '2025-05-22', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP  
- Continued SCADA programming and Map feature development. ', '42614138', '2025-06-02 04:38:14.838651', '2025-06-02 03:28:10.21', '', '2025-05-22'),
(39, 'INV-TDS-2025-017', 5, '2025-05-23', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP  
- Continued SCADA programming and Map feature development. ', '42614138', '2025-06-02 04:46:51.844532', '2025-06-02 03:28:11.526', '', '2025-05-23'),
(40, 'INV-TDS-2025-018', 5, '2025-05-24', '2025-07-01', 900.00, 0.00, 0.00, 900.00, 'sent', '- Communication with HEP  
- Continued SCADA programming . ', '42614138', '2025-06-02 04:52:44.977063', '2025-06-02 03:28:12.833', '', '2025-05-24'),
(41, 'INV-TDS-2025-019', 5, '2025-05-27', '2025-07-01', 1200.00, 0.00, 0.00, 1200.00, 'sent', '- Communication with HEP  
- Continued SCADA programming . ', '42614138', '2025-06-02 04:57:23.301423', '2025-06-02 03:28:14.129', '', '2025-05-27'),
(42, 'INV-TDS-2025-020', 5, '2025-05-28', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP  
- Went to field with technician to investigate Risken #5 923-3185 meter. Found communication  issue with cable. Replaced cable and meter is back communicating. 
- Continued SCADA programming. ', '42614138', '2025-06-02 05:04:36.346516', '2025-06-02 03:28:15.475', '', '2025-05-28'),
(43, 'INV-TDS-2025-021', 5, '2025-05-29', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Communication with HEP  
- Went to field with technician to Commission new meter 544-5020 . Meter was setup and commissioning completed. 
- Continue ignition system development. ', '42614138', '2025-06-10 00:21:22.568086', '2025-06-02 03:28:16.777', '', '2025-05-29'),
(44, 'INV-TDS-2025-022', 5, '2025-05-30', '2025-07-01', 1350.00, 0.00, 0.00, 1350.00, 'sent', '- Communication with HEP  
- Went to field with technician to work on LG Master Meter at 544-5020. Setup and Configuration were completed. 
- Continue ignition system development. ', '42614138', '2025-06-10 00:33:46.607598', '2025-06-02 03:28:18.093', '', '2025-05-30'),
(45, 'INV-TDS-2025-023', 5, '2025-05-31', '2025-07-01', 1200.00, 0.00, 0.00, 1200.00, 'sent', '- Communication with HEP  
- Went to field with technician to verify meter 544-5020 LG master meter is reading accurate. Verifications is completed. 
- Continue ignition system development. ', '42614138', '2025-06-10 00:44:31.942717', '2025-06-02 03:28:19.362', '', '2025-05-31'),
(46, 'INV-TDS-2025-024', 5, '2025-06-03', '2025-07-01', 1500.00, 0.00, 0.00, 1500.00, 'sent', '- Communication with HEP  
- Went to field and to troubleshoot two meter at Tullidos Battery, LM7600 and LM7650 meter had communication Issue. Issue was resolved and both meter are back communicating. 
- Continue ignition system development. ', '42614138', '2025-06-10 00:52:22.864327', '2025-06-10 00:52:22.864327', '', '2025-06-03');

-- ========================= INVOICE ITEMS =========================
INSERT INTO invoice_items (id, invoice_id, time_entry_id, rate, amount, created_at, service_point, afe_loe, afe_number, well_name, well_number, service, hrs, qty, job_code) VALUES
(66, 23, NULL, 150.00, 750.00, '2025-06-02 02:09:23.934164', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA System ', 5.00, 0.00, 'HEP'),
(76, 24, NULL, 150.00, 300.00, '2025-06-02 02:27:06.75834', '965-4090', '-', '-', '-', '-', 'Meter Troubleshoot', 2.00, 0.00, 'HEP'),
(77, 24, NULL, 150.00, 300.00, '2025-06-02 02:27:06.809979', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA System ', 2.00, 0.00, 'HEP'),
(78, 24, NULL, 150.00, 450.00, '2025-06-02 02:27:06.856581', 'Visnaga', '', '', '', '', 'SCADA Programming', 3.00, 0.00, 'HEP'),
(91, 25, NULL, 150.00, 300.00, '2025-06-02 03:07:04.431276', '965-4090', '-', '-', 'Hilcorp C/M', '', 'Meter Troubleshoot', 2.00, 0.00, 'HEP'),
(92, 25, NULL, 150.00, 450.00, '2025-06-02 03:07:04.488623', 'PV Report', '-', '-', '-', '-', 'SCADA Programming', 3.00, 0.00, 'HEP'),
(93, 25, NULL, 150.00, 750.00, '2025-06-02 03:07:04.535019', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 5.00, 0.00, 'HEP'),
(94, 26, NULL, 150.00, 1500.00, '2025-06-02 03:07:12.656085', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 10.00, 0.00, 'HEP'),
(96, 27, NULL, 150.00, 1350.00, '2025-06-02 03:13:21.337611', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 9.00, 0.00, 'HEP'),
(98, 28, NULL, 150.00, 1200.00, '2025-06-02 03:18:32.809673', 'Ignition GAteway', '-', '-', '-', '-', 'SCADA Programming', 8.00, 0.00, 'HEP'),
(99, 29, NULL, 150.00, 900.00, '2025-06-02 03:26:00.62466', '-', '-', '-', '-', '-', 'SCADA Programming', 6.00, 0.00, 'HEP'),
(100, 30, NULL, 150.00, 750.00, '2025-06-02 03:32:36.826018', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 5.00, 0.00, 'HEP'),
(108, 31, NULL, 150.00, 150.00, '2025-06-02 03:45:59.601857', '562-3020', '', '', '', 'KR DR2205', '562-3020', 1.00, 0.00, 'HEP'),
(109, 31, NULL, 150.00, 150.00, '2025-06-02 03:45:59.655595', '544-4090', '-', '-', 'ETC C/M', '-', 'SCADA Programming ', 1.00, 0.00, 'HEP'),
(110, 31, NULL, 150.00, 150.00, '2025-06-02 03:45:59.700815', '8177-3512', '-', '-', 'ETC Sales ', '-', 'SCADA Programing', 1.00, 0.00, 'HEP'),
(111, 31, NULL, 150.00, 1050.00, '2025-06-02 03:45:59.747548', 'Ignition Gateway', '-', '-', '', '', 'SCADA Programming', 7.00, 0.00, 'HEP'),
(112, 32, NULL, 150.00, 450.00, '2025-06-02 03:51:29.03055', '965-4090', '-', '-', 'Hillcorp CM', '', 'Meter Troubleshoot', 3.00, 0.00, 'HEP'),
(113, 32, NULL, 150.00, 750.00, '2025-06-02 03:51:29.081704', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 5.00, 0.00, 'HEP'),
(116, 34, NULL, 150.00, 1350.00, '2025-06-02 04:11:35.988998', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming ', 9.00, 0.00, 'HEP'),
(117, 35, NULL, 150.00, 300.00, '2025-06-02 04:19:26.776869', '965-4080', '-', '-', 'Hillcorp SOGU', '-', 'Meter troubleshooting', 2.00, 0.00, 'HEP'),
(118, 35, NULL, 150.00, 900.00, '2025-06-02 04:19:26.829815', 'Ignition Gateway ', '', '', '', '', 'SCADA Programming', 6.00, 0.00, 'HEP'),
(119, 36, NULL, 150.00, 600.00, '2025-06-02 04:26:40.042602', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 4.00, 0.00, 'HEP'),
(120, 36, NULL, 150.00, 150.00, '2025-06-02 04:26:40.095306', '923-3188', '-', '-', '-', 'Risken 6', 'Meter TroubleShoot', 1.00, 0.00, 'HEP'),
(121, 37, NULL, 150.00, 300.00, '2025-06-02 04:33:05.765239', '923-3023', '-', '-', 'Mifflin Flash Gas ', '', 'Meter Troubleshoot', 2.00, 0.00, 'HEP'),
(122, 37, NULL, 150.00, 450.00, '2025-06-02 04:33:05.819293', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 3.00, 0.00, 'HEP'),
(123, 38, NULL, 150.00, 1350.00, '2025-06-02 04:38:59.941888', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 9.00, 0.00, 'HEP'),
(125, 39, NULL, 150.00, 1350.00, '2025-06-02 04:47:23.093987', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming ', 9.00, 0.00, 'HEP'),
(126, 40, NULL, 150.00, 900.00, '2025-06-02 04:53:17.247264', 'Ignition Gateway', '-', '-', '-', '- ', 'SCADA Programming', 6.00, 0.00, 'HEP'),
(127, 41, NULL, 150.00, 1200.00, '2025-06-02 04:58:00.440415', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 8.00, 0.00, 'HEP'),
(128, 33, NULL, 150.00, 300.00, '2025-06-10 00:00:40.307315', '965-4090', '-', '-', '', '-', 'Meter Troubleshoot', 2.00, 0.00, 'HEP'),
(129, 33, NULL, 150.00, 1200.00, '2025-06-10 00:00:40.368277', 'Ignition Gateway', '-', '-', '-', '-', 'SCADA Programming', 8.00, 0.00, 'HEP'),
(142, 43, NULL, 150.00, 900.00, '2025-06-10 00:23:13.265873', '544-5020', '', '', '', '', 'New Meter Commissioning', 6.00, 0.00, 'HEP'),
(143, 43, NULL, 150.00, 600.00, '2025-06-10 00:23:13.31846', 'Ignition system', '', '', '', '', 'Ignition System', 4.00, 0.00, 'HEP'),
(145, 44, NULL, 150.00, 300.00, '2025-06-10 00:34:52.692075', '544-5020', '', '', '', '', 'LG Master Meter', 2.00, 0.00, 'HEP'),
(146, 44, NULL, 150.00, 1050.00, '2025-06-10 00:34:52.752258', 'Ignition System', '', '', '', '', 'Ignition System', 7.00, 0.00, 'HEP'),
(147, 45, NULL, 150.00, 150.00, '2025-06-10 00:45:41.028713', '544-5020', '', '', '', '', 'Meter Verification', 1.00, 0.00, 'HEP'),
(148, 45, NULL, 150.00, 1050.00, '2025-06-10 00:45:41.081221', 'Ignition System', '', '', '', '', 'Ignition system ', 7.00, 0.00, 'HEP'),
(149, 46, NULL, 150.00, 300.00, '2025-06-10 00:53:39.972132', 'Tullidos', '', '', '', 'LM7600', 'Meter Troubleshoot ', 2.00, 0.00, 'HEP'),
(150, 46, NULL, 150.00, 300.00, '2025-06-10 00:53:40.021076', 'Tullidos', '', '', '', 'LM7650', 'Meter Troubleshoot', 2.00, 0.00, 'HEP'),
(151, 46, NULL, 150.00, 900.00, '2025-06-10 00:53:40.066374', 'Ignition System ', '', '', '', '', 'Ignition System ', 6.00, 0.00, 'HEP'),
(152, 42, NULL, 150.00, 150.00, '2025-06-10 00:55:17.512022', 'Risken #5', '', '', '', '923-3185', 'Meter TroubleShoot', 1.00, 0.00, 'HEP'),
(153, 42, NULL, 150.00, 1200.00, '2025-06-10 00:55:17.568573', 'Ignition System', '', '', '', '', 'Ignition System', 8.00, 0.00, 'HEP');

-- ========================= SUMMARY =========================
-- Total Records Exported:
-- - Users: 1 record
-- - Clients: 3 records  
-- - Invoices: 24 records
-- - Invoice Items: 36 records
-- 
-- Total Invoice Value: $28,350.00
-- Date Range: May 1, 2025 - June 3, 2025
-- Primary Client: Headington Energy Partners LLC
-- Services: SCADA Programming, Meter Troubleshooting, System Development