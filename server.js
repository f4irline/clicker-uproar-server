const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});  

io.on('connection', socket => {

    console.log('Connection made, id: ', socket.id);

    if (io.engine.clientsCount === 1) {
        console.log('Getting clicks from database');
        getClicksFromDatabase()
        .then(res => {
            socket.emit('initclicks', res.rows[0].clicks);
        })
    } else {
        socket.broadcast.emit('requestClicks', socket.id);
    }

    socket.on('newConnection', (data) => {
        console.log(data);
        io.to(`${data.socket}`).emit('initclicks', data.clicks);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected, id: ', socket.id);
    });

    socket.on('clicked', (data) => {
        socket.broadcast.emit('clicked', data);
        let win = countClicks(data);
        if (win !== null) {
            let winAmount = countClicks(data);
            sendWinToDatabase(winAmount, data);
            socket.emit('win', 'You win ' + winAmount + '!');
        }
    });

    socket.on('unload', (data) => {
        if (io.engine.clientsCount === 1) {
            console.log(io.engine.clientsCount);
            sendClicksToDatabase(data);
        }
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

async function getClicksFromDatabase() {
    try {
        return await pool.query('SELECT clicks FROM clicks;');
    } catch(err) {
        console.log(err.stack);
    };
}

async function sendClicksToDatabase(data) {
    console.log('Sending clicks: '+data.clicks);
    try {
        return await pool.query(`UPDATE clicks SET clicks = ${data.clicks} WHERE ID = 1;`);
    } catch (err) {
        console.log(err.stack);
    }
}

async function sendWinToDatabase(winAmount, data) {
    console.log(data.user)
    console.log(data.clicks);
    try {
        return await pool.query(`INSERT INTO wins (user_name, clicks, win_amount) 
                                VALUES ('${data.user}', ${data.clicks}, '${winAmount}');`);
    } catch (err) {
        console.log(err.stack);
    }
}


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));