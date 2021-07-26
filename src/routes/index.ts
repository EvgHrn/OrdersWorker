import {isBefore, sub} from "date-fns";

const express = require('express');
const router = express.Router();
const iconv = require('iconv-lite');
// const Ftp = require('../utils/ftp');

router.get('/getOrdersNumbersListByPeriod', async (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.sendStatus(401);
    return;
  }

  const filesList = await fs.readDir(process.env.ORDERS_PATH);
  console.log(`${new Date().toLocaleString()} Got files list with length: ${filesList.length}`);

  const list = await filesList.reduce(async (acc, fileName: string  ) => {
    const fileStat = await fs.stat(`${process.env.ORDERS_PATH}/${fileName}`);
    const modifiedDate: Date = fileStat.mtime;
    const startDate = sub(new Date(), { days: req.query.periodDays });
    const isInPeriod = isBefore(startDate, new Date(modifiedDate)); //Jun 24 05:26
    const orderNumberInt = parseInt(fileName);
    if(isInPeriod && !!orderNumberInt) {
        acc.push(orderNumberInt);
    }
    return acc;
  }, Promise.resolve([] as number[]));

  console.log("Gonna send orders list with length: ", list ? list.length : 0);
  res.send(list);

});

router.get('/getOrderData', (req, res, next) => {

  if(req.query.st !== process.env.SECRET) {
    res.sendStatus(401);
    return;
  }

  const buff = fs.readFileSync(`${process.env.ORDERS_PATH}/${req.query.orderNumber}`);
  const dataStr = iconv.decode(buff, 'win1251');

  res.send({ data: dataStr });
});

// router.get('/getOrderFileModifiedAtStr', (req, res, next) => {
//
//   if(req.query.st !== process.env.SECRET) {
//     res.sendStatus(401);
//     return;
//   }
//
//   Ftp.getOrderFileModifiedAtStr(req.query.orderNumber)
//       .then((dataStr: string) => {
//         console.log("Gonna send order ModifiedAt from Ftp");
//         res.send(dataStr);
//       })
//
//   // const dataStr = await Ftp.readFileFromFtp(req.query.orderNumber);
//   //
//   // console.log("Gonna send order data from Ftp");
//   // res.send({ data: dataStr });
//
// });

// router.get('/getOrdersInfoByPeriod', (req, res, next) => {
//
//     if(req.query.st !== process.env.SECRET) {
//         res.sendStatus(401);
//         return;
//     }
//
//     Ftp.getOrdersInfoByPeriod(req.query.periodDays)
//         .then((info) => {
//             console.log("Gonna send orders infos from Ftp with length: ", info ? info.length : 0);
//             res.send(info);
//         })
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
