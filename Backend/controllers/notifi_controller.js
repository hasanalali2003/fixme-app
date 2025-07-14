// Import the DeviceToken model and the FCM push notification service
const { DeviceToken } = require("../models/index");
const { sendPushNotifications } = require("../services/fcm");

/**
 * Shared helper to send notifications to an array of device tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Array} storedDeviceTokens - List of device token objects from DB
 * @param {Object} notification - Notification payload with title/body/etc.
 */
const sendNotification = async (req, res, storedDeviceTokens, notification) => {
    try {
        // Extract just the token strings from the database documents
        const deviceTokens = storedDeviceTokens.map((item) => item.token);

        // Validate: deviceTokens array must not be empty
        if (!Array.isArray(deviceTokens) || deviceTokens.length === 0)
            return res
                .status(400)
                .json({ error: "deviceTokens must be a non-empty array" });

        // Validate: notification must contain at least a title
        if (!notification || !notification.title)
            return res
                .status(400)
                .json({ error: "notification.title is required" });

        // Load Google service account credentials from environment variable
        const serviceAccount = JSON.parse(
            process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        );

        // Get the Firebase project ID from environment variable
        const projectId = process.env.FCM_PROJECT_ID;

        // Send notifications using the FCM service
        const result = await sendPushNotifications(
            deviceTokens,
            notification,
            serviceAccount,
            projectId
        );

        // Respond with a summary of the notification results
        res.json({
            message: `Sent ${result.successful} of ${result.attempted} notifications.`,
            ...result,
        });
    } catch (err) {
        // Catch any runtime errors and respond with a 500 status
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST handler to send notifications to users by UUIDs (userIds)
 */
const sendToUUIDs = async (req, res) => {
    try {
        const { userIds, notification } = req.body;

        // Find all device tokens for the given user IDs
        const storedDeviceTokens = await DeviceToken.find({
            userId: { $in: userIds },
        }).lean();

        // Call shared notification function
        sendNotification(req, res, storedDeviceTokens, notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST handler to send notifications to users subscribed to given topics
 */
const sendToTopics = async (req, res) => {
    try {
        const { topics, notification } = req.body;

        // Find device tokens where user is subscribed to any of the given topics
        const storedDeviceTokens = await DeviceToken.find({
            userTopics: { $in: topics },
        }).lean();

        // Call shared notification function
        sendNotification(req, res, storedDeviceTokens, notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export the route handlers
module.exports = { sendToUUIDs, sendToTopics };
