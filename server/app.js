const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
// const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
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

// part of game
let userQueue = [];
let word_to_guess;
let gameRunning = false;
let wordGuessedBy = '';

io.on('connection', (socket) => {
    console.log('connection with socket succesful!', socket.id);
    // v2
    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
        socket.emit('admin_message', (`Welcome! ${data.userName}`));
        socket.broadcast.to(data.room).emit('admin_message', (`${data.userName} has joined the chat!`));
        // todo: dont allow same username to enter same room
        userQueue.push(data.userName);

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

    //Listen for game status - v2
    socket.on('game_running', ({ room, running }) => {
        gameRunning = running;
        console.log("game running: ", gameRunning);
        io.to(room).emit('game_running', running);
    })
    //Listen for game status
    socket.on('gameRunning', (val) => {
        gameRunning = val;
        console.log(gameRunning);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('gameRunning', val);
    })

    socket.on("game_over", ({ author,room }) => {
        console.log("game over");
        gameRunning = false;
        wordGuessedBy = author;
        io.to(room).emit('game_over');
    })

    //Listen for word that will be drawn - v2
    socket.on('word_to_guess', (word) => {
        console.log("word to guess: ", word);
        word_to_guess = word;
    })

    //Listen For Chat Message - v2
    socket.on('send_message', (msg) => {
        socket.to(msg.room).emit('receive_message', { ...msg, word: word_to_guess });
    })
    //Listen For start-game timer-v2
    socket.on('start_game', ({ userName, room }) => {
        console.log("game started in ", userName, room);
        let counter = 30;
        let countdown = setInterval(() => {
            io.to(room).emit('game_timer', counter);
            counter--;
            if (counter === 0 || gameRunning === false) {
                //show timer in all the screens
                io.to(room).emit('game_timer', 0);
                //tell clients that update gameRunning status
                io.to(room).emit('game_over');
                io.to(room).emit('word_guessed', (`Word has been guessed by: ${wordGuessedBy}`));
                clearInterval(countdown);
            }
        }, 1000);
    })

    //listen For start-game time
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

    // draw on canvas
    socket.on('draw_line', ({ prevPoint, currentPoint, color, room }) => {
        socket.broadcast.to(room).emit('draw_line', { prevPoint, currentPoint, color })
    })

    // clear canvas
    socket.on('clear_canvas', ({ room }) => io.to(room).emit('clear_canvas'))

    //When A User disconnects
    socket.on('disconnect', () => {
        // const user = userLeave(socket.id);
        // console.log(user);
        // if (user) {

        //     //Send user and room info
        //     io.to(user.room).emit('roomUsers', {
        //         room: user.room,
        //         users: getRoomUsers(user.room)
        //     });
        // }
    });
});

app.use(express.static('public'));

server.listen(PORT, () => console.log(`server running on port ${PORT}`));