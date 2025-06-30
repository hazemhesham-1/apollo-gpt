const axios = require("axios");
const express = require("express");
const router = express.Router();

const { clerkHeaders } = require("../config/clerk");

router.get("/users", async (req, res) => {
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

module.exports = router;