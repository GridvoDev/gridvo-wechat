'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {SuiteAccessToken} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "WeChat";
        this._collectionName = "SuiteAccessToken";
        this._serviceName = "gridvo-wechat";
    }

    save(suiteAccessToken, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            let {suiteID, accessToken, expire}=suiteAccessToken;
            let updateOperations = {
                accessToken,
                expire
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

    getSuiteAccessTokenBySuiteID(suiteID, traceContext, callback) {
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
                    let suiteAccessToken = new SuiteAccessToken(document);
                    callback(null, suiteAccessToken);
                    db.close();
                }
            );
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Repository;