'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const AuthCorpSuiteInfo = require('../../../lib/domain/authCorpSuiteInfo');
const mongoDBAuthCorpSuiteInfoRepository = require('../../../lib/infrastructure/repository/mongoDBAuthCorpSuiteInfoRepository');

describe('mongoDBAuthCorpSuiteInfoRepository use case test', ()=> {
    let Repository;
    before(()=> {
        Repository = new mongoDBAuthCorpSuiteInfoRepository();
    });
    describe('#save(authCorpSuiteInfo, traceContext, cb)', ()=> {
        context('save a auth corp suite info', ()=> {
            it('should return true if save success', done=> {
                let authCorpSuiteInfo = new AuthCorpSuiteInfo({
                    corpID: "corpID",
                    suiteID: "suiteID",
                    permanentCode: "permanentCode",
                    accessToken: "accessToken",
                    accessTokenExpire: new Date()
                });
                Repository.save(authCorpSuiteInfo, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, cb)', ()=> {
        context('get a auth corp suite info for corp id and suite id', ()=> {
            it('should return null if no this auth corp', done=> {
                let corpID = "noCorpID";
                let suiteID = "noSuiteID";
                Repository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, {}, (err, authCorpSuiteInfo)=> {
                    if (err) {
                        done(err);
                    }
                    _.isNull(authCorpSuiteInfo).should.be.eql(true);
                    done();
                });
            });
            it('should return auth corp suite info', done=> {
                let corpID = "corpID";
                let suiteID = "suiteID";
                Repository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, {}, (err, authCorpSuiteInfo)=> {
                    if (err) {
                        done(err);
                    }
                    authCorpSuiteInfo.corpID.should.be.eql("corpID");
                    done();
                });
            });
        });
    });
    describe('#removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, cb)', ()=> {
        context('remove a auth corp suite info for corp id and suite id', ()=> {
            it('is success', done=> {
                let corpID = "corpID";
                let suiteID = "suiteID";
                Repository.removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(done=> {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Wechat`, (err, db)=> {
            if (err) {
                done(err);
            }
            db.collection('AuthCorpSuiteInfo').drop((err, response)=> {
                db.close();
                done();
            });
        });
    });
});