require('dotenv').config()
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const setupMqttClient = require('./mqttClient');
const setupRoutes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

setupMqttClient(io);
setupRoutes(app);

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
