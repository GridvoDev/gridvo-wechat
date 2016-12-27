'use strict';
var _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {AuthCorpSuiteInfo} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "WeChat";
        this._collectionName = "AuthCorpSuiteInfo";
        this._serviceName = "gridvo-wechat";
    }

    save(authCorpSuiteInfo, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            let {corpID, suiteID, permanentCode, accessToken, accessTokenExpires, agents}=authCorpSuiteInfo;
            let updateOperations = {
                permanentCode,
                accessToken,
                accessTokenExpires,
                agents
            };
            collection.updateOne({
                    corpID,
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

    getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            collection.findOne({corpID, suiteID}, {limit: 1}, (err, document)=> {
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
                    let authCorpSuiteInfo = new AuthCorpSuiteInfo(document);
                    callback(null, authCorpSuiteInfo);
                    db.close();
                }
            );
        }).catch(err=> {
            callback(err);
        });
    }

    removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            collection.deleteMany({corpID, suiteID}, (err, result)=> {
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
                }
            );
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Repository;