const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const URL = 'https://clicker-uproar.firebaseio.com/clicks.json';

// This is what the socket.io syntax is like, we will work this later
io.on('connection', socket => {
    console.log('Connection made, id: ', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected, id: ', socket.id);
    });

    socket.on('clicked', (data) => {
        socket.broadcast.emit('clicked', data);
        let win = countClicks(data);
        if (win !== null) {
            sendWinToDatabase(socket, data)
                .then(res => {
                    socket.emit('win', res);
                });
            // socket.emit('win', 'You win ' + countClicks(data) + '!');
        }
    });

    socket.on('unload', (data) => {
        sendClicksToDatabase(data);
    })
});

function countClicks(data) {
    if (data.clicks % 50 === 0) {
        return 'big';
    } else if (data.clicks % 20 === 0) {
        return 'medium';
    } else if (data.clicks % 10 === 0) {
        return 'small';
    } else {
        return null;
    }
}

function sendClicksToDatabase(data) {
    console.log('Sending clicks: ' + data.clicks);
}

async function sendWinToDatabase(socket, data) {
    console.log(socket.id);
    console.log(data.user)
    console.log(data.clicks);
    const response = await fetch(URL);
    return response;
}


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));