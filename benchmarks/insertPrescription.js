'use strict';

const fs = require("fs");

module.exports.info  = 'Reading information from file prescriptions';

let bc, contx;
//jump file header
var position = 240;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = async function() {

    const fd = fs.openSync("path/to/file/mimiciii/PRESCRIPTIONS.csv", 'r');

    let line = "";
    const charBuffer = Buffer.alloc(1);

    let args = [];

    while(charBuffer.toString() !== '\n') {
        fs.readSync(fd, charBuffer, 0, 1, position);

        position++;

        line+=charBuffer.toString();

    }

    if(charBuffer.toString() === '\n') {
        line = line.replace(/\r?\n/g,"");

        let entries = line.split(",");

        if (bc.getType() === 'fabric') {
            args.push({
                //function name on smart contract file
                chaincodeFunction: 'insertPrescription',
                //number of entries of each line on PRESCRIPTIONS file
                chaincodeArguments: [entries[0], entries[1], entries[2],
                entries[3], entries[4], entries[5], entries[6], entries[7],
                entries[8], entries[9], entries[10], entries[11], entries[12],
                entries[13], entries[14], entries[15], entries[16], entries[17],
                entries[18]],
            });
        }

        line = "";
    }

    fs.closeSync(fd);

    let results = await bc.invokeSmartContract(contx, 'testecouch', 'v0', args, 4000);

    //print answer on console or file
    //in this project, i chose to print on a file, to colect the execution
    //time of each transaction executed
    for (let result of results) {
        let executionTime = result.GetTimeFinal() - result.GetTimeCreate();

        //console.log(result.GetResult().toString());

        try {
            fs.appendFileSync('path/to/file/EXECUTION_TIME', executionTime + '\n');
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    return results;
};

module.exports.end = function() {

    return Promise.resolve();
};
