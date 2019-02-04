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

### To run

1. Clone this repository anywhere on your local system
2. Clone the [client side repository](https://github.com/f4irline/clicker-uproar-client) to anywhere on your local system (maybe in the same directory as client would be convenient)
3. Start the server side, by going in the folder you just cloned here from the client side repository, and run 'node server.js' there via command line.
4. Start the client side, by going in the folder you just cloned from the [client side repository](https://github.com/f4irline/clicker-uproar-client) and running 'npm start' there via command line.
5. Open up your browser (if it doesn't open up automatically by npm start) and go to 'localhost:3000'. React scripts may take a while to start, so be patient.