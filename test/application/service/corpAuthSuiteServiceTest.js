'use strict';
var _ = require('underscore');
var bearcat = require('bearcat');
var should = require('should');
var muk = require('muk');

describe('corpAuthSuiteService use case test', function () {
    var service;
    before(function () {
        var contextPath = require.resolve('../../../unittest_application_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            service = bearcat.getBean('corpAuthSuiteService');
        });
    });
    describe('#getSuitePreAuthCode(suiteID, callback)', function () {
        context('get suite pre auth code', function () {
            it('is success if all is ok ', function (done) {
                var mockRequest = function (options, callback) {
                    callback(null, {}, {
                        errcode: "0",
                        errmsg: "ok",
                        pre_auth_code: "preAuthCode"
                    });
                };
                muk(service, "__httpRequest__", mockRequest);
                var suiteID = "suiteID";
                service.getSuitePreAuthCode(suiteID, function (err, preAuthCode) {
                    preAuthCode.should.be.eql("preAuthCode");
                    done();
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
    describe('#generateSuiteAuthURL(suiteID, preAuthCode, redirectURI, state, callback)', function () {
        context('generate suite auth Url', function () {
            it('is success', function (done) {
                var expectedSuiteAuthURL = "https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id=suiteID&pre_auth_code=preAuthCode&redirect_uri=redirectURI&state=ok";
                var suiteID = "suiteID";
                var preAuthCode = "preAuthCode";
                var redirectURI = "redirectURI";
                var state = "ok";
                service.generateSuiteAuthURL(suiteID, preAuthCode, redirectURI, state, function (err, suiteAuthURL) {
                    suiteAuthURL.should.be.eql(expectedSuiteAuthURL);
                    done();
                });
            });
        });
    });
    describe('#authSuite(suiteID, authCode, callback)', function () {
        context('auth suite', function () {
            it('reture true if all is ok ', function (done) {
                var mockRequest = function (options, callback) {
                    if (options.body.suite_id) {
                        callback(null, {}, {
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
                    }
                    else {
                        callback(null, {}, {
                            errcode: 0,
                            errmsg: "ok"
                        });
                    }
                };
                muk(service, "__httpRequest__", mockRequest);
                var suiteID = "tj75d1122acf5ed4aa";
                var authCode = "authCode";
                service.authSuite(suiteID, authCode, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
    describe('#cancelAuthSuite(corpID, suiteID, callback)', function () {
        context('cancel auth suite', function () {
            it('reture true if all is ok ', function (done) {
                var corpID = "wxf8b4f85f3a794e77";
                var suiteID = "tj75d1122acf5ed4aa";
                service.cancelAuthSuite(corpID, suiteID, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
            after(function () {
                muk.restore();
            });
        });
    });
});