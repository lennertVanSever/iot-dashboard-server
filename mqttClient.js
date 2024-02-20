const mqtt = require("mqtt");
const { insertRecordFaunaDB, insertAlertFaunaDB } = require("./dataManager");

function setupMqttClient(io) {
  const client = mqtt.connect("mqtt://broker.emqx.io");

  client.on("connect", () => {
    console.log("Connected to MQTT Broker");
    client.subscribe("ehbIoT/sensordata", (err) => {
      if (!err) {
        console.log("Subscribed to the topic: ehbIoT/sensordata");
      } else {
        console.error("Failed to subscribe:", err);
      }
    });
  });

  client.on("message", (topic, message) => {
    console.log(`Message received on topic ${topic}: ${message.toString()}`);
    const record = {
      timestamp: new Date().toISOString(),
      data: JSON.parse(message.toString()),
    };

    insertRecordFaunaDB(record, () => {
      io.emit("sensorData", record);
    });
    if (record.data.battery_voltage < 3.8) {
      insertAlertFaunaDB(record);
    }
  });

  client.on("error", (err) => {
    console.log("Error encountered:", err);
  });
}

module.exports = setupMqttClient;
