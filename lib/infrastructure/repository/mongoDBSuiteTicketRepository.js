'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');
var SuiteTicket = require('../../domain/suiteTicket');

function Repository() {
    this.dBUrl = `mongodb://${process.env.MONGODB_SERVICE_HOST}:${process.env.MONGODB_SERVICE_PORT}/Wechat`;
};

Repository.prototype.saveSuiteTicket = function (suiteTicket, callback) {
    var repository = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(repository.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        let updateOperations = {};
        updateOperations.ticket = suiteTicket.ticket;
        updateOperations.dateTime = suiteTicket.dateTime;
        mongoDB.collection("SuiteTicket").updateOne({
                suiteID: suiteTicket.suiteID
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

Repository.prototype.getSuiteTicket = function (suiteID, callback) {
    var repository = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(repository.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var cursor = db.collection('SuiteTicket').find({"suiteID": suiteID});
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
        var suiteTicket = new SuiteTicket(document);
        callback(null, suiteTicket);
        mongoDB.close();
    });
};

module.exports = Repository;