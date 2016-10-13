'use strict';
var _ = require('underscore');
var bearcat = require('bearcat');
var should = require('should');
var muk = require('muk');

describe('suiteAccessTokenService use case test', function () {
    var service;
    before(function () {
        var contextPath = require.resolve('../../../unittest_application_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            service = bearcat.getBean('suiteAccessTokenService');
        });
    });
    describe('#updateSuiteTicket(suiteTicketData,callback)', function () {
        context('update a suite ticket', function () {
            it('update suite ticket fail if no suiteID or ticket or dateTime', function (done) {
                var suiteTicketData = {};
                suiteTicketData.suiteID = "";
                service.updateSuiteTicket(suiteTicketData, function (err, isSuccess) {
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('save suite ticket success', function (done) {
                var suiteTicketData = {};
                suiteTicketData.suiteID = "suiteID";
                suiteTicketData.ticket = "Ticket";
                suiteTicketData.dateTime = new Date();
                service.updateSuiteTicket(suiteTicketData, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getLatestSuiteAccessToken(suiteID,callback)', function () {
        context('get latest suite access token', function () {
            it('get return null if request wechat server fail or other depend err', function (done) {
                var mockRequest = function (options, callback) {
                    var err = true;
                    callback(err, null);
                };
                muk(service, "__httpRequest__", mockRequest);
                var suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, function (err, suiteAccessToken) {
                    _.isNull(suiteAccessToken).should.be.eql(true);
                    done();
                });
            });
            it('get accessToken from Repository if accessToken is not overdue', function (done) {
                var mockSuiteAccessTokenRepository = {};
                mockSuiteAccessTokenRepository.getSuiteAccessTokenBySuiteID = (suiteID, callback)=> {
                    callback(null, {
                        suiteID: "tj75d1122acf5ed4aa",
                        accessToken: "noOverdueAccessToken",
                        expire: new Date((new Date().getTime() + 50000))
                    });
                };
                muk(service, "__suiteAccessTokenRepository__", mockSuiteAccessTokenRepository);
                var suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, function (err, suiteAccessToken) {
                    suiteAccessToken.should.be.eql("noOverdueAccessToken");
                    done();
                });
            });
            it('get accessToken from wechat server and save accessToken if accessToken is overdue', function (done) {
                var mockRequest = function (options, callback) {
                    callback(null, {}, {suite_access_token: "accessToken", "expires_in": 7200});
                };
                muk(service, "__httpRequest__", mockRequest);
                var mockSuiteAccessTokenRepository = {};
                mockSuiteAccessTokenRepository.getSuiteAccessTokenBySuiteID = (suiteID, callback)=> {
                    callback(null, {
                        suiteID: "tj75d1122acf5ed4aa",
                        accessToken: "AccessToken",
                        expire: new Date()
                    });
                };
                mockSuiteAccessTokenRepository.saveSuiteAccessToken = ()=> {
                    done();
                };
                muk(service, "__suiteAccessTokenRepository__", mockSuiteAccessTokenRepository);
                var suiteID = "tj75d1122acf5ed4aa";
                service.getLatestSuiteAccessToken(suiteID, function (err, suiteAccessToken) {
                    suiteAccessToken.should.be.eql("accessToken");
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
})
;