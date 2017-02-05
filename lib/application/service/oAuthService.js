'use strict';
var _ = require('underscore');
const co = require('co');
const {constant} = require('../util');
const {createWechatQYAPIOAuthServiceGateway} = require('../../infrastructure');
const AuthCorpService = require('./authCorpService');

class Service {
    constructor() {
        this._authCorpService = new AuthCorpService();
        this._wechatQYAPIOAuthServiceGateway = createWechatQYAPIOAuthServiceGateway();
    }

    auth(corpID, suiteID, code, traceContext, callback) {
        if (!corpID || !suiteID || !code) {
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

        function authUsersFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject) => {
                self._wechatQYAPIOAuthServiceGateway.getUserInfo(suiteAccessToken, code, traceContext, (err, resultJSON) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function* authUsers() {
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return null;
            }
            let resultJSON = yield authUsersFromWeChatServer(suiteAccessToken);
            if (!resultJSON.UserId && !resultJSON.OpenId) {
                return null;
            }
            let userJSON = {};
            if (resultJSON.UserId) {
                userJSON.userID = resultJSON.UserId;
            }
            if (resultJSON.OpenId) {
                userJSON.openID = resultJSON.OpenId;
            }
            return userJSON;
        };
        co(authUsers).then((userJSON) => {
            callback(null, userJSON);
        }).catch(err => {
            callback(err);
        });
    }
}

module.exports = Service;