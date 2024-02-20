const { faunaClient, q } = require("./faunaDb");

function isValidRecord(record) {
  return (
    record &&
    record.timestamp &&
    record.data &&
    typeof record.data.location === "string" &&
    typeof record.data.device_name === "string" &&
    typeof record.data.battery_voltage === "number" &&
    !isNaN(parseFloat(record.data.temperature)) &&
    !isNaN(parseFloat(record.data.pressure))
  );
}

async function insertRecordFaunaDB(record, callback) {
  if (isValidRecord(record)) {
    // Attempt to write to FaunaDB
    try {
      const insertResult = await faunaClient.query(
        q.Create(q.Collection("sensors"), record)
      );
      console.log("FaunaDB Insert Result:", insertResult);
      if (callback) callback();
    } catch (faunaError) {
      console.error("FaunaDB Insert Error:", faunaError);
    }
  } else {
    console.error("Received invalid data.", record);
  }
}

async function insertAlertFaunaDB(record) {
  try {
    // Assume the sensorId is part of the record.data; adjust as necessary
    const sensorId = `${record.data.location}-${record.data.device_name}`;
    const alertRecord = {
      data: {
        sensorId: sensorId,
        timestamp: record.timestamp,
        problemId: "LOW_BATTERY_VOLTAGE",
      },
    };
    const insertResult = await faunaClient.query(
      q.Create(q.Collection("alerts"), alertRecord)
    );
    console.log("FaunaDB Alert Insert Result:", insertResult);
  } catch (faunaError) {
    console.error("FaunaDB Alert Insert Error:", faunaError);
  }
}

module.exports = {
  insertRecordFaunaDB,
  insertAlertFaunaDB,
};
