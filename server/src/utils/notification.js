const Notification = require('../models/Notification');

const createNotification = async ({ recipient, issue, type, message }) =>
  Notification.create({ recipient, issue, type, message });

module.exports = { createNotification };
