'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const SuiteAccessToken = require('../../../lib/domain/suiteAccessToken');
const mongoDBSuiteAccessTokenRepository = require('../../../lib/infrastructure/repository/mongoDBSuiteAccessTokenRepository');

describe('suiteAccessTokenRepository MongoDB use case test', ()=> {
    let Repository;
    before(()=> {
        Repository = new mongoDBSuiteAccessTokenRepository();
    });
    describe('#save(suiteAccessToken, traceContext, cb)', ()=> {
        context('save a suite access token', ()=> {
            it('should return true if save success', done=> {
                let suiteAccessToken = new SuiteAccessToken({
                    suiteID: "suiteID",
                    accessToken: "AccessToken",
                    expire: (new Date()).getTime()
                });
                Repository.save(suiteAccessToken, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getSuiteAccessTokenBySuiteID(suiteID, traceContext, cb)', ()=> {
        context('get a suite AccessToken for suite id', ()=> {
            it('should return null if no this suite AccessToken', done=> {
                let suiteID = "noSuiteID";
                Repository.getSuiteAccessTokenBySuiteID(suiteID, {}, (err, suiteAccessToken)=> {
                    if (err) {
                        done(err);
                    }
                    _.isNull(suiteAccessToken).should.be.eql(true);
                    done();
                });
            });
            it('should return suite AccessToken', done=> {
                let suiteID = "suiteID";
                Repository.getSuiteAccessTokenBySuiteID(suiteID, {}, (err, suiteAccessToken)=> {
                    if (err) {
                        done(err);
                    }
                    suiteAccessToken.suiteID.should.be.eql("suiteID");
                    suiteAccessToken.accessToken.should.be.eql("AccessToken");
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
            db.collection('SuiteAccessToken').drop((err, response)=> {
                db.close();
                done();
            });
        });
    });
});