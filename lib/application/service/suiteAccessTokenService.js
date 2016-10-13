'use strict';
var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var EventEmitter = require('events');
var SuiteTicket = require('../../domain/suiteTicket');
var SuiteAccessToken = require('../../domain/suiteAccessToken');
var constant = require('../util/constant');

function Service() {
    EventEmitter.call(this);
    this.__httpRequest__ = request;
    this.__suiteTicketRepository__ = null;
    this.__suiteAccessTokenRepository__ = null;
};

util.inherits(Service, EventEmitter);

Service.prototype.updateSuiteTicket = function (suiteTicketData, callback) {
    if (!suiteTicketData.suiteID || !suiteTicketData.ticket) {
        callback(null, false);
        return;
    }
    var suiteTicket = new SuiteTicket(suiteTicketData);
    this.__suiteTicketRepository__.saveSuiteTicket(suiteTicket, function (err, isSuccess) {
        if (err) {
            callback(err, false);
            return;
        }
        callback(null, isSuccess);
    });
};

Service.prototype.getLatestSuiteAccessToken = function (suiteID, callback) {
    if (!suiteID) {
        callback(null, null);
        return;
    }
    var self = this;
    var suiteSecret = constant[suiteID].suiteSecret;
    async.waterfall([function (cb) {
        self.__suiteAccessTokenRepository__.getSuiteAccessTokenBySuiteID(suiteID, cb);
    }, function (suiteAccessToken, cb) {
        if (suiteAccessToken && (new Date()).getTime() < (new Date(suiteAccessToken.expire)).getTime()) {
            callback(null, suiteAccessToken.accessToken);
            return;
        }
        self.__suiteTicketRepository__.getSuiteTicketBySuiteID(suiteID, cb);
    }, function (suiteTicket, cb) {
        if (!suiteTicket) {
            console.log(`${new Date()} suite:${suiteID}get suite ticket fail`);
            callback(null, null);
            return;
        }
        self.__getSuiteAccessTokenFromWeChatServer__(suiteID, suiteSecret, suiteTicket.ticket, cb);
    }], function (err, suiteAccessToken) {
        if (err) {
            console.log(`${new Date()} suite:${suiteID} ${err.toString()}`);
            callback(err, null);
            return;
        }
        callback(null, suiteAccessToken);
    });
};

Service.prototype.__getSuiteAccessTokenFromWeChatServer__ = function (suiteID, suiteSecret, suiteTicket, callback) {
    var self = this;
    async.waterfall([function (cb) {
        var url = `${constant.qyapiPrefix}service/get_suite_token`;
        var data = {
            suite_id: suiteID,
            suite_secret: suiteSecret,
            suite_ticket: suiteTicket
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
            console.log(`${new Date()} suite:${suiteID} ${err}`);
            callback(err, null);
            return;
        }
        callback(null, body.suite_access_token);
        var suiteAccessTokenData = {};
        suiteAccessTokenData.suiteID = suiteID;
        suiteAccessTokenData.accessToken = body.suite_access_token;
        suiteAccessTokenData.expire = new Date((new Date()).getTime() + 7190000);
        var suiteAccessToken = new SuiteAccessToken(suiteAccessTokenData);
        self.__suiteAccessTokenRepository__.saveSuiteAccessToken(suiteAccessToken, (err, isSuccess)=> {
            if (err || !isSuccess) {
                console.log(`${new Date()} suite:${suiteID} save suite accessToken fail`);
            }
            else {
                console.log(`${new Date()} suite:${suiteID} save suite accessToken success`);
            }
        });
    });
};

module.exports = Service;