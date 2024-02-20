const { faunaClient, q } = require("./faunaDb");

function setupRoutes(app) {
  app.get("/data", async (req, res) => {
    // Query all records from the 'sensors' collection
    try {
      const results = await faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("sensors"))),
          q.Lambda("ref", q.Get(q.Var("ref")))
        )
      );
      // Transform the results to match the desired structure
      const transformedResults = results.data.map((doc) => {
        const timestamp = new Date(doc.ts / 1000).toISOString();
        return {
          timestamp, // Convert FaunaDB timestamp to standard UNIX timestamp if needed
          data: doc.data, // Assuming doc.data contains the sensor data including location, device_name, etc.
        };
      });
      res.json(transformedResults);
    } catch (error) {
      console.error("Error querying FaunaDB:", error);
      res.status(500).send("Error querying data");
    }
  });

  app.get("/data/delete", async (req, res) => {
    try {
      // Fetch all document references from the 'sensors' collection
      let documents = await faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("sensors")), { size: 100000 }), // Adjust size as needed, within FaunaDB limits
          q.Lambda("ref", q.Var("ref"))
        )
      );

      // Delete all fetched documents, handling each promise's result
      const deletionResults = await Promise.allSettled(
        documents.data.map((docRef) => faunaClient.query(q.Delete(docRef)))
      );

      // Filter out successful deletions and errors
      const successfulDeletions = deletionResults.filter(
        (result) => result.status === "fulfilled"
      );
      const errors = deletionResults.filter(
        (result) => result.status === "rejected"
      );

      console.log(
        `Successfully deleted documents: ${successfulDeletions.length}`
      );
      if (errors.length > 0) {
        console.error("Errors occurred during deletion:", errors);
      }

      res
        .status(200)
        .send(
          `Successfully deleted ${successfulDeletions.length} documents. Errors: ${errors.length}`
        );
    } catch (error) {
      console.error("Error deleting documents from FaunaDB:", error);
      res.status(500).send("Error resetting data");
    }
  });
  app.get("/alerts", async (req, res) => {
    try {
      const results = await faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("alerts"))),
          q.Lambda("ref", q.Get(q.Var("ref")))
        )
      );
      // Transform the results for the response
      const transformedResults = results.data.map((doc) => {
        const timestamp = new Date(doc.ts / 1000).toISOString();
        return {
          timestamp, // Keeping the timestamp in ISO format for consistency
          data: doc.data, // Contains the alert data, including sensorId and message
        };
      });
      res.json(transformedResults);
    } catch (error) {
      console.error("Error querying FaunaDB for alerts:", error);
      res.status(500).send("Error querying alerts");
    }
  });
}

module.exports = setupRoutes;
