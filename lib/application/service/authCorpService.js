'use strict';
let _ = require('underscore');
const co = require('co');
const {createAuthCorpSuiteInfoRepository, createWechatThirdAPIServiceGateway} = require('../../infrastructure');
const {constant} = require('../util');
const SuiteAccessTokenService = require('./suiteAccessTokenService');

class Service {
    constructor() {
        this._suiteAccessTokenService = new SuiteAccessTokenService();
        this._authCorpSuiteInfoRepository = createAuthCorpSuiteInfoRepository();
        this._wechatThirdAPIServiceGateway = createWechatThirdAPIServiceGateway();
    }

    updateAuthCorpSuiteInfo(corpID, suiteID, traceContext, callback) {
        if (!corpID || !suiteID) {
            callback(null, false);
            return;
        }
        let self = this;

        function getAuthCorpSuiteInfoFromRepository() {
            return new Promise((resolve, reject)=> {
                self._authCorpSuiteInfoRepository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, (err, authCorpSuiteInfo)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(authCorpSuiteInfo);
                });
            });
        }

        function getSuiteAccessToken() {
            return new Promise((resolve, reject)=> {
                self._suiteAccessTokenService.getLatestSuiteAccessToken(suiteID, traceContext, (err, suiteAccessToken)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getAuthCorpSuiteInfoFromWeChatServer(permanentCode, suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._wechatThirdAPIServiceGateway.getAuthInfo(corpID, suiteID, permanentCode, suiteAccessToken, traceContext, (err, resultJSON)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function saveAuthCorpSuiteInfo(authCorpSuiteInfo) {
            return new Promise((resolve, reject)=> {
                self._authCorpSuiteInfoRepository.save(authCorpSuiteInfo, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* updateAuthCorpSuiteInfo() {
            let authCorpSuiteInfo = yield getAuthCorpSuiteInfoFromRepository();
            if (!authCorpSuiteInfo || !authCorpSuiteInfo.permanentCode) {
                return false;
            }
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return false;
            }
            let permanentCode = authCorpSuiteInfo.permanentCode;
            let resultJSON = yield getAuthCorpSuiteInfoFromWeChatServer(permanentCode, suiteAccessToken);
            if (!resultJSON && !resultJSON.auth_info) {
                return null;
            }
            let agents = {};
            for (let agentInfo of resultJSON.auth_info.agent) {
                let agent = {};
                agent.agentid = agentInfo.agentid;
                agents[agentInfo.appid.toString()] = agent;
            }
            authCorpSuiteInfo.agents = agents;
            let isSuccess = yield saveAuthCorpSuiteInfo(authCorpSuiteInfo);
            return isSuccess
        };
        co(updateAuthCorpSuiteInfo).then((isSuccess)=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }

    getAuthCorpLatesSuiteAccessToken(corpID, suiteID, traceContext, callback) {
        if (!corpID || !suiteID) {
            callback(null, null);
            return;
        }
        let self = this;

        function getAuthCorpSuiteInfoFromRepository() {
            return new Promise((resolve, reject)=> {
                self._authCorpSuiteInfoRepository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, (err, authCorpSuiteInfo)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(authCorpSuiteInfo);
                });
            });
        }

        function getSuiteAccessToken() {
            return new Promise((resolve, reject)=> {
                self._suiteAccessTokenService.getLatestSuiteAccessToken(suiteID, traceContext, (err, suiteAccessToken)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(suiteAccessToken);
                });
            });
        }

        function getAuthCorpSuiteAccessTokenFromWeChatServer(permanentCode, suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._wechatThirdAPIServiceGateway.getCorpToken(corpID, suiteID, permanentCode, suiteAccessToken, traceContext, (err, resultJSON)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function saveAuthCorpSuiteInfo(authCorpSuiteInfo) {
            return new Promise((resolve, reject)=> {
                self._authCorpSuiteInfoRepository.save(authCorpSuiteInfo, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* getAuthCorpSuiteAccessToken() {
            let authCorpSuiteInfo = yield getAuthCorpSuiteInfoFromRepository();
            if (!authCorpSuiteInfo || !authCorpSuiteInfo.accessToken || !authCorpSuiteInfo.accessTokenExpires || !authCorpSuiteInfo.permanentCode) {
                return null;
            }
            if (authCorpSuiteInfo.accessToken && (new Date()).getTime() < authCorpSuiteInfo.accessTokenExpires) {
                return authCorpSuiteInfo.accessToken;
            }
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return null;
            }
            let permanentCode = authCorpSuiteInfo.permanentCode;
            let resultJSON = yield getAuthCorpSuiteAccessTokenFromWeChatServer(permanentCode, suiteAccessToken);
            if (!resultJSON || !resultJSON.access_token) {
                return null;
            }
            authCorpSuiteInfo.accessToken = resultJSON.access_token;
            authCorpSuiteInfo.accessTokenExpires = (new Date()).getTime() + 7190000;
            let isSuccess = yield saveAuthCorpSuiteInfo(authCorpSuiteInfo);
            if (isSuccess) {
                return authCorpSuiteInfo.accessToken
            }
            else {
                return null;
            }
        };
        co(getAuthCorpSuiteAccessToken).then((suiteAccessToken)=> {
            callback(null, suiteAccessToken);
        }).catch(err=> {
            callback(err);
        });

    }
}

module.exports = Service;