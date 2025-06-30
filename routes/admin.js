const axios = require("axios");
const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/auth");
const { clerkHeaders } = require("../config/clerk");

router.get("/users", adminAuthMiddleware, async (req, res) => {
    try {
        const response = await axios.get("https://api.clerk.com/v1/users", { headers: clerkHeaders });
        const users = response.data;

        function filterData(user) {
            const data = {
                id: user.id,
                username: user.username,
                email: user.email_addresses[0]?.email_address,
                created_at: user.created_at,
                image: user.image_url,
                status: user.public_metadata?.status || "unknown",
            };

            return data;
        }

        const filteredUsers = users.map((user) => filterData(user));
        res.status(200).json(filteredUsers);
    }
    catch(err) {
        console.error("Error fetching users data: ", err.message);
        res.status(500).send("Failed to fetch users");
    }
});

router.post("/verify-users", adminAuthMiddleware, async (req, res) => {
    const { userId } = req.body;

    if(!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const patchData = {
            public_metadata: { status: "verified" },
        };

        const response = await axios.patch(`https://api.clerk.com/v1/users/${userId}`, patchData, { headers: clerkHeaders });
        const updatedUser = response.data;

        res.status(200).send(updatedUser);
    }
    catch(err) {
        console.error("User verification Error: ", err.message);
        res.status(500).send("An error occurred during user verification");
    }
});

router.post("/users/:userId", adminAuthMiddleware, async (req, res) => {
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
        console.error("User deletion Error: ", err.message);
        res.status(500).send("An error occurred while attempting to delete user");
    }
});

module.exports = router;