# Backend IoT Dashboard - Lennert Van Sever

Before starting the backend, install the dependencies

```
npm install
```

Now create a .env file with the following content, make sure to replace yourTokenHere with the actual token

```
FAUNA_DB_TOKEN=yourTokenHere
```

Now run the backend

```
npm start
```

If everything is right you should be able to see the sensor data on http://localhost:3000/data and the alerts on http://localhost:3000/alerts

I mocked three alerts so if there are 3 alerts, it means that there is no problem with the bateries. However it should work that if a bateries goes under 3.8 volts that an alert is added and displayed on the frontend.

For this project the frontend is actually more complicated than the backend. The backend just uses the MQTT package to insert data into the faunaDB. For optimization reasons, the alerts are inserted into a different collection.

Other than that there is new data emited to the frontend via socket io.
