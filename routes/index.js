const express = require('express');
const router = express.Router();
const Ftp = require('../utils/ftp');

router.get('/getOrdersNumbersListByPeriod', async (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.status(401).send('Unauth');
    return;
  }

  const list = await Ftp.getFilesList(req.query.periodDays);
  //
  console.log("Gonna send orders list from ftp with length: ", list ? list.length : 0);
  res.send(list);

});

router.get('/getOrderData', (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.status(401).send('Unauth');
    return;
  }

  Ftp.readFileFromFtp(req.query.orderNumber)
      .then((dataStr) => {
        console.log("Gonna send order data from ftp");
        res.send({ data: dataStr });
      })

  // const dataStr = await Ftp.readFileFromFtp(req.query.orderNumber);
  //
  // console.log("Gonna send order data from ftp");
  // res.send({ data: dataStr });

});

router.get('/getOrderFileModifiedAtStr', (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.status(401).send('Unauth');
    return;
  }

  Ftp.getOrderFileModifiedAtStr(req.query.orderNumber)
      .then((dataStr) => {
        console.log("Gonna send order ModifiedAt from ftp");
        res.send(dataStr);
      })

  // const dataStr = await Ftp.readFileFromFtp(req.query.orderNumber);
  //
  // console.log("Gonna send order data from ftp");
  // res.send({ data: dataStr });

});

router.get('/getOrdersInfoByPeriod', (req, res, next) => {

    if(req.query.st !== process.env.SECRET) {
        res.status(401).send('Unauth');
        return;
    }

    Ftp.getOrdersInfoByPeriod(req.query.periodDays)
        .then((info) => {
            console.log("Gonna send orders infos from ftp with length: ", info ? info.length : 0);
            res.send(info);
        })

    // const dataStr = await Ftp.readFileFromFtp(req.query.orderNumber);
    //
    // console.log("Gonna send order data from ftp");
    // res.send({ data: dataStr });

});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
