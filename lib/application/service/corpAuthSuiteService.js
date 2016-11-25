'use strict';
var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var EventEmitter = require('events');
var AuthCorpSuiteInfo = require('../../domain/authCorpSuiteInfo.js');
var constant = require('../util/constant');

function Service() {
    EventEmitter.call(this);
    this.__httpRequest__ = request;
    this.__SuiteAccessTokenService__ = null;
    this.__AuthCorpSuiteInfoRepository__ = null;
    this.__CorpAuthSmartgridSuiteTopicProducer__ = null;
    this.__CorpCancelAuthSmartgridSuiteTopicProducer__ = null;
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
    var corpID;
    var authCorpSuiteAccessToken;
    var agents;
    async.waterfall([function (cb) {
        self.__SuiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
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
    }, function (response, body, cb) {
        if (!body) {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} request wechat server fail`);
            callback(null, false);
            return;
        }
        corpID = body.auth_corp_info.corpid;
        authCorpSuiteAccessToken = body.access_token;
        var authCorpSuiteInfoData = {};
        authCorpSuiteInfoData.suiteID = suiteID;
        authCorpSuiteInfoData.corpID = corpID;
        authCorpSuiteInfoData.permanentCode = body.permanent_code;
        authCorpSuiteInfoData.accessToken = authCorpSuiteAccessToken;
        authCorpSuiteInfoData.accessTokenExpires = new Date((new Date()).getTime() + 7190000);
        authCorpSuiteInfoData.agents = {};
        for (let agentInfo of body.auth_info.agent) {
            var agent = {};
            agent.agentid = agentInfo.agentid;
            authCorpSuiteInfoData.agents[agentInfo.appid.toString()] = agent;
        }
        agents = authCorpSuiteInfoData.agents;
        var authCorpSuiteInfo = new AuthCorpSuiteInfo(authCorpSuiteInfoData);
        self.__AuthCorpSuiteInfoRepository__.save(authCorpSuiteInfo, cb);
    }, function (isSuccess, cb) {
        if (!isSuccess) {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} save AuthCorpSuiteInfo fail`);
            callback(null, false);
            return;
        }
        if (constant[suiteID]) {
            var appID = constant[suiteID].waterStationApp;
            var url = `${constant.qyapiPrefix}menu/create?access_token=${authCorpSuiteAccessToken}&agentid=${agents[appID].agentid}`;
            var appContent = constant[suiteID][appID].appContent;
            var data;
            if (appContent.menu) {
                appContent.menu.button[0].url = `${appContent.menu.button[0].url}?corpid=${corpID}`;
                data = appContent.menu;
            }
            else {
                data = {};
            }
            var options = {
                method: "POST",
                url: url,
                body: data,
                json: true
            };
            self.__httpRequest__(options, cb);
        }
        else {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} no this suite`);
            callback(null, false);
            return;
        }
    }, function (response, body, cb) {
        if (!body || body.errcode != 0 || body.errmsg != "ok") {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} create suite app fail`);
            callback(null, false);
            return;
        }
        var message = {
            corpID: corpID,
            timestamp: new Date().getTime()
        };
        if (suiteID == constant.smartgridSuite) {
            self.__CorpAuthSmartgridSuiteTopicProducer__.produceMessage(message, cb);
        }
        else {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} no this suite`);
            callback(null, false);
            return;
        }
    }], function (err, isSuccess) {
        if (err) {
            console.log(err);
            callback(err, false);
            return;
        }
        if (!isSuccess) {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} produce topic fail`);
        }
        callback(null, isSuccess);
    });
};

Service.prototype.cancelAuthSuite = function (corpID, suiteID, callback) {
    if (!corpID || !suiteID) {
        callback(null, false);
        return;
    }
    var self = this;
    async.waterfall([function (cb) {
        self.__AuthCorpSuiteInfoRepository__.removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, cb);
    }, function (isSuccess, cb) {
        if (!isSuccess) {
            console.log(`${new Date()} corp:${corpID} auth suite:${suiteID} remove AuthCorpSuiteInfo fail`);
            callback(null, false);
            return;
        }
        var message = {
            corpID: corpID,
            timestamp: new Date().getTime()
        };
        if (suiteID == constant.smartgridSuite) {
            self.__CorpCancelAuthSmartgridSuiteTopicProducer__.produceMessage(message, cb);
        }
        else {
            console.log(`${new Date()} corp:${corpID} cancel auth suite:${suiteID} no this suite`);
            callback(null, false);
            return;
        }
    }], function (err, isSuccess) {
        if (err) {
            console.log(err);
            callback(err, false);
            return;
        }
        if (!isSuccess) {
            console.log(`${new Date()} corp:${corpID} cancel auth suite:${suiteID} fail`);
        }
        callback(null, isSuccess);
    });
};

Service.prototype.__getPreAuthCodeFromWeChatServer__ = function (suiteID, callback) {
    var self = this;
    async.waterfall([function (cb) {
        self.__SuiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
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