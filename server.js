const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const { Pool } = require('pg');

// Postgres local settings
// const localSettings = require('./localSettings.json');
// const pool = new Pool(localSettings);

// Postgres heroku settings
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});  

/** 
 * Holds the total amount of clicks. The amount is
 * fetched from the database whenever a new client has connected
 * AND the new client is the only client connected. The amount is
 * increased when any of the clients clicks a button. The amount is 
*/
let totalClicksAmount = 0;

/**
 * CORS options. Accept requests from localhost and the actual
 * domain of the app.
 * 
 * Not used right now because of some problems with mobile devices and 
 * Mac's.
 */
const whitelist= ['http://localhost:3000', 'https://clicker-uproar-thegame.herokuapp.com'];
const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
}

/**
 * Handles get requests to '/leaderboards'. Gets the 
 * wins from database and responds with the data.
 */
app.get('/leaderboards', cors(corsOptions), (req, res) => {
    getWinsFromDatabase()
    .then((winners) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(winners.rows);
    });
});

/**
 * Socket listener
 */
io.on('connection', socket => {

    console.log('Connection made, id: ', socket.id);

    // When a client connects, if the client is the only client in the server,
    // fetch the amount of clicks to the global 'totalClicksAmount' variable 
    // from the database and emit the initclicks event to the client.
    if (io.engine.clientsCount === 1) {
        console.log('Getting clicks from database');
        getClicksFromDatabase()
        .then((res) => {
            totalClicksAmount = res.rows[0].clicks;
            socket.emit('initclicks', totalClicksAmount);
        })
    } else {
        // If the new client is not the only client, get the last client before the new client
        // and send a request to it for the amount of clicks.
        const targetSocket = Object.keys(io.sockets.sockets)[io.engine.clientsCount - 2];
        io.to(`${targetSocket}`).emit('requestClicks', socket.id); // socket.id is the ID of the new client
    }

    // When a new client connects, it sends a request for the clicks amount to the last client
    // before the new client. After that the client which responds to the request emits a 
    // 'newConnection' event with the amount of clicks and the id of the new client.
    socket.on('newConnection', (data) => {
        console.log(data);
        io.to(`${data.socket}`).emit('initclicks', data.clicks); // Send the amount of clicks to the new client
    })

    // When the socket disconnects, just log that the client has disconnected
    // and check if it was the last client. If it was, send the amount of clicks to
    // the database (to avoid losing the amount of clicks if the server happens to
    // shutdown.
    socket.on('disconnect', () => {
        console.log(io.engine.clientsCount);
        if (io.engine.clientsCount <= 1) {
            sendClicksToDatabase(totalClicksAmount);
        }
        console.log('Clients: ', io.engine.clientsCount);
        console.log('User disconnected, id: ', socket.id);
    });

    // When the client clicks grow the global 'totalClicksAmount' value by one
    // and emit a broadcast with the amount of clicks to the other clients.
    socket.on('clicked', (data) => {
        totalClicksAmount++;
        socket.broadcast.emit('clicked', totalClicksAmount);
        let win = countClicks(); // Check if the client has won something after the click event
        if (win !== null) {
            sendWinToDatabase(win, data); // Send the win to the Postgres database
            socket.emit('win', win); // Let the client know that he/she has won something
        }
    });
});

/**
 * Checks if the client has won something.
 * 
 * Every 500th click wins ruby, every 200th click wins diamond
 * and every 100th click wins gold. If there's overlapping wins,
 * the client wins the biggest amount.
 * 
 * @param {Object} data 
 */
function countClicks() {
    if (totalClicksAmount % 500 === 0) {
        return 'ruby';
    } else if (totalClicksAmount % 200 === 0) {
        return 'diamond';
    } else if (totalClicksAmount % 100 === 0) {
        return 'gold';
    } else {
        return null;
    }
}

/**
 * Get the amount of clicks from database.
 */
async function getClicksFromDatabase() {
    try {
        return await pool.query('SELECT clicks FROM clicks;');
    } catch(err) {
        console.log(err.stack);
    };
}

/**
 * Send the amount of clicks to database table 'clicks'.
 * 
 * @param {Object} data holds the amount of clicks in an object
 */
async function sendClicksToDatabase(clicks) {
    console.log('Sending clicks: '+clicks);
    try {
        return await pool.query(`UPDATE clicks SET clicks = ${clicks} WHERE ID = 1;`);
    } catch (err) {
        console.log(err.stack);
    }
}

/**
 * Gets all the win entries from database.
 */
async function getWinsFromDatabase() {
    try {
        return await pool.query('SELECT * FROM wins;');
    } catch(err) {
        console.log(err.stack);
    };
}

/**
 * Sends a win to a database table 'win'.
 * 
 * @param {string} winAmount either "big", "medium" or "small"
 * @param {Object} data holds the user's name and the amount of clicks he's done
 */
async function sendWinToDatabase(winAmount, data) {
    console.log(data.user)
    console.log(data.userClicks);
    try {
        return await pool.query(`INSERT INTO wins (user_name, clicks, win_amount) 
                                VALUES ('${data.user}', ${data.userClicks}, '${winAmount}');`);
    } catch (err) {
        console.log(err.stack);
    }
}


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));