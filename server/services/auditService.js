const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({
  req = null,
  user = null,
  action,
  entityType,
  entityId = '',
  details = '',
}) => {
  try {
    const actingUser = user || (req ? req.user : null);
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
      : '';

    await ActivityLog.create({
      user: actingUser ? actingUser._id : null,
      userName: actingUser ? actingUser.name : 'System',
      userRole: actingUser ? actingUser.role : 'system',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
};

module.exports = {
  logActivity,
};
