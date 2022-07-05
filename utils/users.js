const users = [];

//Join user to chatroom
function userJoin(id, username, room, points) {
    const user = { id, username, room, points };
    users.push(user);
    return user;
}

//Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

//User Leaves
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) return users.splice(index, 1)[0];
}

//Get current room users 
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}