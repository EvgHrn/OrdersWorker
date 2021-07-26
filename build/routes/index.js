"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const express = require('express');
const router = express.Router();
const iconv = require('iconv-lite');
// const Ftp = require('../utils/ftp');
router.get('/getOrdersNumbersListByPeriod', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.st !== process.env.SECRET) {
        res.sendStatus(401);
        return;
    }
    const filesList = yield fs.readDir(process.env.ORDERS_PATH);
    console.log(`${new Date().toLocaleString()} Got files list with length: ${filesList.length}`);
    const list = yield filesList.reduce((acc, fileName) => __awaiter(void 0, void 0, void 0, function* () {
        const fileStat = yield fs.stat(`${process.env.ORDERS_PATH}/${fileName}`);
        const modifiedDate = fileStat.mtime;
        const startDate = date_fns_1.sub(new Date(), { days: req.query.periodDays });
        const isInPeriod = date_fns_1.isBefore(startDate, new Date(modifiedDate)); //Jun 24 05:26
        const orderNumberInt = parseInt(fileName);
        if (isInPeriod && !!orderNumberInt) {
            acc.push(orderNumberInt);
        }
        return acc;
    }), Promise.resolve([]));
    console.log("Gonna send orders list with length: ", list ? list.length : 0);
    res.send(list);
}));
router.get('/getOrderData', (req, res, next) => {
    if (req.query.st !== process.env.SECRET) {
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
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;
//# sourceMappingURL=index.js.map