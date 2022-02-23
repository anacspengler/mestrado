/**
 * Marble asset management chaincode written in node.js, implementing {@link ChaincodeInterface}.
 * @type {SimpleChaincode}
 * @extends {ChaincodeInterface}
 */
let Chaincode = class {
    /**
     * Called during chaincode instantiate and upgrade. This method can be used
     * to initialize asset states.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub is implemented by the fabric-shim
     * library and passed to the {@link ChaincodeInterface} calls by the Hyperledger Fabric platform. The stub
     * encapsulates the APIs between the chaincode implementation and the Fabric peer.
     * @return {Promise<SuccessResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async Init(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        console.info('=========== Instantiated Marbles Chaincode ===========');
        return shim.success();
    }

    [...]

    /**
     * Creates a new patient with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: gender. Index 3: dob. Index 4: dod. Index 5: dodHosp. Index 6: dodSsn. 
     * Index 7: expireFlag.
     */
    async insertPatient(stub, args) {
        if (args.length !== 8) {
            throw new Error('Incorrect number of arguments. Expecting 8');
        }
        // ==== Input sanitation ====
        console.log('--- start init patient ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[3].length <= 0) {
            throw new Error('4rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let gender = args[2];
        let dob = args[3];
        let dod = args[4];
        let dodHosp = args[5];
        let dodSsn = args[6];
        let expireFlag = parseInt(args[7]);

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(subjectId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + subjectId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'patients';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.gender = gender;
        input.dob = dob;
        input.dod = dod;
        input.dodHosp = dodHosp;
        input.dodSsn = dodSsn;
        input.expireFlag = expireFlag;

        // === Save an input to state ===
        await stub.putState(subjectId, Buffer.from(JSON.stringify(input)));
        let indexName = 'docType~subjectId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.docType, input.subjectId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(indexName, Buffer.from(subjectNameIndexKey));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init patient');

        return Buffer.from(JSON.stringify(input));
    };

    [...]

    /**
     * Creates a dictionary of items with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: itemid.
     * Index 2: label. Index 3: abbreviation. Index 4: dbsource. Index 5: linksto. 
     * Index 6: category. Index 7: unitname. Index 8: paramType. Index 9: conceptid
     */
    async insertDitem(stub, args) {
        if (args.length !== 10) {
            throw new Error('Incorrect number of arguments. Expecting 10');
        }
        // ==== Input sanitation ====
        console.log('--- start init item dictionary ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
    
        let rowId = args[0];
        let itemid = args[1];
        let label = args[2];
        let abbreviation = args[3];
        let dbsource = args[4];
        let linksto = args[5];
        let category = args[6];
        let unitname = args[7];
        let paramType = args[8];
        let conceptid = args[9];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(itemid);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + itemid);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'd_items';
        input.rowId = rowId;
        input.itemid = itemid;
        input.label = label;
        input.abbreviation = abbreviation;
        input.dbsource = dbsource;
        input.linksto = linksto;
        input.category  = category;
        input.unitname = unitname;
        input.paramType = paramType;
        input.conceptid = conceptid;
        
        // === Save an input to state ===
        await stub.putState(itemid, Buffer.from(JSON.stringify(input)));
        let indexName = 'itemid';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.itemid]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init item dictionary');

        return Buffer.from(JSON.stringify(input));
    };

    [...]

    /**
     * Creates a new prescription with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: startdate. Index 5: enddate. Index 6: drugType. 
     * Index 7: drug. Index 8: drugNamePoe. Index 9: drugNameGeneric. Index 10: formularyDrugCd.
     * Index 11: gsn. Index 12: ndc. Index 13: prodStrength. Index 14: doseValRx.
     * Index 15: doseUnitRx. Index 16: formValDisp. Index 17: formUnitDisp. 
     * Index 18: route.
     */
    async insertPrescription(stub, args) {
        if (args.length !== 19) {
            throw new Error('Incorrect number of arguments. Expecting 19');
        }
        // ==== Input sanitation ====
        console.log('--- start init prescription ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }
        if (args[6].length <= 0) {
            throw new Error('7rd argument must be a non-empty string');
        }
        if (args[7].length <= 0) {
            throw new Error('8rd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let startdate = args[4];
        let enddate = args[5];
        let drugType = args[6];
        let drug = args[7];
        let drugNamePoe = args[8];
        let drugNameGeneric = args[9];
        let formularyDrugCd = args[10];
        let gsn = args[11];
        let ndc = args[12];
        let prodStrength = args[13];
        let doseValRx = args[14];
        let doseUnitRx = args[15];
        let formValDisp = args[16];
        let formUnitDisp = args[17];
        let route = args[18];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(rowId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + rowId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'prescription';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.startdate = startdate;
        input.enddate = enddate;
        input.drugType = drugType;
        input.drug = drug;
        input.drugNamePoe = drugNamePoe;
        input.drugNameGeneric = drugNameGeneric;
        input.formularyDrugCd = formularyDrugCd;
        input.gsn = gsn;
        input.ndc = ndc;
        input.prodStrength = prodStrength;
        input.doseValRx = doseValRx;
        input.doseUnitRx = doseUnitRx;
        input.formValDisp = formValDisp;
        input.formUnitDisp = formUnitDisp;
        input.route = route;

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init prescription');

        return Buffer.from(JSON.stringify(input));
    };

    [...]

    /**
     * Creates a new input event mv with the given attributes.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: rowId. Index 1: subjectId.
     * Index 2: hadmId. Index 3: icustayId. Index 4: starttime. Index 5: endtime. Index 6: itemid. 
     * Index 7: amount. Index 8: amountuom. Index 9: rate. Index 10: rateuom.
     * Index 11: storetime. Index 12: cgid. Index 13: orderid. Index 14: linkorderid.
     * Index 15: ordercategoryname. Index 16: secondarycategoryname. Index 17: ordercomponenttypedescription. 
     * Index 18: ordercategorydescription. Index 19: patientweight. Index 20: totalamount. Index 21: totalamountuom.
     * Index 22: isopenbag. Index 23: continueinnextdept. Index 24: cancelreason. Index 25: statusdescription.
     * Index 26: commentsEditedby. Index 27: commentsCanceledby. Index 28: commentsDate. 
     * Index 29: originalamount. Index 30: originalrate. 
     */
    async insertInputeventMv(stub, args) {
        if (args.length !== 31) {
            throw new Error('Incorrect number of arguments. Expecting 31');
        }
        // ==== Input sanitation ====
        console.log('--- start init input event mv ---');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }

        let rowId = args[0];
        let subjectId = args[1];
        let hadmId = args[2];
        let icustayId = args[3];
        let starttime = args[4]
        let endtime = args[5];
        let itemid = args[6];
        let amount = args[7];
        let amountuom = args[8];
        let rate = args[9];
        let rateuom = args[10];
        let storetime = args[11];
        let cgid = args[12];
        let orderid = args[13];
        let linkorderid = args[14];
        let ordercategoryname = args[15];
        let secondarycategoryname = args[16];
        let ordercomponenttypedescription = args[17];
        let ordercategorydescription = args[18];
        let patientweight = args[19];
        let totalamount = args[20];
        let totalamountuom = args[21];
        let isopenbag = args[22];
        let continueinnextdept = args[23];
        let cancelreason = args[24];
        let statusdescription = args[25];
        let commentsEditedby = args[26];
        let commentsCanceledby = args[27];
        let commentsDate = args[28];
        let originalamount = args[29];
        let originalrate = args[30];

        // // ==== Check if an input already exists ====
        // let inputState = await stub.getState(rowId);
        // if (inputState.toString()) {
        //     throw new Error('This input already exists: ' + rowId);
        // }

        // ==== Create an object and marshal to JSON ====
        let input = {};
        input.docType = 'inputeventmv';
        input.rowId = rowId;
        input.subjectId = subjectId;
        input.hadmId = hadmId;
        input.icustayId = icustayId;
        input.starttime = starttime;
        input.endtime = endtime;
        input.itemid = itemid;
        input.amount = amount;
        input.amountuom = amountuom;
        input.rate = rate;
        input.rateuom = rateuom;
        input.storetime = storetime;
        input.cgid = cgid;
        input.orderid = orderid;
        input.linkorderid = linkorderid;
        input.ordercategoryname = ordercategoryname;
        input.secondarycategoryname = secondarycategoryname;
        input.ordercomponenttypedescription = ordercomponenttypedescription;
        input.ordercategorydescription = ordercategorydescription;
        input.patientweight = patientweight;
        input.totalamount = totalamount;
        input.totalamountuom = totalamountuom;
        input.isopenbag = isopenbag;
        input.continueinnextdept = continueinnextdept;
        input.cancelreason = cancelreason;
        input.statusdescription = statusdescription;
        input.commentsEditedby = commentsEditedby;
        input.commentsCanceledby = commentsCanceledby;
        input.commentsDate = commentsDate;
        input.originalamount = originalamount;
        input.originalrate = originalrate; 

        // === Save an input to state ===
        await stub.putState(rowId, Buffer.from(JSON.stringify(input)));
        let indexName = 'rowId';
        let subjectNameIndexKey = await stub.createCompositeKey(indexName, [input.rowId]);
        console.info(subjectNameIndexKey);
        //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
        //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
        await stub.putState(subjectNameIndexKey, Buffer.from('\u0000'));
        // ==== Marble saved and indexed. Return success ====
        console.info('- end init input event mv');

        return Buffer.from(JSON.stringify(input));
    };

    [...]

    /**
     * Queries for patient based on a passed id.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub.
     * @param {String[]} args The arguments of the function. Index 0: patient id.
     * @param {Chaincode} thisObject The chaincode object context.
     * @return {Promise<Buffer>} The patient of the specified id.
     */
    async queryPatientById(stub, args, thisClass) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting patient id.');
        }

        let subjectId  = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'patients';
        queryString.selector.subjectId = subjectId;
        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, JSON.stringify(queryString), thisClass);

        return queryResults;
    }

    [...]
};

shim.start(new Chaincode());
