'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {SuiteTicket} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "WeChat";
        this._collectionName = "SuiteTicket";
        this._serviceName = "gridvo-wechat";
    }

    save(suiteTicket, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            let {suiteID, ticket, dateTime}=suiteTicket;
            let updateOperations = {
                ticket,
                dateTime
            };
            collection.updateOne({
                    suiteID
                },
                {
                    $set: updateOperations
                },
                {
                    upsert: true
                },
                (err, result)=> {
                    if (err) {
                        callback(err);
                        db.close();
                        return;
                    }
                    if (result.result.n == 1) {
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                    db.close();
                });
        }).catch(err=> {
            callback(err);
        });
    }

    getSuiteTicketBySuiteID(suiteID, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            collection.findOne({suiteID}, {limit: 1}, (err, document)=> {
                    if (err) {
                        callback(err, null);
                        db.close();
                        return;
                    }
                    if (_.isNull(document)) {
                        callback(null, null);
                        db.close();
                        return;
                    }
                    let suiteTicket = new SuiteTicket(document);
                    callback(null, suiteTicket);
                    db.close();
                }
            );
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Repository;