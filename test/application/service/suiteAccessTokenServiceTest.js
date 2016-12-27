'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const SuiteAccessTokenService = require('../../../lib/application/service/suiteAccessTokenService');
const MockSuiteTicketRepository = require('../../mock/infrastructure/repository/suiteTicketRepository');

describe('suiteAccessTokenService use case test', ()=> {
    let service;
    before(()=> {
        service = new SuiteAccessTokenService();
        let mockSuiteTicketRepository = new MockSuiteTicketRepository();
        muk(service, "_suiteTicketRepository", mockSuiteTicketRepository);
    });
    describe('#updateSuiteTicket(suiteTicketData, traceContext, callback)', ()=> {
        context('update a suite ticket', ()=> {
            it('update suite ticket fail if no suiteID or ticket or dateTime', done=> {
                let suiteTicketData = {};
                suiteTicketData.suiteID = "";
                service.updateSuiteTicket(suiteTicketData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('save suite ticket success', done=> {
                let suiteTicketData = {};
                suiteTicketData.suiteID = "suiteID";
                suiteTicketData.ticket = "Ticket";
                suiteTicketData.dateTime = (new Date()).getTime();
                service.updateSuiteTicket(suiteTicketData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getLatestSuiteAccessToken(suiteID, traceContext, callback)', ()=> {
        context('get latest suite access token', ()=> {
            it('get accessToken from Repository if accessToken is not overdue', done=> {
                let mockSuiteAccessTokenRepository = {};
                mockSuiteAccessTokenRepository.getSuiteAccessTokenBySuiteID = (suiteID, traceContext, callback)=> {
                    callback(null, {
                        suiteID: "tj75d1122acf5ed4aa",
                        accessToken: "noOverdueAccessToken",
                        expire: (new Date((new Date().getTime() + 50000))).getTime()
                    });
                };
                muk(service, "_suiteAccessTokenRepository", mockSuiteAccessTokenRepository);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, {}, (err, suiteAccessToken)=> {
                    if (err) {
                        done(err);
                    }
                    suiteAccessToken.should.be.eql("noOverdueAccessToken");
                    done();
                });
            });
            it('get return null if wechat third api service gateway fail or other depend err', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getSuiteAccessToken = (suiteID, suiteSecret, suiteTicket, traceContext, callback)=> {
                    callback(null, null);
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                let mockSuiteAccessTokenRepository = {};
                mockSuiteAccessTokenRepository.getSuiteAccessTokenBySuiteID = (suiteID, traceContext, callback)=> {
                    callback(null, {
                        suiteID: "tj75d1122acf5ed4aa",
                        accessToken: "AccessToken",
                        expire: (new Date()).getTime()
                    });
                };
                mockSuiteAccessTokenRepository.save = (suiteAccessToken, traceContext, callback)=> {
                    callback(null, true);
                };
                muk(service, "_suiteAccessTokenRepository", mockSuiteAccessTokenRepository);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, {}, (err, suiteAccessToken)=> {
                    if (err) {
                        done(err);
                    }
                    _.isNull(suiteAccessToken).should.be.eql(true);
                    done();
                });
            });
            it('get accessToken from wechat server and save accessToken if accessToken is overdue', done=> {
                let mockWechatThirdAPIServiceGateway = {};
                mockWechatThirdAPIServiceGateway.getSuiteAccessToken = (suiteID, suiteSecret, suiteTicket, traceContext, callback)=> {
                    callback(null, {suite_access_token: "accessToken", "expires_in": 7200});
                };
                muk(service, "_wechatThirdAPIServiceGateway", mockWechatThirdAPIServiceGateway);
                let mockSuiteAccessTokenRepository = {};
                mockSuiteAccessTokenRepository.getSuiteAccessTokenBySuiteID = (suiteID, traceContext, callback)=> {
                    callback(null, {
                        suiteID: "tj75d1122acf5ed4aa",
                        accessToken: "AccessToken",
                        expire: (new Date()).getTime()
                    });
                };
                mockSuiteAccessTokenRepository.save = (suiteAccessToken, traceContext, callback)=> {
                    callback(null, true);
                };
                muk(service, "_suiteAccessTokenRepository", mockSuiteAccessTokenRepository);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, {}, (err, suiteAccessToken)=> {
                    if (err) {
                        done(err);
                    }
                    suiteAccessToken.should.be.eql("accessToken");
                    done();
                });
            });
            after(()=> {
                muk.restore();
            });
        });
    });
})
;