const users = [];

//join user to room

function userJoin(socketId, name, roomId){
	const user = { socketId, name, roomId };

	users.push(user);

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