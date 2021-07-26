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
const chokidar = require('chokidar');
const fs = require('fs').promises;
const db = require('./db');
function readFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile(filePath);
            // console.log(data.toString());
            return data.toString();
        }
        catch (error) {
            console.error(`${new Date().toLocaleString()} Got an error trying to read the file: ${error.message}`);
            return '';
        }
    });
}
module.exports.watch = function () {
    const getOrderNumberFromPath = (pathStr) => {
        const arr = pathStr.split('/');
        return arr[arr.length - 1];
    };
    const watcher = chokidar.watch(process.env.ORDERS_PATH, {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        },
    });
    watcher.on('add', (filePath) => __awaiter(this, void 0, void 0, function* () {
        const fileName = path.basename(filePath);
        const orderNumber = parseInt(fileName);
        if (!orderNumber) {
            console.log(`${new Date().toLocaleString()} Wrong file name ${fileName} for ${filePath}`);
            return;
        }
        console.log(`${new Date().toLocaleString()} File ${fileName} has been added`);
        const fileStr = yield readFile(filePath);
        console.log(`${new Date().toLocaleString()} Got order ${fileName} string: `, fileStr);
        if (!fileStr.length) {
            return;
        }
        const fileStat = yield fs.stat(filePath);
        const creationDate = fileStat.birthtime;
        console.log(`${new Date().toLocaleString()} File ${fileName} created on: `, creationDate);
        console.log(`${new Date().toLocaleString()} Gonna create order ${fileName} on db`);
        const newOrder = yield db.createOrder(orderNumber, fileStr, creationDate);
        console.log(`${new Date().toLocaleString()} Created order in db: `, newOrder);
    }));
};
//# sourceMappingURL=watcher.js.map