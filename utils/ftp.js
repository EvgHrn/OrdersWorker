// const hash = require('object-hash');
const sub = require('date-fns/sub');
const isBefore = require('date-fns/isBefore');
const parse = require('date-fns/parse');
const ftp = require("basic-ftp");
const fs = require('fs');
const iconv = require('iconv-lite');

// const client = new ftp.Client();

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
            const fileList = await client.list('change/access');
            console.log("Got files list: ", fileList);
            client.close();
            return fileList.reduce((acc, fileObj) => {
                const isInPeriod = isBefore(startDate, parse(fileObj.rawModifiedAt, 'MM-dd-yy hh:mmaa', new Date()));
                const orderNumberInt = parseInt(fileObj.name);
                if(isInPeriod && !!orderNumberInt) {
                    acc.push(orderNumberInt);
                }
                return acc;
            }, []);
        }
        catch(err) {
            console.log("Ftp error: ", err);
            client.close();
            return false;
        }
    }

    static getOrdersInfoByPeriod = async (days) => {
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
            const fileList = await client.list('change/access');
            console.log("Got files list: ", fileList);
            client.close();
            return fileList.reduce((acc, fileObj) => {
                const isInPeriod = isBefore(startDate, parse(fileObj.rawModifiedAt, 'MM-dd-yy hh:mmaa', new Date()));
                if(isInPeriod) {
                    acc.push(fileObj);
                }
                return acc;
            }, []);
        }
        catch(err) {
            console.log("Ftp error: ", err);
            client.close();
            return false;
        }
    }

    static getOrderFileModifiedAtStr = async (orderNumber) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            const fileList = await client.list('change/access');
            // console.log("Got files list: ", fileList);
            client.close();
            const file = fileList.find((fileObj) => fileObj.name === orderNumber.toString());
            if(file) {
                if(!file.modifiedAt && !file.rawModifiedAt) {
                    return false;
                }
                return file.modifiedAt ? file.modifiedAt : file.rawModifiedAt;
            } else {
                return false;
            }

            // return fileList.reduce((acc, fileObj) => {
            //     const isInPeriod = isBefore(startDate, parse(fileObj.rawModifiedAt, 'MM-dd-yy hh:mmaa', new Date()));
            //     const orderNumberInt = parseInt(fileObj.name);
            //     if(isInPeriod && !!orderNumberInt) {
            //         acc.push(orderNumberInt);
            //     }
            //     return acc;
            // }, []);
        }
        catch(err) {
            console.log("Ftp error: ", err);
            client.close();
            return false;
        }
    }

    static readFileFromFtp = async (orderNumber) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            await client.downloadTo(`${orderNumber}`, `/change/access/${orderNumber}`);
            client.close();
            const buff = fs.readFileSync(`${orderNumber}`);
            fs.unlinkSync(`${orderNumber}`);
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