'use strict';
var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var EventEmitter = require('events');
var AuthCorpSuiteInfo = require('../../domain/authCorpSuiteInfo');
var constant = require('../util/constant');

function Service() {
    EventEmitter.call(this);
    this.__SuiteAccessTokenService__ = null;
    this.__AuthCorpSuiteInfoRepository__ = null;
    this.__httpRequest__ = request;
};

util.inherits(Service, EventEmitter);

Service.prototype.updateAuthCorpSuiteInfo = function (corpID, suiteID, callback) {
    if (!corpID || !suiteID) {
        console.log(`${new Date()} update auth corp suite info fail`);
        callback(null, false);
        return;
    }
    var self = this;
    var _AuthCorpSuiteInfo;
    async.waterfall([function (cb) {
        self.__AuthCorpSuiteInfoRepository__.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, cb);
    }, function (authCorpSuiteInfo, cb) {
        if (!authCorpSuiteInfo || !authCorpSuiteInfo.permanentCode) {
            console.log(`${new Date()} no auth corp suite info`);
            callback(null, false);
            return;
        }
        _AuthCorpSuiteInfo = authCorpSuiteInfo;
        self.__getAuthCorpSuiteAuthInfoFromWeChatServer__(corpID, suiteID, authCorpSuiteInfo.permanentCode, cb);
    }, function (suiteAuthInfo, cb) {
        if (!suiteAuthInfo) {
            console.log(`${new Date()} update auth corp suite info fail`);
            callback(null, false);
            return;
        }
        _AuthCorpSuiteInfo.agents = suiteAuthInfo;
        self.__AuthCorpSuiteInfoRepository__.save(_AuthCorpSuiteInfo, cb);
    }], function (err, isSuccess) {
        if (err) {
            console.log(err);
            callback(err, false);
            return;
        }
        if (!isSuccess) {
            console.log(`${new Date()} corp:${corpID} update auth suite:${suiteID} info fail`);
        }
        callback(null, isSuccess);
    });
};

Service.prototype.getAuthCorpLatesSuiteAccessToken = function (corpID, suiteID, callback) {
    if (!corpID || !suiteID) {
        console.log(`${new Date()} get auth corp lates suite access fail`);
        callback(null, null);
        return;
    }
    var self = this;
    var _authCorpSuiteInfo;
    async.waterfall([function (cb) {
        self.__AuthCorpSuiteInfoRepository__.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, cb);
    }, function (authCorpSuiteInfo, cb) {
        if (!authCorpSuiteInfo || !authCorpSuiteInfo.accessToken || !authCorpSuiteInfo.accessTokenExpires || !authCorpSuiteInfo.permanentCode) {
            console.log(`${new Date()} no auth corp suite info`);
            callback(null, null);
            return;
        }
        if (authCorpSuiteInfo.accessToken && (new Date()).getTime() < (new Date(authCorpSuiteInfo.accessTokenExpires)).getTime()) {
            callback(null, authCorpSuiteInfo.accessToken);
            return;
        }
        _authCorpSuiteInfo = authCorpSuiteInfo;
        self.__getAuthCorpSuiteAccessTokenFromWeChatServer__(corpID, suiteID, authCorpSuiteInfo.permanentCode, cb);
    }], function (err, accessToken) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        callback(null, accessToken);
        _authCorpSuiteInfo.accessToken = accessToken;
        _authCorpSuiteInfo.accessTokenExpires = new Date((new Date()).getTime() + 7190000);
        self.__AuthCorpSuiteInfoRepository__.save(_authCorpSuiteInfo, (err, isSuccess)=> {
            if (err || !isSuccess) {
                console.log("updat auth corp suite accessToken fail");
            }
            else {
                console.log("updat auth corp suite accessToken success");
            }
        });
    });
};

Service.prototype.getAuthCorpSuiteAgentInfo = function (corpID, suiteID, appID, callback) {
    if (!authCorpID || !suiteID || !appID) {
        callback(null, null);
        return;
    }
    var self = this;
    async.waterfall([function (cb) {
        self.__authCorpSuiteInfoRepository__.getAuthCorpSuiteInfo(authCorpID, suiteID, cb);
    },], function (err, authCorpSuiteInfo) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!authCorpSuiteInfo || !authCorpSuiteInfo.agents) {
            callback(null, null);
            return;
        }
        if (_.isUndefined(authCorpSuiteInfo.agents[appID])) {
            callback(null, null);
            return;
        }
        callback(null, authCorpSuiteInfo.agents[appID]);
    });
};
Service.prototype.__getAuthCorpSuiteAuthInfoFromWeChatServer__ = function (corpID, suiteID, permanentCode, callback) {
    var self = this;
    async.waterfall([function (cb) {
        self.__SuiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (!suiteAccessToken) {
            callback(null, null);
            return;
        }
        var url = `${constant.qyapiPrefix}service/get_auth_info?suite_access_token=${suiteAccessToken}`;
        var data = {
            suite_id: suiteID,
            auth_corpid: corpID,
            permanent_code: permanentCode
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
        var agents = {};
        for (let agentInfo of body.auth_info.agent) {
            var agent = {};
            agent.agentid = agentInfo.agentid;
            agents[agentInfo.appid.toString()] = agent;
        }
        callback(null, agents);
    });
};

Service.prototype.__getAuthCorpSuiteAccessTokenFromWeChatServer__ = function (corpID, suiteID, permanentCode, callback) {
    var self = this;
    async.waterfall([function (cb) {
        self.__SuiteAccessTokenService__.getLatestSuiteAccessToken(suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (!suiteAccessToken) {
            callback(null, null);
            return;
        }
        var url = `${constant.qyapiPrefix}service/get_corp_token?suite_access_token=${suiteAccessToken}`;
        var data = {
            suite_id: suiteID,
            auth_corpid: corpID,
            permanent_code: permanentCode
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
        callback(null, body.access_token);
    });
};

module.exports = Service;