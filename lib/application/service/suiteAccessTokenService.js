'use strict';
const _ = require('underscore');
const co = require('co');
const {SuiteTicket, SuiteAccessToken} = require('../../domain/');
const {createSuiteAccessTokenRepository, createSuiteTicketRepository, createWechatThirdAPIServiceGateway} = require('../../infrastructure');
const {constant} = require('../util');
const {logger} = require('../../util');

class Service {
    constructor() {
        this._suiteTicketRepository = createSuiteTicketRepository();
        this._suiteAccessTokenRepository = createSuiteAccessTokenRepository();
        this._wechatThirdAPIServiceGateway = createWechatThirdAPIServiceGateway();
    }

    updateSuiteTicket(suiteTicketData, traceContext, callback) {
        let {suiteID, ticket}= suiteTicketData;
        if (!suiteID || !ticket) {
            callback(null, false);
            return;
        }
        let suiteTicket = new SuiteTicket(suiteTicketData);
        this._suiteTicketRepository.save(suiteTicket, traceContext, (err, isSuccess)=> {
            if (err) {
                callback(err);
                return;
            }
            callback(null, isSuccess);
        });
    }

    getLatestSuiteAccessToken(suiteID, traceContext, callback) {
        if (!suiteID) {
            callback(null, null);
            return;
        }
        let suiteSecret = constant[suiteID].suiteSecret;
        let self = this;

        function getSuiteAccessTokenFromRepository() {
            return new Promise((resolve, reject)=> {
                self._suiteAccessTokenRepository.getSuiteAccessTokenBySuiteID(suiteID, traceContext, (err, suiteAccessToken)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getSuiteTicketFromRepository() {
            return new Promise((resolve, reject)=> {
                self._suiteTicketRepository.getSuiteTicketBySuiteID(suiteID, traceContext, (err, suiteTicket)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteTicket);
                });
            });
        }

        function getSuiteAccessTokenFromWeChatServer(suiteTicket) {
            return new Promise((resolve, reject)=> {
                self._wechatThirdAPIServiceGateway.getSuiteAccessToken(suiteID, suiteSecret, suiteTicket, traceContext, (err, resultJSON)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function saveSuiteAccessToken(suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._suiteAccessTokenRepository.save(suiteAccessToken, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* getSuiteAccessToken() {
            let suiteAccessToken = yield getSuiteAccessTokenFromRepository();
            if (suiteAccessToken && (new Date()).getTime() < suiteAccessToken.expire) {
                return suiteAccessToken.accessToken;
            }
            let suiteTicket = yield getSuiteTicketFromRepository();
            if (!suiteTicket) {
                return null;
            }
            let resultJSON = yield getSuiteAccessTokenFromWeChatServer(suiteTicket.ticket);
            if (!resultJSON || !resultJSON.suite_access_token) {
                return null;
            }
            let accessToken = resultJSON.suite_access_token;
            let expire = (new Date()).getTime() + 7190000;
            suiteAccessToken = new SuiteAccessToken({suiteID, accessToken, expire});
            let isSuccess = yield saveSuiteAccessToken(suiteAccessToken);
            if (isSuccess) {
                return accessToken;
            }
            else {
                return null;
            }
        };
        co(getSuiteAccessToken).then((suiteAccessToken)=> {
            callback(null, suiteAccessToken);
        }).catch(err=> {
            callback(err);
        });
    }
}
module.exports = Service;