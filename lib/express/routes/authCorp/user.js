'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../../util');

let router = express.Router();
router.get('/:corpID/:suiteID/users', (req, res) => {
    let {corpID, suiteID} = req.params;
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    let authCorpContactsService = req.app.get('authCorpContactsService');
    authCorpContactsService.getUsers(corpID, suiteID, traceContext, (err, usersJSON) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (_.isNull(usersJSON)) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            logger.error("get auth corp users fail", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.users = usersJSON;
        res.send(resultJSON);
        logger.info("get auth corp users success", traceContext);
    });
});
router.get('/:corpID/:suiteID/users/:userID', (req, res) => {
    let {corpID, suiteID, userID} = req.params;
    let traceContext = traceContextFeach(req);
    let resultJSON = {};
    let authCorpContactsService = req.app.get('authCorpContactsService');
    authCorpContactsService.getUser(corpID, suiteID, userID, traceContext, (err, userJSON) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (_.isNull(userJSON)) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            logger.error("get auth corp user fail", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.user = userJSON;
        res.send(resultJSON);
        logger.info("get auth corp user success", traceContext);
    });
});

module.exports = router;