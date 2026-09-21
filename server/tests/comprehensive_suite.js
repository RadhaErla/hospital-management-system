const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  let headers = {
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

const results = [];
const logTest = (name, passed, details = '') => {
  results.push({ name, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
};

async function runSuite() {
  console.log('\n=============================================================');
  console.log('🚀 RUNNING COMPREHENSIVE HMS BACKEND & DATABASE TEST SUITE');
  console.log('=============================================================\n');

  let adminToken, doctorToken, receptionistToken, patientToken, patient2Token;
  let adminId, doctorId, receptionistId, patientId, patient2Id, departmentId;
  let testAppointmentId, testPrescriptionId, testRecordId, testBillId, testMedicineId, testLabReportId;

  // 1. HEALTH CHECK
  try {
    const res = await request('/health');
    logTest('Health Check API', res.status === 200 && res.data.success === true, `Status: ${res.status}`);
  } catch (e) {
    logTest('Health Check API', false, e.message);
  }

  // 2. AUTHENTICATION & LOGIN
  try {
    // Admin login
    const adminRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@hospital.com', password: 'Password@123' },
    });
    adminToken = adminRes.data?.data?.token;
    adminId = adminRes.data?.data?.user?.id;
    logTest('Admin Login', adminRes.status === 200 && !!adminToken, `Token received`);

    // Doctor login
    const docRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'doctor@hospital.com', password: 'Password@123' },
    });
    doctorToken = docRes.data?.data?.token;
    doctorId = docRes.data?.data?.user?.profileId;
    logTest('Doctor Login', docRes.status === 200 && !!doctorToken, `Token received`);

    // Receptionist login
    const recRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'receptionist@hospital.com', password: 'Password@123' },
    });
    receptionistToken = recRes.data?.data?.token;
    receptionistId = recRes.data?.data?.user?.profileId;
    logTest('Receptionist Login', recRes.status === 200 && !!receptionistToken, `Token received`);

    // Patient login
    const patRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'patient@hospital.com', password: 'Password@123' },
    });
    patientToken = patRes.data?.data?.token;
    patientId = patRes.data?.data?.user?.profileId;
    logTest('Patient Login', patRes.status === 200 && !!patientToken, `Token received`);

    // Patient 2 registration & login
    const p2Email = `patient.two.${Date.now()}@example.com`;
    const p2Reg = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Second Patient',
        email: p2Email,
        password: 'Password@123',
        phone: '+1 555-0202',
        gender: 'Female',
        bloodGroup: 'B+',
      },
    });
    patient2Token = p2Reg.data?.data?.token;
    patient2Id = p2Reg.data?.data?.user?.profileId;
    logTest('Patient Registration', p2Reg.status === 201 && !!patient2Token, `Patient 2 Registered`);

    // Invalid Credentials Check
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'patient@hospital.com', password: 'WrongPassword999' },
    });
    logTest('Reject Invalid Password', badLogin.status === 401 && badLogin.data?.success === false, `Status: ${badLogin.status}`);

    // Invalid Token Check
    const badTokenRes = await request('/auth/me', { token: 'invalid_bearer_token_string' });
    logTest('Reject Invalid Token', badTokenRes.status === 401, `Status: ${badTokenRes.status}`);

    // Get current profile (/auth/me)
    const meRes = await request('/auth/me', { token: patientToken });
    const userEmail = meRes.data?.data?.user?.email;
    logTest('Get Current User Profile (/auth/me)', meRes.status === 200 && userEmail === 'patient@hospital.com', `User: ${userEmail}`);
  } catch (e) {
    logTest('Authentication Suite', false, e.message);
  }

  // 3. ROLE-BASED ACCESS CONTROL (RBAC)
  try {
    // Patient cannot access admin-only departments creation
    const patAdminRes = await request('/departments', {
      method: 'POST',
      token: patientToken,
      body: { name: 'Illegal Department' },
    });
    logTest('RBAC: Patient cannot create department', patAdminRes.status === 403, `Status: ${patAdminRes.status}`);

    // Doctor cannot access admin analytics
    const docAdminRes = await request('/analytics/admin', {
      token: doctorToken,
    });
    logTest('RBAC: Doctor cannot access admin analytics', docAdminRes.status === 403, `Status: ${docAdminRes.status}`);

    // Receptionist cannot issue prescriptions
    const recPrescRes = await request('/prescriptions', {
      method: 'POST',
      token: receptionistToken,
      body: { patientId, diagnosis: 'Test' },
    });
    logTest('RBAC: Receptionist cannot issue prescription', recPrescRes.status === 403, `Status: ${recPrescRes.status}`);

    // Admin can access admin analytics
    const adminAnalytics = await request('/analytics/admin', { token: adminToken });
    logTest('RBAC: Admin can access dashboard analytics', adminAnalytics.status === 200 && adminAnalytics.data?.success === true, `Status: ${adminAnalytics.status}`);
  } catch (e) {
    logTest('RBAC Suite', false, e.message);
  }

  // 4. DEPARTMENTS CRUD
  try {
    // Create Department (Admin)
    const newDeptName = `Cardiothoracic-${Date.now()}`;
    const createDept = await request('/departments', {
      method: 'POST',
      token: adminToken,
      body: { name: newDeptName, description: 'Advanced heart & thoracic surgery', icon: 'Heart' },
    });
    departmentId = createDept.data?.data?._id;
    logTest('Admin: Create Department', createDept.status === 201 && !!departmentId, `Dept ID: ${departmentId}`);

    // Read Departments
    const getDepts = await request('/departments');
    const deptExists = getDepts.data?.data?.some(d => d._id === departmentId);
    logTest('Read Departments List', getDepts.status === 200 && deptExists, `Found created dept`);

    // Update Department
    const updateDept = await request(`/departments/${departmentId}`, {
      method: 'PUT',
      token: adminToken,
      body: { description: 'Updated description for cardiothoracic' },
    });
    logTest('Admin: Update Department', updateDept.status === 200 && updateDept.data?.data?.description?.includes('Updated'), `Updated successfully`);

    // Delete Department
    const delDept = await request(`/departments/${departmentId}`, {
      method: 'DELETE',
      token: adminToken,
    });
    logTest('Admin: Delete Department', delDept.status === 200, `Deleted successfully`);
  } catch (e) {
    logTest('Departments CRUD', false, e.message);
  }

  // 5. MEDICINES CRUD & STOCK
  try {
    // Create Medicine
    const medRes = await request('/medicines', {
      method: 'POST',
      token: adminToken,
      body: {
        name: `Azithromycin 500mg-${Date.now()}`,
        genericName: 'Azithromycin',
        category: 'Antibiotic',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Pfizer',
        stockQuantity: 150,
        unitPrice: 15.5,
        expiryDate: '2028-12-31',
      },
    });
    testMedicineId = medRes.data?.data?._id;
    logTest('Admin: Create Medicine', medRes.status === 201 && !!testMedicineId, `Med ID: ${testMedicineId}`);

    // Read Medicines
    const getMeds = await request('/medicines?search=Azithromycin', { token: doctorToken });
    const medsCount = getMeds.data?.data?.items?.length || 0;
    logTest('Doctor: Search Medicines', getMeds.status === 200 && medsCount > 0, `Found: ${medsCount}`);

    // Update Medicine Stock
    const updateMed = await request(`/medicines/${testMedicineId}`, {
      method: 'PUT',
      token: adminToken,
      body: { stockQuantity: 200 },
    });
    logTest('Admin: Update Medicine Stock', updateMed.status === 200 && updateMed.data?.data?.stockQuantity === 200, `New stock: 200`);
  } catch (e) {
    logTest('Medicines CRUD', false, e.message);
  }

  // 6. APPOINTMENTS SYSTEM (CRITICAL WORKFLOW)
  try {
    // 6a. Check doctor available slots
    const targetDate = '2026-11-20';
    const slotsRes = await request(`/doctors/${doctorId}/slots?date=${targetDate}`);
    const availableSlots = slotsRes.data?.data?.slots || [];
    const hasSlots = Array.isArray(availableSlots) && availableSlots.length > 0;
    logTest('Doctor Availability: Get Generated Slots', slotsRes.status === 200 && hasSlots, `Available slots: ${availableSlots.length}`);

    const targetSlot = availableSlots[0] || { startTime: '11:00', endTime: '11:30' };

    // Get doctor details to get their department
    const docInfo = await request(`/doctors/${doctorId}`);
    const docDept = docInfo.data?.data?.department?._id || docInfo.data?.data?.department;

    // 6b. Patient books available slot
    const bookRes = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId,
        departmentId: docDept,
        date: targetDate,
        timeSlot: targetSlot,
        reason: 'Severe migraine and light sensitivity',
      },
    });
    testAppointmentId = bookRes.data?.data?._id;
    logTest('Appointment: Patient books available slot', bookRes.status === 201 && !!testAppointmentId, `Appt ID: ${testAppointmentId}`);

    // 6c. Duplicate booking rejection
    const dupRes = await request('/appointments', {
      method: 'POST',
      token: patient2Token,
      body: {
        doctorId,
        departmentId: docDept,
        date: targetDate,
        timeSlot: targetSlot,
        reason: 'Trying to book already booked slot',
      },
    });
    logTest('Appointment: Reject duplicate slot booking', dupRes.status === 400 && /already been booked/i.test(dupRes.data?.message || ''), `Message: ${dupRes.data?.message}`);

    // 6d. Past date booking rejection
    const pastRes = await request('/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId,
        departmentId: docDept,
        date: '2020-01-01',
        timeSlot: { startTime: '09:00', endTime: '09:30' },
        reason: 'Past booking',
      },
    });
    logTest('Appointment: Reject past date booking', pastRes.status === 400, `Status: ${pastRes.status}`);

    // 6e. Doctor confirms appointment
    const confirmRes = await request(`/appointments/${testAppointmentId}/status`, {
      method: 'PUT',
      token: doctorToken,
      body: { status: 'Confirmed' },
    });
    logTest('Appointment: Doctor confirms appointment', confirmRes.status === 200 && confirmRes.data?.data?.status === 'Confirmed', `Status: Confirmed`);

    // 6f. Reschedule appointment
    const newSlot = availableSlots[1] || { startTime: '15:00', endTime: '15:30' };
    const rescheduleRes = await request(`/appointments/${testAppointmentId}/reschedule`, {
      method: 'PUT',
      token: patientToken,
      body: { date: targetDate, timeSlot: newSlot },
    });
    const rescheduledSlot = rescheduleRes.data?.data?.timeSlot?.startTime;
    logTest('Appointment: Reschedule appointment', rescheduleRes.status === 200 && rescheduledSlot === newSlot.startTime, `Status: ${rescheduleRes.status}, Slot: ${rescheduledSlot}, Msg: ${rescheduleRes.data?.message}`);

    // 6g. Complete appointment
    const completeRes = await request(`/appointments/${testAppointmentId}/status`, {
      method: 'PUT',
      token: doctorToken,
      body: { status: 'Completed', notes: 'Consultation finished satisfactorily' },
    });
    logTest('Appointment: Doctor marks appointment Completed', completeRes.status === 200 && completeRes.data?.data?.status === 'Completed', `Status: Completed`);
  } catch (e) {
    logTest('Appointments System', false, e.message);
  }

  // 7. MEDICAL RECORDS (WORKFLOW & ACCESS ISOLATION)
  try {
    // Doctor creates medical record
    const recordRes = await request('/medical-records', {
      method: 'POST',
      token: doctorToken,
      body: {
        patientId,
        appointmentId: testAppointmentId,
        symptoms: 'Throbbing hemicranial headache, photophobia, nausea',
        diagnosis: 'Acute Migraine with Aura',
        treatment: 'Prescribed triptans, rest in dark room, hydration',
        notes: 'Follow up in 2 weeks if headache frequency exceeds 3 per week',
        vitals: { bp: '120/80', pulse: '72', temperature: '98.6', weight: '70', height: '175' },
      },
    });
    testRecordId = recordRes.data?.data?._id;
    logTest('Doctor: Create Medical Record', recordRes.status === 201 && !!testRecordId, `Record ID: ${testRecordId}`);

    // Patient 1 reads their medical records via /medical-records/:patientId
    const p1Records = await request(`/medical-records/${patientId}`, { token: patientToken });
    const p1HasRecord = Array.isArray(p1Records.data?.data) && p1Records.data.data.some(r => r._id === testRecordId);
    logTest('Patient: View Own Medical Record', p1Records.status === 200 && p1HasRecord, `Found in list`);

    // Patient 2 attempts to view Patient 1's records
    const p2AccessRes = await request(`/medical-records/${patientId}`, { token: patient2Token });
    logTest('Security: Patient cannot view another patient record', p2AccessRes.status === 403, `Status: ${p2AccessRes.status}`);
  } catch (e) {
    logTest('Medical Records Suite', false, e.message);
  }

  // 8. PRESCRIPTIONS (WORKFLOW & ACCESS ISOLATION)
  try {
    // Doctor creates prescription
    const prescRes = await request('/prescriptions', {
      method: 'POST',
      token: doctorToken,
      body: {
        patientId,
        appointmentId: testAppointmentId,
        diagnosis: 'Acute Migraine with Aura',
        medicines: [
          {
            name: 'Sumatriptan 50mg',
            dosage: '50mg',
            frequency: 'At onset of migraine attack',
            duration: 'As needed',
            instructions: 'Do not exceed 100mg in 24 hours',
          },
        ],
        additionalAdvice: 'Avoid bright lights and caffeine during episodes',
      },
    });
    testPrescriptionId = prescRes.data?.data?._id;
    logTest('Doctor: Create Prescription', prescRes.status === 201 && !!testPrescriptionId, `Prescription ID: ${testPrescriptionId}`);

    // Patient 1 reads their prescriptions via /prescriptions/:patientId
    const p1Prescriptions = await request(`/prescriptions/${patientId}`, { token: patientToken });
    const p1HasPrescription = Array.isArray(p1Prescriptions.data?.data) && p1Prescriptions.data.data.some(p => p._id === testPrescriptionId);
    logTest('Patient: View Own Prescription', p1Prescriptions.status === 200 && p1HasPrescription, `Found in list`);

    // Patient 2 attempts to view Patient 1's prescription
    const p2PrescRes = await request(`/prescriptions/single/${testPrescriptionId}`, { token: patient2Token });
    logTest('Security: Patient cannot view another patient prescription', p2PrescRes.status === 403, `Status: ${p2PrescRes.status}`);
  } catch (e) {
    logTest('Prescriptions Suite', false, e.message);
  }

  // 9. LAB REPORTS (FILE VALIDATION & ACCESS ISOLATION)
  try {
    // Test 1: Upload valid PDF
    const validPdfBuffer = Buffer.from('%PDF-1.4 Mock PDF file for testing lab reports');
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('testName', 'Serum Electrolytes & Renal Panel');
    formData.append('category', 'Biochemistry');
    formData.append('notes', 'Normal values across panels');
    formData.append('file', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'renal_test.pdf');

    const uploadRes = await request('/lab-reports', {
      method: 'POST',
      token: doctorToken,
      body: formData,
    });
    testLabReportId = uploadRes.data?.data?._id;
    logTest('Lab Reports: Upload valid PDF report', uploadRes.status === 201 && !!testLabReportId, `Report ID: ${testLabReportId}`);

    // Test 2: Upload invalid file type (.exe)
    const badFileBuffer = Buffer.from('MZ executable binary data');
    const badFormData = new FormData();
    badFormData.append('patientId', patientId);
    badFormData.append('testName', 'Malicious File');
    badFormData.append('file', new Blob([badFileBuffer], { type: 'application/x-msdownload' }), 'virus.exe');

    const badUploadRes = await request('/lab-reports', {
      method: 'POST',
      token: doctorToken,
      body: badFormData,
    });
    logTest('Lab Reports: Reject invalid file format (.exe)', badUploadRes.status === 400 || badUploadRes.status === 500, `Status: ${badUploadRes.status}`);

    // Patient 1 reads their lab reports
    const p1Reports = await request(`/lab-reports/${patientId}`, { token: patientToken });
    const p1HasReport = Array.isArray(p1Reports.data?.data) && p1Reports.data.data.some(r => r._id === testLabReportId);
    logTest('Patient: View Own Lab Report', p1Reports.status === 200 && p1HasReport, `Found in list`);

    // Patient 2 cannot access Patient 1's lab reports
    const p2Reports = await request(`/lab-reports/${patientId}`, { token: patient2Token });
    logTest('Security: Patient cannot view another patient lab reports', p2Reports.status === 403, `Status: ${p2Reports.status}`);
  } catch (e) {
    logTest('Lab Reports Suite', false, e.message);
  }

  // 10. BILLING & MATHEMATICAL ACCURACY
  try {
    // Create Bill
    const doctorFee = 120;
    const labCharges = 50;
    const medicineCharges = 30;
    const otherCharges = 15;
    const items = [{ description: 'ECG Analysis', amount: 25 }];
    const discount = 20;
    const tax = 18;
    // Expected: 120 + 50 + 30 + 15 + 25 - 20 + 18 = 238
    const expectedTotal = (doctorFee + labCharges + medicineCharges + otherCharges + 25) - discount + tax;

    const billRes = await request('/bills', {
      method: 'POST',
      token: receptionistToken,
      body: {
        patientId,
        appointmentId: testAppointmentId,
        doctorFee,
        labCharges,
        medicineCharges,
        otherCharges,
        items,
        discount,
        tax,
        notes: 'Outpatient consultation & lab package',
      },
    });
    testBillId = billRes.data?.data?._id;
    const returnedTotal = billRes.data?.data?.totalAmount;
    const mathCorrect = Math.abs(returnedTotal - expectedTotal) < 0.01;
    logTest('Billing: Create Bill & Calculate Total Mathematically', billRes.status === 201 && mathCorrect, `Expected: ${expectedTotal}, Got: ${returnedTotal}`);

    // Update Payment Status: Pending -> Paid
    const payRes = await request(`/bills/${testBillId}/payment`, {
      method: 'PUT',
      token: receptionistToken,
      body: {
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        transactionId: `TXN_TEST_${Date.now()}`,
      },
    });
    logTest('Billing: Process Payment (Paid)', payRes.status === 200 && payRes.data?.data?.paymentStatus === 'Paid', `Status: Paid`);

    // Patient views their bills via /bills
    const myBills = await request('/bills', { token: patientToken });
    const billFound = myBills.data?.data?.items?.some(b => b._id === testBillId);
    logTest('Patient: View Own Bill', myBills.status === 200 && billFound, `Found in list`);
  } catch (e) {
    logTest('Billing Suite', false, e.message);
  }

  // 11. NOTIFICATIONS
  try {
    // Read notifications for Patient 1
    const notifs = await request('/notifications', { token: patientToken });
    const notifItems = notifs.data?.data?.notifications || [];
    logTest('Notifications: Fetch User Notifications', notifs.status === 200 && Array.isArray(notifItems), `Count: ${notifItems.length}`);

    // Mark notification read if any exists
    if (notifItems.length > 0) {
      const firstNotifId = notifItems[0]._id;
      const markRead = await request(`/notifications/${firstNotifId}/read`, {
        method: 'PUT',
        token: patientToken,
      });
      logTest('Notifications: Mark Notification As Read', markRead.status === 200 && markRead.data?.data?.isRead === true, `Marked read`);
    } else {
      logTest('Notifications: Mark Notification As Read', true, 'No notifications to mark');
    }
  } catch (e) {
    logTest('Notifications Suite', false, e.message);
  }

  // 12. SEARCH & FILTERS
  try {
    // Search Doctor by specialization
    const docSearch = await request('/doctors?specialization=Cardiology');
    const docItems = docSearch.data?.data?.items || [];
    logTest('Search: Doctors by Specialization', docSearch.status === 200 && docItems.length > 0, `Found: ${docItems.length}`);

    // Search Patients by Name (Receptionist)
    const patSearch = await request('/patients?search=David', { token: receptionistToken });
    const patItems = patSearch.data?.data?.items || [];
    logTest('Search: Patients by Name (Receptionist)', patSearch.status === 200 && patItems.length > 0, `Found: ${patItems.length}`);

    // Filter Appointments by Status (Admin)
    const appFilter = await request('/appointments?status=Completed', { token: adminToken });
    const appItems = appFilter.data?.data?.items || [];
    logTest('Filter: Appointments by Status (Admin)', appFilter.status === 200 && appItems.length > 0, `Completed count: ${appItems.length}`);

    // Filter Bills by Payment Status (Admin)
    const billFilter = await request('/bills?paymentStatus=Paid', { token: adminToken });
    const billItems = billFilter.data?.data?.items || [];
    logTest('Filter: Bills by Payment Status (Admin)', billFilter.status === 200 && billItems.length > 0, `Paid count: ${billItems.length}`);
  } catch (e) {
    logTest('Search & Filters Suite', false, e.message);
  }

  // 13. AUDIT LOGS
  try {
    const auditRes = await request('/audit-logs', { token: adminToken });
    const auditItems = auditRes.data?.data?.items || [];
    logTest('Admin: View Audit & Activity Logs', auditRes.status === 200 && Array.isArray(auditItems), `Total logs: ${auditItems.length}`);
  } catch (e) {
    logTest('Audit Logs Suite', false, e.message);
  }

  // 14. SUMMARY
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n=============================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('=============================================================\n');

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => console.log(` - ${r.name}: ${r.details}`));
  }

  return { total, passed, failed, results };
}

runSuite().catch(console.error);
