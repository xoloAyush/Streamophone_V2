import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dns from "node:dns";
import { createServer } from "node:http";
import { Server } from 'socket.io'

import { initSocket } from "./src/socket/index.js";

dotenv.config();

// Use Cloudflare DNS
dns.setServers([
  "1.1.1.1",
  "1.0.0.1",
]);


connectDB();

const PORT = process.env.PORT || 5000;

// Create an HTTP server from the Express app
const httpServer = createServer(app);

initSocket(httpServer);

// app.listen(PORT, () => {
httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
