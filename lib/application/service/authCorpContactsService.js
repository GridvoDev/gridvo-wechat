'use strict';
var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var EventEmitter = require('events');
var constant = require('../util/constant');

function Service() {
    EventEmitter.call(this);
    this.__AuthCorpService__ = null;
    this.__httpRequest__ = request;
};

util.inherits(Service, EventEmitter);

Service.prototype.getUsers = function (corpID, suiteID, callback) {
    if (!corpID || !suiteID) {
        console.log(`${new Date()} get auth corp suite users fail`);
        callback(null, null);
        return;
    }
    var self = this;
    async.waterfall([function (cb) {
        self.__AuthCorpService__.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (!suiteAccessToken) {
            callback(null, null);
            return;
        }
        var url = `${constant.qyapiPrefix}user/list?access_token=${suiteAccessToken}&department_id=1&fetch_child=1&status=1 `;
        var options = {
            method: "GET",
            url: url,
            json: true
        };
        self.__httpRequest__(options, cb);
    }], function (err, response, body) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        if (body.errcode != 0 || body.errmsg != "ok") {
            console.log(`${new Date()} get auth corp suite users from wechat server fail`);
            callback(null, null);
            return;
        }
        var userDatas = [];
        for (let user of body.userlist) {
            var userData = {};
            userData.corpID = corpID;
            userData.userID = user.userid;
            userData.userName = user.name;
            userDatas.push(userData);
        }
        callback(null, userDatas);
    });
};

module.exports = Service;