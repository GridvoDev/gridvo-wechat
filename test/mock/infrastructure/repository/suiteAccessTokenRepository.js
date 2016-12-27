'use strict';
const {SuiteAccessToken} = require('../../../../lib/domain');

class Repository {
    save(suiteAccessToken, traceContext, callback) {
        callback(null, true);
    }

    getSuiteAccessTokenBySuiteID(suiteID, traceContext, callback) {
        callback(null, new SuiteAccessToken({
            suiteID: "suiteID",
            accessToken: "accessToken",
            expire: new Date()
        }));
    }
}

module.exports = Repository;