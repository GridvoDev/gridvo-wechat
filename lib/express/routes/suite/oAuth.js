'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../../util');

let router = express.Router();
router.get('/:suiteID/:corpID/corp-users', (req, res) => {
    let {suiteID, corpID} = req.params;
    let code = req.query.code;
    let resultJSON = {};
    let traceContext = traceContextFeach(req);
    let oAuthService = req.app.get('oAuthService');
    oAuthService.auth(corpID, suiteID, code, traceContext, (err, userJSON) => {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!userJSON || !userJSON.userID) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            logger.error("wechat oauth corp user fail", traceContext);
            res.send(resultJSON);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.corpUser = userJSON;
        logger.info("wechat oauth corp user success", traceContext);
        res.send(resultJSON);
    });
});

module.exports = router;