'use strict';

const fs = require("fs");

module.exports.info  = 'Querying information about a patient';

let bc, contx;

module.exports.init = function(blockchain, context, args) {
    bc = blockchain;
    contx = context;

    return Promise.resolve();
};

module.exports.run = async function() {

    let min = 1;
    let max = 10000;
    //select a random number id between min and max
    let id = Math.floor(Math.random() * (max - min + 1)) + min;
    id = id.toString();

    let args;

    var fs = require('fs');

    if (bc.getType() === 'fabric') {
        args = {
            //function name on smart contract file
            chaincodeFunction: 'queryPatientById',
            //chosen patient id
            chaincodeArguments: [id]
        };
    }

    let results = await bc.querySmartContract(contx, 'testecouch', 'v0', args, 1000);

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
