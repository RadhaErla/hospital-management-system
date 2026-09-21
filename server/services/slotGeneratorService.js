const Appointment = require('../models/Appointment');

/**
 * Convert "HH:mm" to total minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert total minutes to "HH:mm"
 */
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Generate available and booked slots for a given doctor and date
 */
const generateDoctorSlots = async (doctor, dateString) => {
  const appointmentDate = new Date(dateString);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[appointmentDate.getDay()];

  const availability = doctor.availability || {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    slotDurationMinutes: 30,
  };

  // Check if doctor works on this day
  if (!availability.workingDays.includes(dayName)) {
    return {
      isWorkingDay: false,
      message: `Doctor is not scheduled to work on ${dayName}s.`,
      slots: [],
    };
  }

  const startMinutes = timeToMinutes(availability.startTime || '09:00');
  const endMinutes = timeToMinutes(availability.endTime || '17:00');
  const breakStartMinutes = timeToMinutes(availability.breakStart || '13:00');
  const breakEndMinutes = timeToMinutes(availability.breakEnd || '14:00');
  const duration = availability.slotDurationMinutes || 30;

  // Retrieve existing appointments for doctor on this date
  const existingAppointments = await Appointment.find({
    doctor: doctor._id,
    date: dateString,
    status: { $nin: ['Cancelled', 'Rejected'] },
  }).select('timeSlot status reason');

  const bookedSlotStarts = new Set(
    existingAppointments.map((app) => app.timeSlot.startTime)
  );

  const slots = [];
  const now = new Date();
  const isToday = now.toISOString().split('T')[0] === dateString;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentSlotStart = startMinutes;

  while (currentSlotStart + duration <= endMinutes) {
    const currentSlotEnd = currentSlotStart + duration;

    // Check if slot falls in break time
    const overlapsBreak =
      (currentSlotStart >= breakStartMinutes && currentSlotStart < breakEndMinutes) ||
      (currentSlotEnd > breakStartMinutes && currentSlotEnd <= breakEndMinutes) ||
      (currentSlotStart <= breakStartMinutes && currentSlotEnd >= breakEndMinutes);

    if (!overlapsBreak) {
      const startTimeStr = minutesToTime(currentSlotStart);
      const endTimeStr = minutesToTime(currentSlotEnd);

      const isBooked = bookedSlotStarts.has(startTimeStr);
      const isPast = isToday && currentSlotStart <= currentMinutes;

      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        isAvailable: !isBooked && !isPast,
        isBooked,
        isPast,
      });
    }

    currentSlotStart += duration;
  }

  return {
    isWorkingDay: true,
    dayName,
    slots,
  };
};

module.exports = {
  generateDoctorSlots,
  timeToMinutes,
  minutesToTime,
};
