import { useEffect } from "react";
import { socket } from "../lib/socket";

const useSocket = (events = {}) => {

  useEffect(() => {

    Object.entries(events).forEach(
      ([event, handler]) => {

        socket.on(
          event,
          handler
        );

      }
    );


    return () => {

      Object.entries(events).forEach(
        ([event, handler]) => {

          socket.off(
            event,
            handler
          );

        }
      );

    };

  }, [events]);



};

export default useSocket;

// useSocket({
//   "receive-message": handleReceive,
//   "typing": handleTyping,
//   "online-users": handleOnlineUsers,
// });