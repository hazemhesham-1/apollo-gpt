function adminAuthMiddleware(req, res, next) {
    const role = req.auth?.user?.publicMetadata?.role;
    if(role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    next();
}

module.exports = adminAuthMiddleware;