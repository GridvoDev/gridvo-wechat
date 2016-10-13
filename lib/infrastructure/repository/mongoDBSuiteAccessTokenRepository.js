'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');
var SuiteAccessToken = require('../../domain/suiteAccessToken');

function Repository() {
    var MONGODB_SERVICE_HOST = process.env.MONGODB_SERVICE_HOST ? process.env.MONGODB_SERVICE_HOST : "127.0.0.1";
    var MONGODB_SERVICE_PORT = process.env.MONGODB_SERVICE_PORT ? process.env.MONGODB_SERVICE_PORT : "27017";
    this.dBUrl = `mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Wechat`;
};

Repository.prototype.saveSuiteAccessToken = function (suiteAccessToken, callback) {
    var repository = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(repository.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        let updateOperations = {};
        updateOperations.accessToken = suiteAccessToken.accessToken;
        updateOperations.expire = suiteAccessToken.expire;
        mongoDB.collection("suiteAccessToken").updateOne({
                suiteID: suiteAccessToken.suiteID
            },
            {
                $set: updateOperations
            },
            {
                upsert: true

            },
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, false);
            mongoDB.close();
            return;
        }
        if (result.result.n == 1) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
        mongoDB.close();
    });
};

Repository.prototype.getSuiteAccessTokenBySuiteID = function (suiteID, callback) {
    var repository = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(repository.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var cursor = db.collection('suiteAccessToken').find({"suiteID": suiteID});
        cursor.limit(1).next(cb);
    }], function (err, document) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (_.isNull(document)) {
            callback(null, null);
            mongoDB.close();
            return;
        }
        var suiteAccessToken = new SuiteAccessToken(document);
        callback(null, suiteAccessToken);
        mongoDB.close();
    });
};

module.exports = Repository;