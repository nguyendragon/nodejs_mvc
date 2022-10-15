import initWebRouter from './src/api/web';

import express from 'express';
import createError from 'http-errors';
import Helper from './helpers';
require('dotenv').config();
import cors from 'cors';
import cronJob from './src/cron';
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

cronJob();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use(express.static('./src/public'));
initWebRouter(app);

app.use((req, res, next) => {
    next(createError.NotFound('This route does not exist.'));
});

app.use((err, req, res, next) => {
    res.json({
        status: err.status || 500,
        message: err.message,
    });
});

/****************************************************** */

const port = process.env.PORT || 8000;

const USE_SSL = false;

let httpServer = null;

if (!USE_SSL) {
    httpServer = require('http').createServer(app);
} else {
    let options = Helper.ssl;
    httpServer = require('https').createServer(options, app);
}

httpServer.listen(port, () => {
    console.log('Server start port: ' + port);
});
