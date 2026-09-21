const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_hms_suite_2026';

const { app } = require('../server');

let testServer;
let baseUrl;
let adminToken;
let doctorToken;
let patientToken;
let doctorId;
let patientId;
let departmentId;

// Helper to make fetch requests
const apiRequest = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

describe('AuraHealth HMS Backend API Suite', () => {
  before(async () => {
    // Start server on dynamic port
    await new Promise((resolve) => {
      testServer = http.createServer(app);
      testServer.listen(0, () => {
        const port = testServer.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // 1. Health Check
  test('GET /api/health - Server health check returns 200', async () => {
    const res = await apiRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 2. Patient Registration
  test('POST /api/auth/register - Should register new patient', async () => {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Jane Foster',
        email: `jane.foster.${Date.now()}@test.com`,
        password: 'Password@123',
        phone: '555-0101',
        gender: 'Female',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'patient');
    assert.ok(res.data.data.token);

    patientToken = res.data.data.token;
    patientId = res.data.data.user.profileId;
  });

  // 3. Reject Duplicate Registration
  test('POST /api/auth/register - Should reject duplicate email', async () => {
    const email = `duplicate.${Date.now()}@test.com`;
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Dup One', email, password: 'Password@123' },
    });

    const res2 = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Dup Two', email, password: 'Password@123' },
    });

    assert.strictEqual(res2.status, 400);
    assert.strictEqual(res2.data.success, false);
  });

  // 4. Login
  test('POST /api/auth/login - Should log in patient successfully', async () => {
    const email = `login.test.${Date.now()}@test.com`;
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name: 'Login User', email, password: 'Password@123' },
    });

    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password: 'Password@123' },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token);
  });

  // 5. Invalid Credentials Rejection
  test('POST /api/auth/login - Should reject invalid password', async () => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@test.com', password: 'WrongPassword' },
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // 6. Setup Admin & Department
  test('Admin Setup & Department Creation', async () => {
    const User = require('../models/User');
    const adminEmail = `admin.${Date.now()}@hospital.com`;
    const adminUser = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'Password@123',
      role: 'admin',
    });

    const loginRes = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: 'Password@123' },
    });

    adminToken = loginRes.data.data.token;

    const deptRes = await apiRequest('/api/departments', {
      method: 'POST',
      token: adminToken,
      body: {
        name: `Cardiology-${Date.now()}`,
        description: 'Cardiovascular Care',
      },
    });

    assert.strictEqual(deptRes.status, 201);
    departmentId = deptRes.data.data._id;
  });

  // 7. Role Authorization: Patient cannot create department
  test('Role Authorization - Patient cannot create department', async () => {
    const res = await apiRequest('/api/departments', {
      method: 'POST',
      token: patientToken,
      body: { name: 'Unauthorized Clinic' },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // 8. Doctor Creation by Admin
  test('POST /api/doctors - Admin creates doctor', async () => {
    const docEmail = `dr.watson.${Date.now()}@hospital.com`;
    const res = await apiRequest('/api/doctors', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Dr. John Watson',
        email: docEmail,
        password: 'Password@123',
        department: departmentId,
        specialization: 'General Clinical Medicine',
        consultationFee: 75,
        roomNumber: 'Suite 201',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    doctorId = res.data.data._id;

    // Log in as doctor
    const docLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: docEmail, password: 'Password@123' },
    });

    doctorToken = docLogin.data.data.token;
  });

  // 9. Appointment Booking
  test('POST /api/appointments - Patient books appointment', async () => {
    const res = await apiRequest('/api/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId,
        departmentId,
        date: '2026-12-15',
        timeSlot: { startTime: '10:00', endTime: '10:30' },
        reason: 'General health checkup',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'Pending');
  });

  // 10. Prevent Double Booking
  test('POST /api/appointments - Reject double booking for same doctor & slot', async () => {
    const res = await apiRequest('/api/appointments', {
      method: 'POST',
      token: patientToken,
      body: {
        doctorId,
        departmentId,
        date: '2026-12-15',
        timeSlot: { startTime: '10:00', endTime: '10:30' }, // Conflicting slot
        reason: 'Another booking attempt',
      },
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /already been booked/i);
  });

  // 11. Prescription Creation
  test('POST /api/prescriptions - Doctor issues prescription', async () => {
    const res = await apiRequest('/api/prescriptions', {
      method: 'POST',
      token: doctorToken,
      body: {
        patientId,
        diagnosis: 'Seasonal Allergies',
        medicines: [
          {
            name: 'Cetirizine 10mg',
            dosage: '10mg',
            frequency: 'Once daily at night',
            duration: '7 days',
            instructions: 'With water',
          },
        ],
        additionalAdvice: 'Stay hydrated.',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.medicines.length, 1);
  });
});
