require("dotenv").config();
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const { generateMessage } = require("./utils/helpers");
const { verifyJwtToken } = require("./services/user");
const { getRoomNameById } = require("./services/room");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./services/roomUsers");

const port = process.env.PORT;
const userRouter = require("./routers/user");
const roomRouter = require("./routers/room");

// Middlewares
app.use(cors()); // Enable cores
app.use(express.json()); // Enable json
app.use(express.urlencoded({ extended: false })); // Enable urlencoded

// Routes
app.use(userRouter); // user routes
app.use(roomRouter); // room routes

// Socket middleware to check authentication
io.use((socket, next) => {
  const token = socket.handshake.headers.authorization;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  const decoded = verifyJwtToken(token.split(" ")[1]);
  socket.username = decoded.name;
  next();
});

io.on("connection", (socket) => {
  try {
    const username = socket?.username;

    // Join room
    socket.on("join", async (room, callback) => {
      const roomName = await getRoomNameById(room); // get room name by room id

      if (!roomName) {
        return callback(error);
      }

      const { error, user } = addUser({ id: socket.id, room, username });
      if (error) {
        // return error if unable to add user
        return callback(error);
      }

      socket.join(room);
      // Welcome current user
      socket.emit("message", generateMessage("Admin", "Welcome"));
      // Broadcast when a user connects
      socket.broadcast
        .to(room)
        .emit(
          "message",
          generateMessage("Admin", `${user.username} has joined`),
        );
      // Send users and room info
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      callback();
    });

    socket.on("sendMessage", (message) => {
      // Find user
      const user = getUser(socket.id);
      if (user) {
        // Send message to room
        io.to(user.room).emit(
          "message",
          generateMessage(user.username, message),
        );
      }
    });

    socket.on("disconnect", () => {
      // remove user
      const user = removeUser(socket.id);
      if (user) {
        // Broadcast when a user disconnects
        io.to(user.room).emit(
          "message",
          generateMessage("Admin", `${user.username} has left!`),
        );
        // Send users and room info
        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      }
    });
  } catch (error) {
    console.error("Error handling Socket.IO connection:", error);
    socket.disconnect();
  }
});

httpServer.listen(port, () => {
  console.log("Server is up on port", port);
});
