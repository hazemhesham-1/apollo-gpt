const axios = require("axios");
const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/auth");
const { clerkHeaders } = require("../config/clerk");

function formatData(user) {
    const data = {
        id: user.id,
        username: user.username,
        email: user.email_addresses[0]?.email_address,
        created_at: user.created_at,
        image: user.image_url,
        balance: user.public_metadata?.balance || 0,
        role: user.public_metadata?.role || "user",
        status: user.public_metadata?.status || "unknown",
    };
    
    return data;
}

router.get("/users", adminAuthMiddleware, async (req, res) => {
    try {
        const response = await axios.get("https://api.clerk.com/v1/users", { headers: clerkHeaders });
        const users = response.data;

        const formattedUsers = users.map((user) => formatData(user));
        const filteredUsers = formattedUsers.filter((user) => user.role !== "admin");
        res.status(200).json(filteredUsers);
    }
    catch(err) {
        console.error("Users data fetch failed: ", err.message);
        res.status(500).send("Failed to fetch users data");
    }
});

router.post("/update-balance", adminAuthMiddleware, async (req, res) => {
    const { balance, userId } = req.body;
    const parsedBalance = Number(balance);

    if(!userId) {
        return res.status(400).send("User ID is required");
    }
    if(isNaN(parsedBalance)) {
        return res.status(400).send("Balance must be a valid number");
    }
    else if(parsedBalance < 0) {
        return res.status(400).send("Balance cannot be a negative number");
    }

    try {
        const patchData = {
            public_metadata: { balance: parsedBalance, role: "student", status: "verified" }
        };

        const response = await axios.patch(`https://api.clerk.com/v1/users/${userId}`, patchData, { headers: clerkHeaders });
        const updatedUser = response.data;

        res.status(200).send(formatData(updatedUser));
    }
    catch(err) {
        console.error("Balance Update Error: ", err.message);
        res.status(500).send("An internal error occurred while updating the balance");
    }
});

router.post("/verify-user", adminAuthMiddleware, async (req, res) => {
    const { userId } = req.body;

    if(!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const patchData = {
            public_metadata: { balance: 10, role: "student", status: "verified" }
        };

        const response = await axios.patch(`https://api.clerk.com/v1/users/${userId}`, patchData, { headers: clerkHeaders });
        const updatedUser = response.data;

        res.status(200).send(formatData(updatedUser));
    }
    catch(err) {
        console.error("User Verification Error: ", err.message);
        res.status(500).send("An error occurred during user verification");
    }
});

router.delete("/users/:userId", adminAuthMiddleware, async (req, res) => {
    const { userId } = req.params;

    if(!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const response = await axios.delete(`https://api.clerk.com/v1/users/${userId}`, { headers: clerkHeaders });
        const deletedUser = response.data;
        
        res.status(200).send(deletedUser);
    }
    catch(err) {
        console.error("User Deletion Error: ", err.message);
        res.status(500).send("An error occurred while attempting to delete user");
    }
});

module.exports = router;