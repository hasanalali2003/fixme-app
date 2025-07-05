const { createJWT } = require("../utils/jwt"); // Import utility to generate JWT for FCM authorization

// Generate an OAuth 2.0 access token using a service account
const getAccessToken = async (serviceAccount) => {
    const jwt = createJWT(serviceAccount); // Create a signed JWT

    // Exchange the JWT for an access token from Google OAuth endpoint
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    const data = await res.json();

    // Throw error if access token is not returned
    if (!data.access_token) throw new Error("Failed to get access token");

    return data.access_token; // Return the access token
};

// Send push notifications to a list of device tokens
const sendPushNotifications = async (
    deviceTokens,
    notification,
    serviceAccount,
    projectId
) => {
    const accessToken = await getAccessToken(serviceAccount); // Get FCM access token
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`; // FCM send endpoint

    // Prepare and send one request per device token
    const promises = deviceTokens.map((token) => {
        const message = {
            message: {
                token, // Target device token
                notification: {
                    title: notification.title,
                    body: notification.body || "",
                },
                data: {
                    image_url: notification.image_url || "",
                    html: notification.html || "",
                    date: notification.date || new Date().toISOString(),
                },
                android: {
                    notification: {
                        image: notification.image_url,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            "mutable-content": 1,
                        },
                    },
                    fcm_options: {
                        image: notification.image_url,
                    },
                },
            },
        };

        // Send the notification request to FCM
        return fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
    });

    const results = await Promise.all(promises); // Wait for all requests to finish

    // Count successful and failed sends
    const successful = results.filter((r) => r.ok).length;
    const failed = results.length - successful;

    return { attempted: results.length, successful, failed }; // Return summary
};

module.exports = { sendPushNotifications }; // Export functions for external use
