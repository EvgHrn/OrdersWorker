const express = require('express');
const router = express.Router();
const Ftp = require('../utils/ftp');

router.get('/getOrders/:days', async (req, res, next) => {
  const filesList = await Ftp.getFilesList(req.params.days);
  res.send(filesList.map((fileObj) => fileObj.name));
});

router.get('/getOrderData/:orderNumber', async (req, res, next) => {
  const fileString = await Ftp.readFileFromFtp(req, res, req.params.orderNumber);
  res.send(fileString);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
