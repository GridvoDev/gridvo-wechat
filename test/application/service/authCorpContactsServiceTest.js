'use strict';
var _ = require('underscore');
var bearcat = require('bearcat');
var should = require('should');
var muk = require('muk');

describe('authCorpContactsService use case test', function () {
    var service;
    before(function () {
        var contextPath = require.resolve('../../../unittest_application_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            service = bearcat.getBean('authCorpContactsService');
        });
    });
    describe('#getUsers(corpID, suiteID, callback)', function () {
        context('get auth corp suite users', function () {
            it('get return null if request wechat server fail or other depend err', function (done) {
                var mockRequest = function (options, callback) {
                    var err = true;
                    callback(err, null);
                };
                muk(service, "__httpRequest__", mockRequest);
                var suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(null, suiteID, function (err, usersData) {
                    _.isNull(usersData).should.be.eql(true);
                    done();
                });
            });
            it('get users if all is ok', function (done) {
                var mockRequest = function (options, callback) {
                    callback(null, {}, {
                        errcode: 0,
                        errmsg: "ok",
                        userlist: [
                            {
                                userid: "zhangsan",
                                name: "uerltd"
                            }
                        ]
                    });
                };
                muk(service, "__httpRequest__", mockRequest);
                var corpID = "corpID";
                var suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(corpID, suiteID, function (err, userDatas) {
                    userDatas[0].corpID.should.be.eql("corpID");
                    userDatas[0].userID.should.be.eql("zhangsan");
                    userDatas[0].userName.should.be.eql("uerltd");
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