'use strict';
var _ = require('underscore');
var async = require('async');
var express = require('express');
var router = express.Router();
var errCodeTable = require('../../util/errCode.js');

router.get('/:suiteID/suite-auth-url', function (req, res) {
    var suiteID = req.params.suiteID;
    var resultJSON = {};
    var corpAuthSuiteService = req.app.get('bearcat').getBean('corpAuthSuiteService');
    async.waterfall([function (cb) {
        corpAuthSuiteService.getSuitePreAuthCode(suiteID, cb);
    }, function (preAuthCode, cb) {
        if (!preAuthCode) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            return;
        }
        var WECHATSERVERINTERACTION_SERVICE_HOST = process.env.WECHATSERVERINTERACTION_SERVICE_HOST ? process.env.WECHATSERVERINTERACTION_SERVICE_HOST : "pascal.gridvo.com";
        var redirectURI = `http://${WECHATSERVERINTERACTION_SERVICE_HOST}/suites/smart-station-suite/complete-auth`;
        var state = "ok";
        corpAuthSuiteService.generateSuiteAuthURL(suiteID, preAuthCode, redirectURI, state, cb);
    }], function (err, suiteAuthURL) {
        if (err || !suiteAuthURL) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.suiteAuthUrl = suiteAuthURL;
        res.send(resultJSON);
    });
});

module.exports = router;