const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const dotenv = require('dotenv');
dotenv.config();

// express server
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

//static folder 
app.use(express.static(__dirname + '/assets'));
app.use(express.json());
app.use(cors());

let word;
let gameRunning = false;
//Run when user connects
io.on('connection', (socket) => {
    console.log('connection with socket succesful!', socket.id);
    // v2
    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
        socket.emit('admin_message', (`Welcome ${data.userName}`));
        //Broadcast to everyone expect the one who joined
        socket.broadcast.to(data.room).emit('admin_message', (`${data.userName} has joined the chat!`));

    });

    //When a new user joins
    socket.on('joinRoom', ({ userName, room }) => {
        console.log(userName + " has joined the room " + room);
        const user = userJoin(socket.id, userName, room, 0);
        socket.join(room);
        //Welcome current user
        socket.emit('message', formatMessage('ADMIN', `Welcome ${userName}`));

        //Broadcast to everyone expect the one who joined
        socket.broadcast.to(user.room).emit('message', formatMessage('ADMIN', `${userName} has joined the chat!`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for game status
    socket.on('gameRunning', (val) => {
        gameRunning = val;
        console.log(gameRunning);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('gameRunning', val);
    })

    //Listen for word that will be drawn
    socket.on('wordToGuess', (text) => {
        console.log(text);
        word = text;
    })

    //Listen For Chat Message
    socket.on('chatMessage', (msg) => {
        console.log(gameRunning + "status of game");
        const user = getCurrentUser(socket.id);
        if (msg == word && gameRunning) {
            user.points += 10;
            io.to(user.room).emit('message', formatMessage('_', `${user.username} guessed the word`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        else io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    //Listen For Chat Message - v2
    socket.on('send_message', (msg) => {
        socket.to(msg.room).emit('receive_message', msg);
    })

    //Listen For start-game timer
    socket.on('startGame', () => {
        const user = getCurrentUser(socket.id);
        let counter = 30;
        let countdown = setInterval(() => {
            io.to(user.room).emit('gameTimer', counter);
            counter--;
            if (counter === 0) {
                //show timer in all the screens
                io.to(user.room).emit('gameTimer', "Game Ended !");
                //tell clients that update gameRunning status
                io.to(user.room).emit('gameOver');
                clearInterval(countdown);
            }
        }, 1000);
    })

    socket.on('draw_line', ({ prevPoint, currentPoint, color, room }) => {
        socket.broadcast.to(room).emit('draw_line', { prevPoint, currentPoint, color })
    })
    //Listen for things to drawn on canvas and broadcast it on all clients.
    socket.on('draw', (data) => {
        // console.log("server recieved: " ,data);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('drawData', data);
    })

    //Reset position of mouse whenver someone draws
    socket.on('down', (data) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('onMouseDown', data);
    })

    // clear canvas v2
    socket.on('clear_canvas', ({ room }) => io.to(room).emit('clear_canvas'))

    //When A User disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        // console.log(user);
        if (user) {
            io.to(user.room).emit('message', formatMessage('ADMIN', `${user.username} has left the room`));

            //Send user and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('../public/index.html', { root: __dirname });
});

app.get('/chat-room', (req, res) => {
    res.sendFile('./chat-room.html', { root: __dirname });
});

server.listen(PORT, () => console.log(`server running on port ${PORT}`));