const dotenv = require("dotenv");
dotenv.config();

const headers = {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    clerkHeaders: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-type": "application/json"
    }
};

module.exports = headers;