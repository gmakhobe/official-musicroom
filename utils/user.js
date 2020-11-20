const users = require("deezer-web-api/src/users");

const user = [];

//join user to room

function userJoin(socketId, name, roomId){
	const user = { socketId, name, roomId };

	user.push(user);

	return user;
}

//get current user
function getCurrentUser(id) {
	return users.find(user => user.id == id);
}

module.exports = {
	userJoin,
	getCurrentUser
}