'use strict';
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var should = require('should');
var AuthCorpSuiteInfo = require('../../../lib/domain/authCorpSuiteInfo');
var mongoDBAuthCorpSuiteInfoRepository = require('../../../lib/infrastructure/repository/mongoDBAuthCorpSuiteInfoRepository');

describe('mongoDBAuthCorpSuiteInfoRepository use case test', function () {
    var Repository;
    before(function () {
        Repository = new mongoDBAuthCorpSuiteInfoRepository();
    });
    describe('#save(authCorpSuiteInfo, cb)', function () {
        context('save a auth corp suite info', function () {
            it('should return true if save success', function (done) {
                var authCorpSuiteInfo = new AuthCorpSuiteInfo({
                    corpID: "corpID",
                    suiteID: "suiteID",
                    permanentCode: "permanentCode",
                    accessToken: "accessToken",
                    accessTokenExpire: new Date()
                });
                Repository.save(authCorpSuiteInfo, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, cb)', function () {
        context('get a auth corp suite info for corp id and suite id', function () {
            it('should return null if no this auth corp', function (done) {
                var corpID = "noCorpID";
                var suiteID = "noSuiteID";
                Repository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, function (err, authCorpSuiteInfo) {
                    _.isNull(authCorpSuiteInfo).should.be.eql(true);
                    done();
                });
            });
            it('should return auth corp suite info', function (done) {
                var corpID = "corpID";
                var suiteID = "suiteID";
                Repository.getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, function (err, authCorpSuiteInfo) {
                    authCorpSuiteInfo.corpID.should.be.eql("corpID");
                    done();
                });
            });
        });
    });
    describe('#removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, cb)', function () {
        context('remove a auth corp suite info for corp id and suite id', function () {
            it('is success', function (done) {
                var corpID = "corpID";
                var suiteID = "suiteID";
                Repository.removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(function (done) {
        var MONGODB_SERVICE_HOST = process.env.MONGODB_SERVICE_HOST ? process.env.MONGODB_SERVICE_HOST : "127.0.0.1";
        var MONGODB_SERVICE_PORT = process.env.MONGODB_SERVICE_PORT ? process.env.MONGODB_SERVICE_PORT : "27017";
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Wechat`, function (err, db) {
            if (err) {
                return;
            }
            db.collection('AuthCorpSuiteInfo').drop(function (err, response) {
                db.close();
                done();
            });
        });
    });
});