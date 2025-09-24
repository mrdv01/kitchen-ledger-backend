import http from "http";
import app from "./app/app.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

// create the HTTP server
const server = http.createServer(app);

// attach Socket.IO
export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
