const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");

const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const { Server } = require("socket.io");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const webhookRoutes = require("./routes/webhooks");

const handleChatSocket = require("./sockets/chatSocket");

const app = express();
app.use(cors());
app.use(ClerkExpressWithAuth());
app.use(bodyParser.json());

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/clerk", webhookRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", handleChatSocket);

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));