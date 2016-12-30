'use strict';
const _ = require('underscore');
const express = require('express');
const {errCodeTable} = require('../../util');
const {expressWithZipkinTraceContextFeach:traceContextFeach} = require("gridvo-common-js");
const {logger} = require('../../../util');

let router = express.Router();
router.get('/:suiteID/suite-auth-url', (req, res)=> {
    let suiteID = req.params.suiteID;
    let resultJSON = {};
    let corpAuthSuiteService = req.app.get('corpAuthSuiteService');
    let traceContext = traceContextFeach(req);
    corpAuthSuiteService.getSuitePreAuthCode(suiteID, traceContext, (err, preAuthCode)=> {
        if (err) {
            logger.error(err.message, traceContext);
            return;
        }
        if (!preAuthCode) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            logger.error("get suite pre auth code fail", traceContext);
            return;
        }
        let WECHATSERVERINTERACTION_SERVICE_HOST = process.env.WECHATSERVERINTERACTION_SERVICE_HOST ? process.env.WECHATSERVERINTERACTION_SERVICE_HOST : "wechat.gridvo.com";
        let redirectURI = `http://${WECHATSERVERINTERACTION_SERVICE_HOST}/suites/smart-station-suite/complete-auth`;
        let state = "ok";
        let suiteAuthURL = corpAuthSuiteService.generateSuiteAuthURLSync(suiteID, preAuthCode, redirectURI, state);
        if (!suiteAuthURL) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            logger.error("generate suite auth url fail", traceContext);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.suiteAuthUrl = suiteAuthURL;
        res.send(resultJSON);
        logger.info("generate suite auth url success", traceContext);
    });
});

module.exports = router;