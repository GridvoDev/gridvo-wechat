'use strict';
var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var EventEmitter = require('events');
var constant = require('../util/constant');

function Service() {
    EventEmitter.call(this);
    this.__httpRequest__ = request;
    this.__suiteAccessTokenService__ = null;
};

util.inherits(Service, EventEmitter);

Service.prototype.getSuitePreAuthCode = function (suiteID, callback) {
    if (!suiteID) {
        callback(null, null);
        return;
    }
    var self = this;
    async.waterfall([function (cb) {
        self.__getPreAuthCodeFromWeChatServer__(suiteID, cb);
    }], function (err, preAuthCode) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, preAuthCode);
    });
};

Service.prototype.generateSuiteAuthURL = function (suiteID, preAuthCode, redirectURI, state, callback) {
    if (!suiteID || !preAuthCode || !redirectURI || !state) {
        callback(null, null);
        return;
    }
    var suiteAuthURL = `https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id=${suiteID}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectURI}&state=${state}`;
    callback(null, suiteAuthURL);
};

Service.prototype.authSuite = function (suiteID, authCode, callback) {
    if (!suiteID || !authCode) {
        callback(null, null);
        return;
    }
    var self = this;
    async.waterfall([function (cb) {
        self.__suiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (!suiteAccessToken) {
            callback(null, null);
            return;
        }
        var url = `${constant.qyapiPrefix}service/get_permanent_code?suite_access_token=${suiteAccessToken}`;
        var data = {
            suite_id: suiteID,
            auth_code: authCode
        };
        var options = {
            method: "POST",
            url: url,
            body: data,
            json: true
        };
        self.__httpRequest__(options, cb);
    }], function (err, response, body) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!body) {
            callback(err, null);
            return;
        }
        var authCorpSuiteInfoData = {};
        authCorpSuiteInfoData.suiteID = suiteID;
        authCorpSuiteInfoData.corpID = body.auth_corp_info.corpid;
        authCorpSuiteInfoData.permanentCode = body.permanent_code;
        authCorpSuiteInfoData.accessToken = body.access_token;
        authCorpSuiteInfoData.agents = {};
        for (let agentInfo of body.auth_info.agent) {
            var agent = {};
            agent.agentid = agentInfo.agentid;
            authCorpSuiteInfoData.agents[agentInfo.appid.toString()] = agent;
        }
        callback(null, authCorpSuiteInfoData);
    });
};

Service.prototype.__getPreAuthCodeFromWeChatServer__ = function (suiteID, callback) {
    var self = this;
    async.waterfall([function (cb) {
        self.__suiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (!suiteAccessToken) {
            callback(null, null);
            return;
        }
        var url = `${constant.qyapiPrefix}service/get_pre_auth_code?suite_access_token=${suiteAccessToken}`;
        var data = {
            suite_id: suiteID
        };
        var options = {
            method: "POST",
            url: url,
            body: data,
            json: true
        };
        self.__httpRequest__(options, cb);
    }], function (err, response, body) {
        if (err) {
            callback(err, null);
            return;
        }
        if (body.pre_auth_code && body.errcode == "0" && body.errmsg == "ok") {
            callback(null, body.pre_auth_code);
        }
        else {
            callback(null, null);
        }
    });
};

module.exports = Service;