'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const AuthCorpService = require('../../../lib/application/service/authCorpService');
const MockAuthCorpSuiteInfoRepository = require('../../mock/infrastructure/repository/authCorpSuiteInfoRepository');
const MockSuiteAccessTokenService = require('../../mock/application/service/suiteAccessTokenService');

describe('authCorpService use case test', ()=> {
    let service;
    before(()=> {
        service = new AuthCorpService();
        let mockAuthCorpSuiteInfoRepository = new MockAuthCorpSuiteInfoRepository();
        muk(service, "_authCorpSuiteInfoRepository", mockAuthCorpSuiteInfoRepository);
        let mockSuiteAccessTokenService = new MockSuiteAccessTokenService();
        muk(service, "_suiteAccessTokenService", mockSuiteAccessTokenService);
    });
    describe('#updateAuthCorpSuiteInfo(corpID, suiteID, traceContext, callback)', ()=> {
        context('update auth corp suite info', ()=> {
            it('update fail if no corpID or suiteID', done=> {
                service.updateAuthCorpSuiteInfo(null, null, {}, (err, isSuccess)=> {
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('update success if all is ok', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getAuthInfo = (corpID, suiteID, permanentCode, suiteAccessToken, traceContext, callback)=> {
                    callback(null, {
                        auth_info: {
                            agent: [{
                                agentid: 1,
                                appid: 1
                            }]
                        }
                    });
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                service.updateAuthCorpSuiteInfo("corpID", "suiteID", {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getAuthCorpLatesSuiteAccessToken(corpID, suiteID, traceContext, callback)', ()=> {
        context('get auth corp suite access token', ()=> {
            it('is success if all is ok ', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getCorpToken = (corpID, suiteID, permanentCode, suiteAccessToken, traceContext, callback)=> {
                    callback(null, {
                        access_token: "accessToken",
                        expires_in: 7200,
                    });
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                let corpID = "corpID";
                let suiteID = "suiteID";
                service.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, {}, (err, accessToken)=> {
                    if (err) {
                        done(err);
                    }
                    accessToken.should.be.eql("accessToken");
                    done();
                });
            });
        });
    });
    after(()=> {
        muk.restore();
    });
})
;