'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const AuthCorpContactsService = require('../../../lib/application/service/authCorpContactsService');
const MockAuthCorpService = require('../../mock/application/service/authCorpService');

describe('authCorpContactsService use case test', ()=> {
    let service;
    before(()=> {
        service = new AuthCorpContactsService();
        let mockAuthCorpService = new MockAuthCorpService();
        muk(service, "_authCorpService", mockAuthCorpService);
    });
    describe('#getUsers(corpID, suiteID, traceContext, callback)', ()=> {
        context('get auth corp suite users', ()=> {
            it('get return null if request wechat server fail or other depend err', done=> {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.listUsers = (authCorpSuiteAccessToken, departmentID, fetchChild = 1, status = 1, traceContext, callback)=> {
                    callback(null, {
                        errcode: 200,
                        errmsg: "fail"
                    });
                };
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(null, suiteID, {}, (err, usersData)=> {
                    _.isNull(usersData).should.be.eql(true);
                    done();
                });
            });
            it('get users if all is ok', done=> {
                let mockWechatQYAPIContactsServiceGateway = {};
                mockWechatQYAPIContactsServiceGateway.listUsers = (authCorpSuiteAccessToken, departmentID, fetchChild = 1, status = 1, traceContext, callback)=> {
                    callback(null, {
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
                muk(service, "_wechatQYAPIContactsServiceGateway", mockWechatQYAPIContactsServiceGateway);
                let corpID = "corpID";
                let suiteID = "tj75d1122acf5ed4aa";
                service.getUsers(corpID, suiteID, {}, (err, userDatas)=> {
                    userDatas[0].corpID.should.be.eql("corpID");
                    userDatas[0].userID.should.be.eql("zhangsan");
                    userDatas[0].userName.should.be.eql("uerltd");
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