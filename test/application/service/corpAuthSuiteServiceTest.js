'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const CorpAuthSuiteService = require('../../../lib/application/service/corpAuthSuiteService');
const MockAuthCorpSuiteInfoRepository = require('../../mock/infrastructure/repository/authCorpSuiteInfoRepository');
const MockSuiteAccessTokenService = require('../../mock/application/service/suiteAccessTokenService');
const MockMessageProducer = require('../../mock/infrastructure/message/messageProducer');

describe('corpAuthSuiteService use case test', ()=> {
    let service;
    before(()=> {
        service = new CorpAuthSuiteService();
        let mockAuthCorpSuiteInfoRepository = new MockAuthCorpSuiteInfoRepository();
        muk(service, "_authCorpSuiteInfoRepository", mockAuthCorpSuiteInfoRepository);
        let mockSuiteAccessTokenService = new MockSuiteAccessTokenService();
        muk(service, "_suiteAccessTokenService", mockSuiteAccessTokenService);
        let mockMessageProducer = new MockMessageProducer();
        muk(service, "_messageProducer", mockMessageProducer);
    });
    describe('#getSuitePreAuthCode(suiteID, traceContext, callback)', ()=> {
        context('get  suite pre auth code', ()=> {
            it('is success', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getPreAuthCode = (suiteID, suiteAccessToken, traceContext, callback)=> {
                    callback(null, {
                        errcode: 0,
                        errmsg: "ok",
                        pre_auth_code: "Cx_Dk6qiBE0Dmx4EmlT3oRfArPvwSQ-oa3NL_fwHM7VI08r52wazoZX2Rhpz1dEw",
                        expires_in: 1200
                    });
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getSuitePreAuthCode(suiteID, {}, (err, authCode)=> {
                    if (err) {
                        done(err);
                    }
                    authCode.should.be.eql("Cx_Dk6qiBE0Dmx4EmlT3oRfArPvwSQ-oa3NL_fwHM7VI08r52wazoZX2Rhpz1dEw");
                    done();
                });
            });
        });
    });
    describe('#generateSuiteAuthURLSync(suiteID, preAuthCode, redirectURI, state)', ()=> {
        context('generate suite auth Url', ()=> {
            it('is success', ()=> {
                let expectedSuiteAuthURL = "https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id=suiteID&pre_auth_code=preAuthCode&redirect_uri=redirectURI&state=ok";
                let suiteID = "suiteID";
                let preAuthCode = "preAuthCode";
                let redirectURI = "redirectURI";
                let state = "ok";
                let suiteAuthURL = service.generateSuiteAuthURLSync(suiteID, preAuthCode, redirectURI, state);
                suiteAuthURL.should.be.eql(expectedSuiteAuthURL);
            });
        });
    });
    describe('#authSuite(suiteID, authCode, traceContext, callback)', ()=> {
        context('auth suite', ()=> {
            it('reture true if all is ok ', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getPermanentCode = (suiteID, authCode, suiteAccessToken, traceContext, callback)=> {
                    callback(null, {
                        access_token: "accessToken",
                        permanent_code: "permanentCode",
                        auth_corp_info: {
                            corpid: "corpID"
                        },
                        auth_info: {
                            agent: [{
                                agentid: 1,
                                appid: 1
                            }]
                        }
                    });
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                let mockWechatQYAPIMenuServiceGateway = {};
                mockWechatQYAPIMenuServiceGateway.createMenu = (authCorpSuiteAccessToken, agentID, menuData, traceContext, callback)=> {
                    callback(null, {
                        errcode: 0,
                        errmsg: "ok"
                    });
                };
                muk(service, "_wechatQYAPIMenuServiceGateway", mockWechatQYAPIMenuServiceGateway);
                let suiteID = "tj75d1122acf5ed4aa";
                let authCode = "authCode";
                service.authSuite(suiteID, authCode, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#cancelAuthSuite(corpID, suiteID, traceContext, callback)', ()=> {
        context('cancel auth suite', ()=> {
            it('reture true if all is ok ', done=> {
                let corpID = "wxf8b4f85f3a794e77";
                let suiteID = "tj75d1122acf5ed4aa";
                service.cancelAuthSuite(corpID, suiteID, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(()=> {
        muk.restore();
    });
});