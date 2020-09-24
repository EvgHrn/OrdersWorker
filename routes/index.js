const express = require('express');
const router = express.Router();
const Ftp = require('../utils/ftp');

router.get('/getOrders/:days', async (req, res, next) => {
  const filesList = await Ftp.getFilesList(req.params.days);
  res.send(filesList.map((fileObj) => fileObj.name));
});

router.get('/getOrderData', async (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.status(401).send('Unauth');
    return;
  }

  const fileString = await Ftp.readFileFromFtp(req, res, req.query.orderNumber);

  console.log("Gonna send order data from ftp");
  res.send(fileString ? { data: fileString } : {});

});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
