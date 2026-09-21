const { getIO } = require('../config/socket');
const Notification = require('../models/Notification');

const createAndSendNotification = async ({
  recipientId,
  title,
  message,
  type = 'system',
  link = '',
  targetRole = null,
}) => {
  try {
    let savedNotification = null;

    if (recipientId) {
      savedNotification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        link,
      });
    }

    const io = getIO();
    if (io) {
      const payload = savedNotification ? savedNotification.toObject() : {
        title,
        message,
        type,
        link,
        createdAt: new Date(),
      };

      if (recipientId) {
        io.to(`user:${recipientId}`).emit('notification:new', payload);
      }
      if (targetRole) {
        io.to(`role:${targetRole}`).emit('notification:new', payload);
      }
    }

    return savedNotification;
  } catch (error) {
    console.error('Error in createAndSendNotification:', error.message);
    return null;
  }
};

module.exports = {
  createAndSendNotification,
};
