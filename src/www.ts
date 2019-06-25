import express = require('express');
import http = require('http');
import { tigerDirectRoutes } from './routes/tigerdirect-routes';

const PORT = 4500;

let app = express();

app.use('/tigerdirect', tigerDirectRoutes);
// routes for other modules

let server = http.createServer(app);
server.listen(PORT, () => {
    console.log("Server started....");
    console.log("Listening on port: " + PORT);
});