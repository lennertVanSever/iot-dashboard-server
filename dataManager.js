const fs = require('fs');
const path = require('path');
const { faunaClient, q } = require('./faunaDb');
const dataFilePath = path.join(__dirname, 'data.json');

function isValidRecord(record) {
    return record &&
        record.timestamp &&
        record.data &&
        typeof record.data.location === 'string' &&
        typeof record.data.device_name === 'string' &&
        typeof record.data.battery_voltage === 'number' &&
        !isNaN(parseFloat(record.data.temperature)) &&
        !isNaN(parseFloat(record.data.pressure));
}

async function appendMessageToDataFile(record, callback) {
    fs.readFile(dataFilePath, async (err, data) => {
        let messages = [];
        if (!err && data.length) {
            try {
                messages = JSON.parse(data.toString());
            } catch (parseError) {
                console.error('Error parsing JSON from data file:', parseError);
                return;
            }
        }

        if (isValidRecord(record)) {
            messages.push(record);

            // Attempt to write to FaunaDB
            try {
                const insertResult = await faunaClient.query(
                    q.Create(
                        q.Collection('sensors'),
                        record
                    )
                );
                console.log('FaunaDB Insert Result:', insertResult);
                if (callback) callback();
            } catch (faunaError) {
                console.error('FaunaDB Insert Error:', faunaError);
            }

            if (false) {
                fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2), (writeError) => {
                    if (writeError) {
                        console.error('Error writing to data file:', writeError);
                    } else {
                        console.log('Record appended to data.json');
                        if (callback) callback();
                    }
                });
            }
        } else {
            console.error('Received invalid data. Not saving to file.', record);
        }
    });
}

module.exports = {
    appendMessageToDataFile,
};
