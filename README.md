# Clicker Uproar - SERVER SIDE

## The premium clicker game!

### Introduction

This very simple game was made for a job application.

It uses websockets to communicate in real-time between all the clients connected to the app at the same time. Whenever a client clicks in the game,
the click is broadcasted to all the other clients as well.

It uses [Socket.io](https://socket.io/) to handle the websockets in the backend, [Express](https://expressjs.com/) to handle different routes in the
backend, [node-postgres](https://www.npmjs.com/package/pg) to easily handle the Postgres database connection on Heroku's servers and [React.js](https://reactjs.org/) on the front end.

The app is divided into to parts: client and server. **This is the repo of the server part.** The client side things can be found [here](https://github.com/f4irline/clicker-uproar-client).

**It's currently deployed on Heroku** : [Heroku](https://clicker-uproar-thegame.herokuapp.com/).

### The game

The goal of the game is to click the rock and swing the pickaxe and win prizes. Every client can see how many clicks is needed to the next prize, but the client's do not know if the next prize is going to be the small (gold), medium (diamond) or the big (ruby) prize.

All the winners are saved to a PostgreSQL database and are displayed on a separate 'Leaderboards' -page.

### To run

1. Clone this repository anywhere on your local system
2. Clone the [client side repository](https://github.com/f4irline/clicker-uproar-client) to anywhere on your local system (maybe in the same directory as client would be convenient)
3. Install dependencies on both of the new directories: go to both folders via command line and run 'npm install' and wait for the installation to be completed.
4. Start the server side, by going in the folder you just cloned here from the server side repository, and run 'node server.js' there via command line.
5. Start the client side, by going in the folder you just cloned from the [client side repository](https://github.com/f4irline/clicker-uproar-client) and running 'npm start' there via command line.
6. Open up your browser (if it doesn't open up automatically by npm start) and go to 'localhost:3000'. React scripts may take a while to start, so be patient.
