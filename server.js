require('dotenv').config()
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const setupMqttClient = require('./mqttClient');
const setupRoutes = require('./routes');
const cors = require('cors');


const app = express();
app.use(cors())
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

setupMqttClient(io);
setupRoutes(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
