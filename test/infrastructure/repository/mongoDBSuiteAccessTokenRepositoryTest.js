'use strict';
var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var should = require('should');
var SuiteAccessToken = require('../../../lib/domain/suiteAccessToken');
var mongoDBSuiteAccessTokenRepository = require('../../../lib/infrastructure/repository/mongoDBSuiteAccessTokenRepository');

describe('suiteAccessTokenRepository MongoDB use case test', function () {
    var Repository;
    before(function () {
        Repository = new mongoDBSuiteAccessTokenRepository();
    });
    describe('#saveSuiteAccessToken(suiteAccessToken, cb)', function () {
        context('save a suite access token', function () {
            it('should return true if save success', function (done) {
                var suiteAccessToken = new SuiteAccessToken({
                    suiteID: "suiteID",
                    accessToken: "AccessToken",
                    expire: new Date()
                });
                Repository.saveSuiteAccessToken(suiteAccessToken, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getSuiteAccessTokenBySuiteID(suiteID, cb)', function () {
        context('get a suite AccessToken for suite id', function () {
            it('should return null if no this suite AccessToken', function (done) {
                var suiteID = "noSuiteID";
                Repository.getSuiteAccessTokenBySuiteID(suiteID, function (err, suiteAccessToken) {
                    _.isNull(suiteAccessToken).should.be.eql(true);
                    done();
                });
            });
            it('should return suite AccessToken', function (done) {
                var suiteID = "suiteID";
                Repository.getSuiteAccessTokenBySuiteID(suiteID, function (err, suiteAccessToken) {
                    suiteAccessToken.suiteID.should.be.eql("suiteID");
                    suiteAccessToken.accessToken.should.be.eql("AccessToken");
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
            db.collection('SuiteAccessToken').drop(function (err, response) {
                db.close();
                done();
            });
        });
    });
});