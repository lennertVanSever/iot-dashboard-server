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

module.exports = {
  insertRecordFaunaDB,
};
