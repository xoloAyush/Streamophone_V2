import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : undefined;

export const socket = io(SOCKET_URL, { 
  autoConnect: false,
  withCredentials: true 
});

// export const socket = io("http://localhost:5000", {
//   autoConnect: false,
//   withCredentials: true,
// });