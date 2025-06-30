const axios = require("axios");
const express = require("express");
const router = express.Router();

const { clerkHeaders } = require("../config/clerk");

router.post("/webhook", async (req, res) => {
    const event = req.body;

    if(event.type !== "user.created") {
        return res.status("200").send("Webhook event ignored");
    }

    const userId = event.data.id;
    try {
        const patchData = {
            role: "student",
            public_metadata: { status: "pending" },
        };

        const response = await axios.patch(`https://api.clerk.com/v1/users/${userId}`, patchData, { headers: clerkHeaders });
        const newUser = response.data;
        
        res.status(200).send(newUser);
    }
    catch(err) {
        console.error("Clerk API Error: ", err.message);
        res.status(500).send("Failed to process user information");
    }
});

module.exports = router;