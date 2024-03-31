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
const { addUser, removeUser, getUser } = require("./services/roomUsers");

const port = process.env.PORT;
const userRouter = require("./routers/user");
const roomRouter = require("./routers/room");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(roomRouter);

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

    socket.on("join", async (room, callback) => {
      const roomName = await getRoomNameById(room);

      if (!roomName) {
        return callback(error);
      }

      const { error, user } = addUser({ id: socket.id, room, username });
      if (error) {
        return callback(error);
      }

      socket.join(room);
      socket.emit("message", generateMessage("Admin", "Welcome"));
      socket.broadcast
        .to(room)
        .emit(
          "message",
          generateMessage("Admin", `${user.username} has joined`),
        );

      callback();
    });

    socket.on("sendMessage", (message) => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          generateMessage(user.username, message),
        );
      }
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          generateMessage("Admin", `${user.username} has left!`),
        );
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
