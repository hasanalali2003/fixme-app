const jwt = require("jsonwebtoken");

function createJWT(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: serviceAccount.client_email,
        sub: serviceAccount.client_email,
        aud: "https://oauth2.googleapis.com/token",
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        iat: now,
        exp: now + 3600,
    };

    const privateKey = serviceAccount.private_key;
    return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

module.exports = { createJWT };
