const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const startbtn = document.getElementById('startbtn');
const leavebtn = document.getElementById('leavebtn');

let currentDrawer;
let gameRunning = false;

//Get username and room number from the url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//When a new user joins
console.log(username, room);
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUserList(users);
});

//Update score
socket.on('updateScore', ({ user }) => {
    outputUserList(users);
})

//chat Message recieved from server
socket.on('message', (message) => {
    //Output new messages on DOM
    outputMessage(message);

    //Scroll down for new messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('gameTimer', (time) => {
    outputTime(time);
})

socket.on('gameOver', () => {
    gameRunning = false;
    socket.emit('gameRunning', false);
})

//WORD TO BE GUESSED
let word;

//When Start Button is Clicked
startbtn.addEventListener('click', () => {
    if (gameRunning === false) {
        do {
            word = prompt("What will You Draw?");
        } while (word == '');

        if (word !== null) {
            //tell the word to all clients 
            socket.emit('wordToGuess', (word));
            //update the game status to all clients
            socket.emit('gameRunning', true);
            //emit the start game to show time to all users
            socket.emit('startGame');
            gameRunning = true;
            document.getElementById('startbtn').style.visibility = 'hidden';
        }
    }
    else {
        alert("Game is already running");
    }
})

//When leave room button is clicked
leavebtn.addEventListener('click',()=>{
    if(gameRunning===true){
        alert("You can't leave while the game is running!");
    }
    else{
        window.location = '/';
    }
})

//Submit Form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //Get Message Text
    const msg = e.target.elements.msg.value;
    //Emit Message to server
    console.log(msg + '  ' + word);
    socket.emit('chatMessage', msg);
    //Clear input field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Output message to the DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    console.log(message.text);

    if (message.username === "ADMIN") {
        div.innerHTML = `<p class="admin" > ${message.username} :  ${message.text} </p>`
    }
    else if (message.username === '_') {
        div.innerHTML = `<p class="guessed" >ADMIN :  ${message.text}</p>`
        message.username.points += 10;
    }
    else {
        div.innerHTML = `<p class="user"> ${message.username} :  ${message.text} </p>`
    }
    document.querySelector('.chat-messages').appendChild(div);
}

//Output Time to DOM
function outputTime(time) {
    console.log(time);
    let elem = document.getElementById('time-left');
    document.getElementById('startbtn').style.visibility = 'visible';
    if (time == 'Game Ended !') {
        elem.innerHTML = 'Game Ended!!!';
        setTimeout(() => {
            elem.innerHTML = '';
            socket.emit('gameRunning', false);
        }, 4000)
        gameRunning = false;
        socket.emit('gameRunning', false);
    }
    else {
        gameRunning = true;
        elem.innerHTML = 'Time Left : ' + time + ' s';
    }
}

//Add Room Name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

//Add user list to DOM
function outputUserList(users) {
    userList.innerHTML = "";
    for (each in users) {
        let li = document.createElement('li');
        let name_span = document.createElement('span');
        name_span.className = "statusBoxUserName";
        name_span.innerHTML = `${users[each].username} <br>`;
        li.appendChild(name_span);

        let points_span = document.createElement('span');
        points_span.className = "statusBoxUserPoints";
        points_span.innerHTML = `${users[each].points} PTS`;
        li.appendChild(points_span);

        userList.appendChild(li);
    }
    // userList.innerHTML = `
    //     ${users.map((user)=>`<li>${user.username} - ${user.points} PTS</li>`).join('')}
    // `;
}

