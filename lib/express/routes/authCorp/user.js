'use strict';
var _ = require('underscore');
var async = require('async');
var express = require('express');
var router = express.Router();
var errCodeTable = require('../../util/errCode.js');

router.get('/:corpID/:suiteID/users', function (req, res) {
    var corpID = req.params.corpID;
    var suiteID = req.params.suiteID;
    var resultJSON = {};
    var authCorpContactsService = req.app.get('bearcat').getBean('authCorpContactsService');
    async.waterfall([function (cb) {
        authCorpContactsService.getUsers(corpID, suiteID, cb);
    }], function (err, usersData) {
        if (err || _.isNull(usersData)) {
            resultJSON.errcode = errCodeTable.FAIL.errCode;
            resultJSON.errmsg = errCodeTable.FAIL.errMsg;
            res.send(resultJSON);
            return;
        }
        resultJSON.errcode = errCodeTable.OK.errCode;
        resultJSON.errmsg = errCodeTable.OK.errMsg;
        resultJSON.users = usersData;
        res.send(resultJSON);
    });
});

module.exports = router;