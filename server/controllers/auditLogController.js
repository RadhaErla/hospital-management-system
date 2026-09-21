const ActivityLog = require('../models/ActivityLog');
const { paginatedResponse } = require('../utils/apiResponse');

/**
 * Get Activity Logs (Admin only)
 * GET /api/audit-logs
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { action, entityType, userRole, page = 1, limit = 20 } = req.query;

    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userRole) query.userRole = userRole;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Activity logs fetched successfully.', {
      items: logs,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
};
