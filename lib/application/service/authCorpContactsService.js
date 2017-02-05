'use strict';
var _ = require('underscore');
const co = require('co');
const {createWechatQYAPIContactsServiceGateway} = require('../../infrastructure');
const AuthCorpService = require('./authCorpService');

class Service {
    constructor() {
        this._authCorpService = new AuthCorpService();
        this._wechatQYAPIContactsServiceGateway = createWechatQYAPIContactsServiceGateway();
    }

    getUsers(corpID, suiteID, traceContext, callback) {
        if (!corpID || !suiteID) {
            callback(null, null);
            return;
        }
        var self = this;

        function getSuiteAccessToken() {
            return new Promise((resolve, reject) => {
                self._authCorpService.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, traceContext, (err, suiteAccessToken) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getUsersFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject) => {
                self._wechatQYAPIContactsServiceGateway.listUsers(suiteAccessToken, 1, 1, 1, traceContext, (err, resultJSON) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function* getUsers() {
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return null;
            }
            let resultJSON = yield getUsersFromWeChatServer(suiteAccessToken);
            if (resultJSON.errcode != 0 || resultJSON.errmsg != "ok") {
                return null;
            }
            let usersJSON = [];
            for (let user of resultJSON.userlist) {
                var userJSON = {};
                userJSON.corpID = corpID;
                userJSON.userID = user.userid;
                userJSON.userName = user.name;
                userJSON.status = user.status;
                usersJSON.push(userJSON);
            }
            return usersJSON;
        };
        co(getUsers).then((usersJSON) => {
            callback(null, usersJSON);
        }).catch(err => {
            callback(err);
        });
    }

    getUser(corpID, suiteID, userID, traceContext, callback) {
        if (!corpID || !suiteID || !userID) {
            callback(null, null);
            return;
        }
        var self = this;

        function getSuiteAccessToken() {
            return new Promise((resolve, reject) => {
                self._authCorpService.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, traceContext, (err, suiteAccessToken) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getUserFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject) => {
                self._wechatQYAPIContactsServiceGateway.getUser(suiteAccessToken, userID, traceContext, (err, resultJSON) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function* getUser() {
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return null;
            }
            let resultJSON = yield getUserFromWeChatServer(suiteAccessToken);
            if (resultJSON.errcode != 0 || resultJSON.errmsg != "ok") {
                return null;
            }
            let userJSON = {};
            userJSON.corpID = corpID;
            userJSON.userID = resultJSON.userid;
            userJSON.userName = resultJSON.name;
            userJSON.status = resultJSON.status;
            return userJSON;
        };
        co(getUser).then((userJSON) => {
            callback(null, userJSON);
        }).catch(err => {
            callback(err);
        });
    }
}

module.exports = Service;