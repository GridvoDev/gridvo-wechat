'use strict';
var _ = require('underscore');
var bearcat = require('bearcat');
var should = require('should');
var muk = require('muk');

describe('authCorpService use case test', function () {
    var service;
    before(function () {
        var contextPath = require.resolve('../../../unittest_application_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            service = bearcat.getBean('authCorpService');
        });
    });
    describe('#updateAuthCorpSuiteInfo(corpID, suiteID, callback)', function () {
        context('update auth corp suite info', function () {
            it('update fail if no corpID or suiteID', function (done) {
                service.updateAuthCorpSuiteInfo(null, null, function (err, isSuccess) {
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('update success if all is ok', function (done) {
                var mockRequest = function (options, callback) {
                    callback(null, {}, {
                        auth_info: {
                            agent: [{
                                agentid: 1,
                                appid: 1
                            }]
                        }
                    });
                };
                muk(service, "__httpRequest__", mockRequest);
                service.updateAuthCorpSuiteInfo("corpID", "suiteID", function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
    describe('#getAuthCorpLatesSuiteAccessToken(corpID, suiteID, callback)', function () {
        context('get auth corp suite access token', function () {
            it('is success if all is ok ', function (done) {
                var mockRequest = function (options, callback) {
                    callback(null, {}, {access_token: "accessToken"});
                };
                muk(service, "__httpRequest__", mockRequest);
                var corpID = "corpID";
                var suiteID = "suiteID";
                service.getAuthCorpLatesSuiteAccessToken(corpID, suiteID, function (err, accessToken) {
                    accessToken.should.be.eql("accessToken");
                    done();
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
})
;