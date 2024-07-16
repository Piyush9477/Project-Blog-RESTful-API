const {PORT, CONNECTION_URL, JWT_SECRET, SENDER_EMAIL, EMAIL_PASSWORD} = process.env;

module.exports = {port: PORT, connectionUrl: CONNECTION_URL, jwtSecret: JWT_SECRET, sender_email: SENDER_EMAIL, emailPassword: EMAIL_PASSWORD};