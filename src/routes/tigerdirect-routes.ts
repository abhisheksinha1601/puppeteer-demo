import express = require('express');
import { tigerDirectControllers } from '../controllers';

let app = express.Router();

app.get('/get-reviews', tigerDirectControllers.getAllReviews);
// other routes

export let tigerDirectRoutes = app;