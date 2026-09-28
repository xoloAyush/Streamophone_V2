const onlineUsers = new Map()

export const addUserSocket = (userId, socketId) =>{

    if(!onlineUsers.has(userId)){
        onlineUsers.set(userId, new Set())
    }

    onlineUsers.get(userId).add(socketId)
}

export const removeUserSocket = (userId, socketId)=>{
    const sockets = onlineUsers.get(userId)

    if(!sockets) return

    sockets.delete(socketId)

    if(sockets.size === 0){
        onlineUsers.delete(userId)
    }
}

export const getUserSockets = (userId) => {
    return onlineUsers.get(userId) || new Set();
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

export const getOnlineUsers = () => {
    console.log("map",onlineUsers); 
  return [...onlineUsers.keys()];
};


// export const sockets = getUserSockets(receiverId);

// sockets.forEach((socketId) => {
//   io.to(socketId).emit("receive-message", message);
// });