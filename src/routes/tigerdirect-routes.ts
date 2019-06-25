import express = require('express');

let app = express.Router();
import { tigerDirectControllers } from '../controllers';

app.get('/get-reviews', tigerDirectControllers.getAllReviews);
// other routes

export let tigerDirectRoutes = app;