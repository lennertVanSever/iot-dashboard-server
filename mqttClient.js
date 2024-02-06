const mqtt = require('mqtt');
const appendMessageToDataFile = require('./dataManager').appendMessageToDataFile;

function setupMqttClient(io) {
    const client = mqtt.connect('mqtt://broker.emqx.io');

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        client.subscribe('ehbIoT/sensordata', (err) => {
            if (!err) {
                console.log('Subscribed to the topic: ehbIoT/sensordata');
            } else {
                console.error('Failed to subscribe:', err);
            }
        });
    });

    client.on('message', (topic, message) => {
        console.log(`Message received on topic ${topic}: ${message.toString()}`);
        const record = {
            timestamp: new Date().toISOString(),
            data: JSON.parse(message.toString()),
        };

        appendMessageToDataFile(record, () => {
            io.emit('sensorData', record);
        });
    });

    client.on('error', (err) => {
        console.log('Error encountered:', err);
    });
}

module.exports = setupMqttClient;
