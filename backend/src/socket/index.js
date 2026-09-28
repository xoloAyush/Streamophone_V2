import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { addUserSocket, getOnlineUsers, removeUserSocket, getUserSockets } from "./socketStore.js";
import { registerChatEvents } from "./chat.socket.js";
import { registerAgentEvents } from "./agent.socket.js";

let io;

export const initSocket = (httpServer) => {

  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {

    try {

      //         console.log("Handshake Headers:");
      // console.log(socket.handshake.headers);

      // console.log("Raw Cookie:");
      // console.log(socket.handshake.headers.cookie);

      const cookies = cookie.parse(socket.handshake.headers.cookie || "");

      const { token } = cookies;
      // console.log(cookies)

      if (!token) {
        console.log("No token in cookies");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("No user found for id:", decoded.userId);
        return next(new Error("User not found"));
      }

      socket.user = user;

      //   console.log(socket.user)

      // TEMP: Skip authentication
      // socket.user = {
      //   fullName: "Test User",
      // };

      next();
    }
    catch (err) {
      next(err);
    }

  });

  io.on("connection", (socket) => {
    console.log(`${socket.user.fullName} connected`);

    addUserSocket(socket.user._id.toString(), socket.id)

    registerChatEvents(io, socket);
    registerAgentEvents(io, socket);

    socket.on("typing", ({ receiverId }) => {
      const receiverSockets = getUserSockets(receiverId);

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("typing", {
          userId: socket.user._id,
          fullName: socket.user.fullName,
        });
      });
    });

    socket.on("stop-typing", ({ receiverId }) => {
      const receiverSockets = getUserSockets(receiverId);

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("stop-typing", {
          userId: socket.user._id,
        });
      });
    });

    console.log(getOnlineUsers())

    // const sockets = getUserSockets(receiverId);

    // sockets.forEach((socketId) => {
    //   io.to(socketId).emit("receive-message", message);
    // });

    // io.on("connection", (socket) => {
    //   console.log(socket.user.fullName);

    socket.on("disconnect", () => {
      console.log(`${socket.user.fullName} disconnected`);

      removeUserSocket(
        socket.user._id.toString(),
        socket.id
      );

      console.log(getOnlineUsers());
    });
  });

  return io;

};

export const getIO = () => io;