const axios = require("axios");
const express = require("express");
const router = express.Router();

const { clerkHeaders } = require("../config/clerk");

router.post("/consume-credits", async (req, res) => {
    const { userId } = req.body;

    if(!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const userData = await axios.get(`https://api.clerk.com/v1/users/${userId}`, { headers: clerkHeaders });
        const { public_metadata } = userData.data;

        const userBalance = public_metadata?.balance;
        const newBalance = Math.max(0, userBalance - 2);

        const patchData = {
            public_metadata: { ...public_metadata, balance: newBalance }
        };

        const response = await axios.patch(`https://api.clerk.com/v1/users/${userId}`, patchData, { headers: clerkHeaders });
        const updatedUser = response.data;
        
        const formattedData = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email_addresses[0]?.email_address,
            created_at: updatedUser.created_at,
            image: updatedUser.image_url,
            balance: updatedUser.public_metadata?.balance,
            role: updatedUser.public_metadata?.role,
            status: updatedUser.public_metadata?.status,
        };

        res.status(200).send(formattedData);
    }
    catch(err) {
        console.error("User Update Error: ", err.message);
        res.status(500).send("An error occurred while updating user data");
    }
});

module.exports = router;