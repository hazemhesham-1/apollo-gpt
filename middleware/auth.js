const { clerkClient } = require("@clerk/clerk-sdk-node");

async function adminAuthMiddleware(req, res, next) {
    const userId = req.auth?.userId;
    if(!userId) {
        return res.status(401).json({ error: "Unauthorized: Invalid user ID" });
    }

    try {
        const userResponse = await clerkClient.users.getUser(userId);
        const role = userResponse?.publicMetadata?.role;
        if(role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        next();
    }
    catch(err) {
        console.error("User data fetch failed: ", err.message);
        res.status(500).send("Internal Server Error: Failed to retrieve user data");
    }
}

module.exports = adminAuthMiddleware;