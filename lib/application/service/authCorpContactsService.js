'use strict';
var _ = require('underscore');
const co = require('co');
const {constant} = require('../util');
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
            return new Promise((resolve, reject)=> {
                self._authCorpService.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, traceContext, (err, suiteAccessToken)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getUsersFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._wechatQYAPIContactsServiceGateway.listUsers(suiteAccessToken, 1, 1, 1, traceContext, (err, resultJSON)=> {
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
            let userDatas = [];
            for (let user of resultJSON.userlist) {
                var userData = {};
                userData.corpID = corpID;
                userData.userID = user.userid;
                userData.userName = user.name;
                userDatas.push(userData);
            }
            return userDatas;
        };
        co(getUsers).then((userDatas)=> {
            callback(null, userDatas);
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Service;