const chokidar = require('chokidar');
const fs = require('fs').promises;
const db = require('./db');
const pathB = require('path');

async function readFile(filePath: string): Promise<string> {
    try {
      const data = await fs.readFile(filePath);
        // console.log(data.toString());
      return data.toString();
    } catch (error) {
      console.error(`${new Date().toLocaleString()} Got an error trying to read the file: ${error.message}`);
      return '';
    }
}

module.exports.watch = function () {

    const getOrderNumberFromPath = (pathStr: string) => {
        const arr = pathStr.split('/');
        return arr[arr.length - 1];
    }

    const watcher = chokidar.watch(
      process.env.ORDERS_PATH,
        {
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            },
        }
    );

    watcher.on('add', async(filePath: string) => {
        const fileName = pathB.basename(filePath);
        const orderNumber = parseInt(fileName);
        if(!orderNumber) {
            console.log(`${new Date().toLocaleString()} Wrong file name ${fileName} for ${filePath}`);
            return;
        }

        console.log(`${new Date().toLocaleString()} File ${fileName} has been added`);

        const fileStr: string = await readFile(filePath);
        console.log(`${new Date().toLocaleString()} Got order ${fileName} string: `, fileStr);
        if(!fileStr.length) {
          return;
        }

        const fileStat = await fs.stat(filePath);
        const creationDate: Date = fileStat.birthtime;
        console.log(`${new Date().toLocaleString()} File ${fileName} created on: `, creationDate);

        console.log(`${new Date().toLocaleString()} Gonna create order ${fileName} on db`);
        const newOrder = await db.createOrder(orderNumber,fileStr, creationDate);
        console.log(`${new Date().toLocaleString()} Created order in db: `, newOrder);
    });


}