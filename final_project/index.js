const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Session configuration for "/customer" routes
app.use("/customer", session({
    secret: "fingerprint_customer", // Replace with an environment variable in production
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for customer-specific routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Extract token from session
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    jwt.verify(token, "your_secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token." });
        }
        req.user = decoded; // Attach user information to request object
        next(); // Proceed to the next middleware or route handler
    });
});

// Mount customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
