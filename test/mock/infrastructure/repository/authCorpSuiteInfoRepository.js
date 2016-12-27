'use strict';
const {AuthCorpSuiteInfo} = require('../../../../lib/domain');

class Repository {
    save(authCorpSuiteInfo, traceContext, callback) {
        callback(null, true);
    }

    getAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, callback) {
        switch (corpID) {
            case "corpID":
                callback(null, new AuthCorpSuiteInfo({
                    corpID: "corpID",
                    suiteID: "suiteID",
                    permanentCode: "permanentCode",
                    accessToken: "accessToken",
                    accessTokenExpires: (new Date()).getTime(),
                    agents: {"1": {"agentID": 1}}
                }));
                break;
            case "noCorpID":
                callback(null, null);
                break;
            default:
                callback(null, null);
                return;
        }
    }

    removeAuthCorpSuiteInfoByCorpIDAndSuiteID(corpID, suiteID, traceContext, callback) {
        callback(null, true);
    }
}

module.exports = Repository;