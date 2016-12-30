'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../../util');

let router = express.Router();
router.get('/:corpID/:suiteID/users', (req, res)=> {
    let corpID = req.params.corpID;
    let suiteID = req.params.suiteID;
    let resultJSON = {};
    let authCorpContactsService = req.app.get('authCorpContactsService');
    let traceContext = traceContextFeach(req);
    authCorpContactsService.getUsers(corpID, suiteID, traceContext, (err, usersData)=> {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (_.isNull(usersData)) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            logger.error("get auth corp users fail", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.users = usersData;
        res.send(resultJSON);
        logger.info("get auth corp users success", traceContext);
    });
});

module.exports = router;