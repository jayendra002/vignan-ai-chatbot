const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // 1. Check if the request has an authorization header and if it starts with 'Bearer'
    // (Standard practice is sending tokens like: "Bearer abc123xyz...")
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token (Split "Bearer abc123" into an array and grab the 2nd item)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your secret key from the .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Attach the decoded user payload (id and role) to the request object
            // Now, any route that uses this middleware will know EXACTLY who is making the request
            req.user = decoded;

            // 5. Let the user pass through to the actual API route
            next();
        } catch (error) {
            console.error('Token Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized. Token is invalid or expired.' });
        }
    }

    // 6. If no token was found at all
    if (!token) {
        return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }
};

module.exports = { protect };