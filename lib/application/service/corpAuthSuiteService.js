'use strict';
const _ = require('underscore');
const co = require('co');
const {AuthCorpSuiteInfo} = require('../../domain');
const {constant} = require('../util');
const {createAuthCorpSuiteInfoRepository, createWechatThirdAPIServiceGateway, createWechatQYAPIMenuServiceGateway, createMessageProducer} = require('../../infrastructure');
const SuiteAccessTokenService = require('./suiteAccessTokenService');

class Service {
    constructor() {
        this._suiteAccessTokenService = new SuiteAccessTokenService();
        this._authCorpSuiteInfoRepository = createAuthCorpSuiteInfoRepository();
        this._wechatThirdAPIServiceGateway = createWechatThirdAPIServiceGateway();
        this._wechatQYAPIMenuServiceGateway = createWechatQYAPIMenuServiceGateway();
        this._messageProducer = createMessageProducer();
    }

    getSuitePreAuthCode(suiteID, traceContext, callback) {
        if (!suiteID) {
            return null;
        }
        let self = this;

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

        function getPreAuthCodeFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._wechatThirdAPIServiceGateway.getPreAuthCode(suiteID, suiteAccessToken, traceContext, (err, resultJSON)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function* getPreAuthCode() {
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return null;
            }
            let resultJSON = yield getPreAuthCodeFromWeChatServer(suiteAccessToken);
            if (!resultJSON || !resultJSON.pre_auth_code) {
                return null;
            }
            else {
                return resultJSON.pre_auth_code;
            }
        };
        co(getPreAuthCode).then((authCode)=> {
            callback(null, authCode);
        }).catch(err=> {
            callback(err);
        });
    }

    generateSuiteAuthURLSync(suiteID, preAuthCode, redirectURI, state) {
        if (!suiteID || !preAuthCode || !redirectURI || !state) {
            return null;
        }
        let suiteAuthURL = `https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id=${suiteID}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectURI}&state=${state}`;
        return suiteAuthURL;
    }

    authSuite(suiteID, authCode, traceContext, callback) {
        if (!suiteID || !authCode) {
            callback(null, false);
            return;
        }
        let self = this;

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

        function getAuthCorpSuiteInfoFromWeChatServer(suiteAccessToken) {
            return new Promise((resolve, reject)=> {
                self._wechatThirdAPIServiceGateway.getPermanentCode(suiteID, authCode, suiteAccessToken, traceContext, (err, resultJSON)=> {
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

        function createAppMenuFromWeChatServer(authCorpSuiteAccessToken, agentID, menuData) {
            return new Promise((resolve, reject)=> {
                self._wechatQYAPIMenuServiceGateway.createMenu(authCorpSuiteAccessToken, agentID, menuData, traceContext, (err, resultJSON)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(resultJSON);
                });
            });
        }

        function produceCorpAuthSmartgridSuiteMessage(message) {
            return new Promise((resolve, reject)=> {
                self._messageProducer.produceCorpAuthSmartgridSuiteMessage(message, traceContext, (err, data)=> {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        }

        function* authSuite() {
            let suiteAccessToken = yield getSuiteAccessToken();
            if (!suiteAccessToken) {
                return false;
            }
            let resultJSON = yield getAuthCorpSuiteInfoFromWeChatServer(suiteAccessToken);
            if (!resultJSON) {
                return false;
            }
            let corpID = resultJSON.auth_corp_info.corpid;
            let authCorpSuiteAccessToken = resultJSON.access_token;
            let authCorpSuiteInfoData = {};
            authCorpSuiteInfoData.suiteID = suiteID;
            authCorpSuiteInfoData.corpID = corpID;
            authCorpSuiteInfoData.permanentCode = resultJSON.permanent_code;
            authCorpSuiteInfoData.accessToken = authCorpSuiteAccessToken;
            authCorpSuiteInfoData.accessTokenExpires = (new Date()).getTime() + 7190000;
            authCorpSuiteInfoData.agents = {};
            for (let agentInfo of resultJSON.auth_info.agent) {
                let agent = {};
                agent.agentid = agentInfo.agentid;
                authCorpSuiteInfoData.agents[agentInfo.appid.toString()] = agent;
            }
            let agents = authCorpSuiteInfoData.agents;
            let authCorpSuiteInfo = new AuthCorpSuiteInfo(authCorpSuiteInfoData);
            let isSuccess = yield saveAuthCorpSuiteInfo(authCorpSuiteInfo);
            if (!isSuccess) {
                return false;
            }
            let menuData;
            let appID;
            if (constant[suiteID]) {
                appID = constant[suiteID].waterStationApp;
                let appContent = constant[suiteID][appID].appContent;
                if (appContent.menu) {
                    appContent.menu.button[0].url = `${appContent.menu.button[0].url}?corpid=${corpID}`;
                    menuData = appContent.menu;
                }
                else {
                    menuData = {};
                }
            }
            else {
                return false;
            }
            let agentID = agents[appID].agentid;
            resultJSON = yield createAppMenuFromWeChatServer(authCorpSuiteAccessToken, agentID, menuData);
            if (!resultJSON || resultJSON.errcode != 0 || resultJSON.errmsg != "ok") {
                return false;
            }
            let message = {
                corpID: corpID,
                timestamp: new Date().getTime()
            };
            switch (suiteID) {
                case constant.smartgridSuite:
                    let isSuccess = yield produceCorpAuthSmartgridSuiteMessage(message);
                    return isSuccess
                default:
                    return false;
            }
        };
        co(authSuite).then(isSuccess=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }

    cancelAuthSuite(corpID, suiteID, traceContext, callback) {
        if (!corpID || !suiteID) {
            callback(null, false);
            return;
        }
        let self = this;

        function removeAuthCorpSuiteInfo() {
            return new Promise((resolve, reject)=> {
                self._authCorpSuiteInfoRepository.removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function produceCorpCancelAuthSmartgridSuiteMessage(message) {
            return new Promise((resolve, reject)=> {
                self._messageProducer.produceCorpCancelAuthSmartgridSuiteMessage(message, traceContext, (err, data)=> {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        }

        function* cancelAuthSuite() {
            let isSuccess = yield removeAuthCorpSuiteInfo();
            if (!isSuccess) {
                return false;
            }
            let message = {
                corpID: corpID,
                timestamp: new Date().getTime()
            };
            switch (suiteID) {
                case constant.smartgridSuite:
                    let isSuccess = yield produceCorpCancelAuthSmartgridSuiteMessage(message);
                    return isSuccess
                default:
                    return false;
            }
        };
        co(cancelAuthSuite).then(isSuccess=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Service;