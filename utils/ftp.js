// const hash = require('object-hash');
const sub = require('date-fns/sub');
const isBefore = require('date-fns/isBefore');
const parse = require('date-fns/parse');
const PromiseFtp = require('promise-ftp');
const ftp = require("basic-ftp");
const fs = require('fs');
const iconv = require('iconv-lite');

const ftpPromise = new PromiseFtp();
const client = new ftp.Client();

class Ftp {

    static getFilesList = async (days) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        const startDate = sub(new Date(), { days: days });
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            // console.log(await client.list('change/access'));
            const fileList = await client.list('change/access');
            client.close();
            const filteredFileList = fileList.filter((fileObj) => isBefore(startDate, parse(fileObj.rawModifiedAt, 'MM-dd-yy hh:mmaa', new Date())));
            return  filteredFileList;
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static readFileFromFtp = async (orderNumber) => {
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            await client.downloadTo(`orders/${orderNumber}`, `/change/access/${orderNumber}`);
            client.close();
            const buff = fs.readFileSync(`orders/${orderNumber}`);
            return iconv.decode(buff, 'win1251');
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static getFileFromFtp = async (fileName) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: true
            });
            console.log(await client.list());
            await client.downloadTo(fileName, fileName);
            client.close();
            return fs.readFileSync(fileName, 'utf8');
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static uploadFileToFtp = async (localPathFileName, remoteFileName) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            console.log(await client.list());
            await client.uploadFrom(localPathFileName, remoteFileName);
            client.close();
            return true;
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static uploadDataFile = async (fileName) => {
        const data = await Db.getAllTours();
        const tours = data.map((tour) => applyDurationsToActivitiesBlocksForDashboard(tour._doc));
        console.log("Getting tours complete");
        // const aloneActivitiesBlocks = await Db.getAloneActivitiesBlocks();
        // console.log("Getting aloneActivitiesBlocks complete");
        const excelFileResult = await this.createExcel(fileName, tours, []);
        if (excelFileResult) {
            console.log("Excel created");
            const uploadingResult = await this.uploadFileToFtp(fileName, `/change/access/${fileName}`);
            if(uploadingResult) {
                console.log("Excel file uploaded");
            } else {
                console.log("Excel file uploading error");
            }
        } else {
            console.log("Excel creating error");
        }
    }
}

module.exports = Ftp;