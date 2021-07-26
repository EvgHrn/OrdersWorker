const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const watcher = require('./utils/watcher');
const https = require('https');

const indexRouter = require('./routes');
// const usersRouter = require('./routes/users');

require('dotenv').config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use('/', indexRouter);
// app.use('/users', usersRouter);

watcher.watch();

const port = process.env.PORT;

const server = https.createServer(
  {
      key: fs.readFileSync(process.env.SERT_KEY),
      cert: fs.readFileSync(process.env.SERT_CERT),
      ca: fs.readFileSync(process.env.SERT_CA)
  }, app);

server.listen(port);

module.exports = app;
