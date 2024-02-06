// Assuming faunaDB.js is set up correctly and exported faunaClient and q
const { faunaClient, q } = require('./faunaDb');
const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, 'data.json');

function setupRoutes(app) {
    app.get('/data', async (req, res) => {
        if (false) {
            fs.readFile(dataFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading data file:', err);
                    return res.status(500).send('Error reading data file');
                }
                try {
                    const jsonData = JSON.parse(data);
                    res.json(jsonData);
                } catch (parseError) {
                    console.error('Error parsing JSON from data file:', parseError);
                    res.status(500).send('Error parsing data file');
                }
            });
        }

        // Query all records from the 'sensors' collection
        try {
            const results = await faunaClient.query(
                q.Map(
                    q.Paginate(q.Documents(q.Collection('sensors'))),
                    q.Lambda('ref', q.Get(q.Var('ref')))
                )
            );
            // Transform the results to match the desired structure
            const transformedResults = results.data.map((doc) => {
                const timestamp = new Date(doc.ts / 1000).toISOString();
                return {
                    timestamp, // Convert FaunaDB timestamp to standard UNIX timestamp if needed
                    data: doc.data // Assuming doc.data contains the sensor data including location, device_name, etc.
                };
            });
            res.json(transformedResults);
        } catch (error) {
            console.error('Error querying FaunaDB:', error);
            res.status(500).send('Error querying data');
        }
    });

    app.get('/data/delete', async (req, res) => {
        if (false) {
            fs.writeFile(dataFilePath, JSON.stringify([], null, 2), (writeError) => {
                if (writeError) {
                    console.error('Error resetting data file:', writeError);
                    return res.status(500).send('Error resetting data file');
                }
                console.log('Data file has been reset.');
                res.status(200).send('Data file has been reset.');
            });
        }
        try {
            // Fetch all document references from the 'sensors' collection
            const documents = await faunaClient.query(
                q.Map(
                    q.Paginate(q.Documents(q.Collection('sensors'))),
                    q.Lambda('ref', q.Var('ref'))
                )
            );

            // Delete all fetched documents
            const deletionResults = await Promise.all(
                documents.data.map((docRef) => faunaClient.query(q.Delete(docRef)))
            );

            console.log('All documents in `sensors` collection have been deleted', deletionResults);
            res.status(200).send('All data has been reset.');
        } catch (error) {
            console.error('Error deleting documents from FaunaDB:', error);
            res.status(500).send('Error resetting data');
        }
    });
}

module.exports = setupRoutes;
