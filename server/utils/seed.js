require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Receptionist = require('../models/Receptionist');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const LabReport = require('../models/LabReport');
const Medicine = require('../models/Medicine');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting AuraHealth HMS database seeding...');
    await connectDB();

    // Clear existing collections
    console.log('🧹 Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Receptionist.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Prescription.deleteMany({}),
      LabReport.deleteMany({}),
      Medicine.deleteMany({}),
      Bill.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    const DEMO_PASSWORD = 'Password@123';

    // 1. Create Default Departments
    console.log('🏢 Seeding departments...');
    const defaultDepartmentsData = [
      { name: 'Cardiology', description: 'Comprehensive heart, cardiovascular, and vascular system care.', icon: 'Heart' },
      { name: 'Neurology', description: 'Advanced diagnosis and therapy for brain, spinal, and nerve disorders.', icon: 'Brain' },
      { name: 'Orthopedics', description: 'Bone, joint, musculoskeletal health, and sports injury treatments.', icon: 'Bone' },
      { name: 'Pediatrics', description: 'Dedicated healthcare, vaccinations, and growth support for children.', icon: 'Baby' },
      { name: 'Dermatology', description: 'Skin, hair, nail disorders, and aesthetic medical dermatology.', icon: 'Sparkles' },
      { name: 'General Medicine', description: 'Primary care, internal medicine, preventive checks, and diagnosis.', icon: 'Stethoscope' },
      { name: 'ENT', description: 'Ear, Nose, and Throat clinical evaluation and surgical care.', icon: 'Headphones' },
      { name: 'Gynecology', description: "Women's health, obstetrics, maternity, and reproductive healthcare.", icon: 'Activity' },
      { name: 'Dentistry', description: 'Oral healthcare, dental surgery, orthodontics, and implants.', icon: 'Smile' },
      { name: 'Ophthalmology', description: 'Eye health, laser vision diagnostics, and advanced ophthalmic care.', icon: 'Eye' },
    ];

    const departments = await Department.insertMany(defaultDepartmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    // 2. Create Users
    console.log('👤 Seeding core user accounts...');
    // Admin
    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell (Admin)',
      email: 'admin@hospital.com',
      password: DEMO_PASSWORD,
      role: 'admin',
      phone: '+1 (555) 100-2001',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    });

    // Doctor 1 (Primary Demo Doctor)
    const doctorUser1 = await User.create({
      name: 'Dr. Robert Chen',
      email: 'doctor@hospital.com',
      password: DEMO_PASSWORD,
      role: 'doctor',
      phone: '+1 (555) 200-3001',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    });

    // Doctor 2
    const doctorUser2 = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@hospital.com',
      password: DEMO_PASSWORD,
      role: 'doctor',
      phone: '+1 (555) 200-3002',
      avatar: 'https://images.unsplash.com/photo-1594824813588-446757b32062?auto=format&fit=crop&q=80&w=300',
    });

    // Doctor 3
    const doctorUser3 = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@hospital.com',
      password: DEMO_PASSWORD,
      role: 'doctor',
      phone: '+1 (555) 200-3003',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    });

    // Receptionist (Primary Demo Receptionist)
    const receptionistUser = await User.create({
      name: 'Jessica Taylor',
      email: 'receptionist@hospital.com',
      password: DEMO_PASSWORD,
      role: 'receptionist',
      phone: '+1 (555) 300-4001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    });

    // Patient 1 (Primary Demo Patient)
    const patientUser1 = await User.create({
      name: 'David Miller',
      email: 'patient@hospital.com',
      password: DEMO_PASSWORD,
      role: 'patient',
      phone: '+1 (555) 400-5001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    });

    // Patient 2
    const patientUser2 = await User.create({
      name: 'Sophia Williams',
      email: 'sophia.williams@example.com',
      password: DEMO_PASSWORD,
      role: 'patient',
      phone: '+1 (555) 400-5002',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    });

    // 3. Create Doctor Profiles
    console.log('🩺 Seeding doctor profiles & schedules...');
    const doctor1 = await Doctor.create({
      user: doctorUser1._id,
      department: deptMap['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
      experienceYears: 14,
      consultationFee: 120,
      roomNumber: 'Suite 304',
      bio: 'Senior consultant cardiologist specializing in cardiovascular diagnostics, echocardiography, and hypertension management.',
      availability: {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        slotDurationMinutes: 30,
      },
    });

    const doctor2 = await Doctor.create({
      user: doctorUser2._id,
      department: deptMap['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualifications: ['MBBS', 'MD (Neurology)', 'DM'],
      experienceYears: 11,
      consultationFee: 140,
      roomNumber: 'Suite 408',
      bio: 'Expert in neurological evaluations, chronic migraine therapy, and neuro-rehabilitation.',
      availability: {
        workingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        startTime: '10:00',
        endTime: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        slotDurationMinutes: 30,
      },
    });

    const doctor3 = await Doctor.create({
      user: doctorUser3._id,
      department: deptMap['General Medicine'],
      specialization: 'Family Medicine & Diagnostics',
      qualifications: ['MBBS', 'MD (Internal Medicine)'],
      experienceYears: 8,
      consultationFee: 80,
      roomNumber: 'Suite 102',
      bio: 'Dedicated primary care physician focused on preventive wellness, chronic lifestyle care, and holistic treatment.',
      availability: {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        startTime: '08:30',
        endTime: '16:30',
        breakStart: '12:30',
        breakEnd: '13:30',
        slotDurationMinutes: 30,
      },
    });

    // Update departments with head doctors
    await Department.findByIdAndUpdate(deptMap['Cardiology'], { headDoctor: doctor1._id });
    await Department.findByIdAndUpdate(deptMap['Neurology'], { headDoctor: doctor2._id });
    await Department.findByIdAndUpdate(deptMap['General Medicine'], { headDoctor: doctor3._id });

    // 4. Create Receptionist Profile
    console.log('💼 Seeding receptionist profile...');
    const receptionist = await Receptionist.create({
      user: receptionistUser._id,
      employeeId: 'REC-1001',
      shift: 'Morning',
    });

    // 5. Create Patient Profiles
    console.log('🩹 Seeding patient profiles...');
    const patient1 = await Patient.create({
      user: patientUser1._id,
      patientId: 'PAT-1001',
      dateOfBirth: new Date('1988-06-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Jane Miller',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543',
      },
      medicalHistory: ['Mild Hypertension (2021)', 'Seasonal Allergic Rhinitis'],
      allergies: ['Penicillin', 'Sulfa drugs'],
    });

    const patient2 = await Patient.create({
      user: patientUser2._id,
      patientId: 'PAT-1002',
      dateOfBirth: new Date('1994-11-23'),
      gender: 'Female',
      bloodGroup: 'A+',
      address: {
        street: '1204 Pine Ridge Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Michael Williams',
        relationship: 'Brother',
        phone: '+1 (555) 765-4321',
      },
      medicalHistory: ['Occasional Migraines'],
      allergies: ['Latex'],
    });

    // 6. Create Medicines
    console.log('💊 Seeding pharmacy medicines inventory...');
    const medicinesData = [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'GSK Pharma', stockQuantity: 450, unitPrice: 5.5, expiryDate: new Date('2028-12-31') },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', dosageForm: 'Capsule', strength: '250mg', manufacturer: 'Pfizer', stockQuantity: 280, unitPrice: 12.0, expiryDate: new Date('2027-08-15') },
      { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Cardiovascular', dosageForm: 'Tablet', strength: '20mg', manufacturer: 'Sun Pharma', stockQuantity: 190, unitPrice: 18.5, expiryDate: new Date('2028-04-30') },
      { name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', category: 'Other', dosageForm: 'Tablet', strength: '500mg', manufacturer: 'Merck', stockQuantity: 320, unitPrice: 8.0, expiryDate: new Date('2028-09-20') },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine Dihydrochloride', category: 'Antihistamine', dosageForm: 'Tablet', strength: '10mg', manufacturer: 'Novartis', stockQuantity: 400, unitPrice: 6.25, expiryDate: new Date('2029-01-10') },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg', manufacturer: 'AstraZeneca', stockQuantity: 215, unitPrice: 14.0, expiryDate: new Date('2027-11-25') },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Analgesic', dosageForm: 'Tablet', strength: '400mg', manufacturer: 'Abbott', stockQuantity: 340, unitPrice: 7.5, expiryDate: new Date('2028-06-30') },
      { name: 'Vitamin D3 60,000 IU', genericName: 'Cholecalciferol', category: 'Vitamin/Supplement', dosageForm: 'Capsule', strength: '60000 IU', manufacturer: 'Cipla', stockQuantity: 500, unitPrice: 10.0, expiryDate: new Date('2029-05-15') },
    ];
    await Medicine.insertMany(medicinesData);

    // 7. Create Appointments
    console.log('📅 Seeding appointments...');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Tomorrow string
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 3 days ago string
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

    // Completed Appointment (Patient 1 with Doctor 1)
    const completedApp = await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      department: deptMap['Cardiology'],
      date: threeDaysAgoStr,
      timeSlot: { startTime: '09:30', endTime: '10:00' },
      reason: 'Routine quarterly cardiac checkup and blood pressure review',
      status: 'Completed',
      notes: 'Patient reported minor chest tightness during intense exertion. ECG performed.',
    });

    // Today's Confirmed Appointment (Patient 1 with Doctor 3)
    const todayApp = await Appointment.create({
      patient: patient1._id,
      doctor: doctor3._id,
      department: deptMap['General Medicine'],
      date: todayStr,
      timeSlot: { startTime: '11:00', endTime: '11:30' },
      reason: 'Follow-up for seasonal allergies and general fatigue',
      status: 'Confirmed',
      notes: 'Scheduled for morning consultation.',
    });

    // Upcoming Appointment (Patient 2 with Doctor 2)
    const upcomingApp = await Appointment.create({
      patient: patient2._id,
      doctor: doctor2._id,
      department: deptMap['Neurology'],
      date: tomorrowStr,
      timeSlot: { startTime: '14:30', endTime: '15:00' },
      reason: 'Frequent tension headache episodes',
      status: 'Pending',
      notes: 'First time neurology consultation.',
    });

    // 8. Create Medical Record for completed appointment
    console.log('📋 Seeding medical records...');
    const medicalRecord1 = await MedicalRecord.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointment: completedApp._id,
      symptoms: 'Occasional mild chest tightness on strenuous stair climbing; slight shortness of breath.',
      diagnosis: 'Early Stage Essential Hypertension with mild sinus tachycardia',
      treatment: 'Low-sodium diet, regular aerobic exercise, daily BP monitoring, and prescription medication.',
      notes: 'Advised repeat lipid profile and 2D Echocardiogram if symptoms recur.',
      allergies: ['Penicillin'],
      vitals: {
        bp: '138/88 mmHg',
        pulse: '78 bpm',
        temperature: '98.4 °F',
        weight: '76 kg',
        height: '178 cm',
      },
      date: threeDaysAgo,
    });

    // 9. Create Prescription for completed appointment
    console.log('📝 Seeding prescriptions...');
    const prescription1 = await Prescription.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointment: completedApp._id,
      diagnosis: 'Essential Hypertension & Mild Exertional Discomfort',
      medicines: [
        {
          name: 'Atorvastatin 20mg',
          dosage: '20mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take with a glass of water after dinner.',
        },
        {
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: 'As needed (max 3 times/day)',
          duration: '5 days',
          instructions: 'Take after meals if headache or muscle soreness occurs.',
        },
      ],
      additionalAdvice: 'Reduce dietary sodium intake. Avoid vigorous heavy lifting for 2 weeks. Walk 30 minutes daily.',
      date: threeDaysAgo,
    });

    // 10. Create Lab Report
    console.log('🔬 Seeding lab reports...');
    await LabReport.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointment: completedApp._id,
      testName: 'Complete Lipid Profile & Serum Electrolytes',
      category: 'Biochemistry',
      fileUrl: '/uploads/sample-lipid-report.pdf',
      fileName: 'lipid-profile-david-miller.pdf',
      fileType: 'application/pdf',
      fileSize: 245760,
      notes: 'HDL is within normal range; slight borderline elevation in LDL. Electrolytes are stable.',
      date: threeDaysAgo,
    });

    // 11. Create Bills & Payments
    console.log('💳 Seeding bills & transactions...');
    // Paid Bill for Patient 1
    const paidBill = await Bill.create({
      invoiceNumber: `INV-${today.getFullYear()}-1001`,
      patient: patient1._id,
      appointment: completedApp._id,
      doctorFee: 120,
      labCharges: 65,
      medicineCharges: 26,
      otherCharges: 10,
      items: [
        { description: 'Cardiology Consultation with Dr. Robert Chen', amount: 120 },
        { description: 'Comprehensive Lipid Profile Blood Test', amount: 65 },
        { description: 'Pharmacy Dispensary Medication', amount: 26 },
        { description: 'Hospital Registration & Nursing Charges', amount: 10 },
      ],
      discount: 20,
      tax: 15,
      totalAmount: 216,
      paymentStatus: 'Paid',
      paymentMethod: 'Card',
      paidAt: threeDaysAgo,
    });

    await Payment.create({
      bill: paidBill._id,
      transactionId: `TXN_SEED_${Date.now()}`,
      amount: 216,
      paymentMethod: 'Card',
      status: 'Success',
      gatewayResponse: { cardBrand: 'Visa', last4: '4242', authCode: 'AUTH883921' },
    });

    // Pending Bill for Today's visit
    await Bill.create({
      invoiceNumber: `INV-${today.getFullYear()}-1002`,
      patient: patient1._id,
      appointment: todayApp._id,
      doctorFee: 80,
      labCharges: 0,
      medicineCharges: 0,
      otherCharges: 5,
      items: [
        { description: 'General Medicine Consultation with Dr. Marcus Vance', amount: 80 },
        { description: 'Administrative Processing Fee', amount: 5 },
      ],
      discount: 0,
      tax: 6,
      totalAmount: 91,
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      notes: 'Pending payment at front desk or online portal.',
    });

    // 12. Create Notifications
    console.log('🔔 Seeding initial notifications...');
    await Notification.create([
      {
        recipient: patientUser1._id,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. Marcus Vance on ${todayStr} at 11:00 AM has been confirmed.`,
        type: 'appointment',
        link: '/patient/appointments',
        isRead: false,
      },
      {
        recipient: patientUser1._id,
        title: 'Prescription Available',
        message: 'Dr. Robert Chen issued a prescription for your recent cardiology visit.',
        type: 'prescription',
        link: '/patient/prescriptions',
        isRead: true,
      },
      {
        recipient: doctorUser1._id,
        title: 'New Patient Assigned',
        message: 'David Miller has been registered for cardiovascular monitoring.',
        type: 'system',
        link: '/doctor/patients',
        isRead: false,
      },
    ]);

    // 13. Create Activity Logs
    console.log('📜 Seeding activity audit logs...');
    await ActivityLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: 'admin',
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'System',
        details: 'Initial system seed and department structure created.',
      },
      {
        user: receptionistUser._id,
        userName: receptionistUser.name,
        userRole: 'receptionist',
        action: 'REGISTER_PATIENT',
        entityType: 'Patient',
        entityId: patient1._id.toString(),
        details: 'Registered patient David Miller (PAT-1001).',
      },
      {
        user: doctorUser1._id,
        userName: doctorUser1.name,
        userRole: 'doctor',
        action: 'CREATE_PRESCRIPTION',
        entityType: 'Prescription',
        entityId: prescription1._id.toString(),
        details: 'Prescription created for David Miller.',
      },
    ]);

    console.log('\n======================================================');
    console.log('🎉 AuraHealth HMS Database Seeded Successfully!');
    console.log('======================================================');
    console.log('Demo Credentials for All 4 Roles:');
    console.log('------------------------------------------------------');
    console.log('🔑 Admin:        admin@hospital.com       / Password@123');
    console.log('🔑 Doctor:       doctor@hospital.com      / Password@123');
    console.log('🔑 Receptionist: receptionist@hospital.com/ Password@123');
    console.log('🔑 Patient:      patient@hospital.com     / Password@123');
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
