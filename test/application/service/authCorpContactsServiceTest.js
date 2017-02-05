'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const AuthCorpContactsService = require('../../../lib/application/service/authCorpContactsService');
const MockAuthCorpService = require('../../mock/application/service/authCorpService');

describe('authCorpContactsService use case test', () => {
    let service;
    before(() => {
        service = new AuthCorpContactsService();
        let mockAuthCorpService = new MockAuthCorpService();
        muk(service, "_authCorpService", mockAuthCorpService);
    });
    describe('#getUsers(corpID, suiteID, traceContext, callback)', () => {
        context('get auth corp suite users', () => {
            it('get return null if request wechat server fail or other depend err', done => {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.listUsers = (authCorpSuiteAccessToken, departmentID, fetchChild = 1, status = 1, traceContext, callback) => {
                    callback(null, {
                        errcode: 400,
                        errmsg: "fail"
                    });
                };
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(null, suiteID, {}, (err, usersJSON) => {
                    if(err){
                        done(err);
                    }
                    _.isNull(usersJSON).should.be.eql(true);
                    done();
                });
            });
            it('get users if all is ok', done => {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.listUsers = (authCorpSuiteAccessToken, departmentID, fetchChild = 1, status = 1, traceContext, callback) => {
                    callback(null, {
                        errcode: 0,
                        errmsg: "ok",
                        userlist: [
                            {
                                userid: "zhangsan",
                                name: "uerltd",
                                status: 1
                            }
                        ]
                    });
                };
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let corpID = "corpID";
                let suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(corpID, suiteID, {}, (err, usersJSON) => {
                    if(err){
                        done(err);
                    }
                    usersJSON[0].corpID.should.be.eql("corpID");
                    usersJSON[0].userID.should.be.eql("zhangsan");
                    usersJSON[0].userName.should.be.eql("uerltd");
                    usersJSON[0].status.should.be.eql(1);
                    done();
                });
            });
        });
    });
    describe('#getUser(corpID, suiteID, userID, traceContext, callback)', () => {
        context('get auth corp suite user', () => {
            it('get return null if request wechat server fail or other depend err', done => {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.getUser = (authCorpSuiteAccessToken, userID, traceContext, callback) => {
                    callback(null, {
                        errcode: 400,
                        errmsg: "fail"
                    });
                };
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getUser(null, suiteID, null, {}, (err, userJSON) => {
                    if(err){
                        done(err);
                    }
                    _.isNull(userJSON).should.be.eql(true);
                    done();
                });
            });
            it('get user if all is ok', done => {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.getUser = (authCorpSuiteAccessToken, userID, traceContext, callback) => {
                    callback(null, {
                        errcode: 0,
                        errmsg: "ok",
                        userid: "zhangsan",
                        name: "uerltd",
                        department: [1, 2],
                        position: "后台工程师",
                        mobile: "15913215421",
                        gender: "1",
                        email: "zhangsan@gzdev.com",
                        weixinid: "lisifordev",
                        avatar: "http://wx.qlogo.cn/mmopen/ajNVdqHZLLA3WJ6DSZUfiakYe37PKnQhBIeOQBO4czqrnZDS79FH5Wm5m4X69TBicnHFlhiafvDwklOpZeXYQQ2icg/0",
                        status: 1,
                        extattr: {"attrs": [{"name": "爱好", "value": "旅游"}, {"name": "卡号", "value": "1234567234"}]}
                    });
                };
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let corpID = "corpID";
                let suiteID = "tj75d1122acf5ed4aa";
                let userID = "userID";
                service.getUser(corpID, suiteID, userID, {}, (err, userJSON) => {
                    if(err){
                        done(err);
                    }
                    userJSON.corpID.should.be.eql("corpID");
                    userJSON.userID.should.be.eql("zhangsan");
                    userJSON.userName.should.be.eql("uerltd");
                    userJSON.status.should.be.eql(1);
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