'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const OAuthService = require('../../../lib/application/service/oAuthService');
const MockAuthCorpService = require('../../mock/application/service/authCorpService');

describe('oAuthService use case test', () => {
    let service;
    before(() => {
        service = new OAuthService();
        let mockAuthCorpService = new MockAuthCorpService();
        muk(service, "_authCorpService", mockAuthCorpService);
    });
    describe('#auth(corpID, suiteID, code, traceContext, callback)', () => {
        context('oauth wechat user', () => {
            it('auth fail if no corpID or suiteID or code', done => {
                service.auth(null, null, null, {}, (err, userJSON) => {
                    _.isNull(userJSON).should.be.eql(true);
                    done();
                });
            });
            it('auth success if all is ok', done => {
                let mockWechatQYAPIOAuthServiceGateway = {};
                mockWechatQYAPIOAuthServiceGateway.getUserInfo = (suiteAccessToken, code, traceContext, callback) => {
                    callback(null, {
                        UserId: "USERID",
                        DeviceId: "DEVICEID"
                    });
                };
                muk(service, "_wechatQYAPIOAuthServiceGateway", mockWechatQYAPIOAuthServiceGateway);
                service.auth("corpID", "suiteID", "code", {}, (err, userJSON) => {
                    if (err) {
                        done(err);
                    }
                    userJSON.userID.should.be.eql("USERID");
                    done();
                });
            });
        });
    });
    after(() => {
        muk.restore();
    });
})
;