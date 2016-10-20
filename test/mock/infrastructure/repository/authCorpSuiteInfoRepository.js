'use strict';
var AuthCorpSuiteInfo = require('../../../../lib/domain/authCorpSuiteInfo.js');

function Repository() {
};

Repository.prototype.save = function (authCorpSuiteInfo, callback) {
    callback(null, true);
};

Repository.prototype.getAuthCorpSuiteInfoByCorpIDAndSuiteID = function (corpID, suiteID, callback) {
    switch (corpID) {
        case "corpID":
            callback(null, new AuthCorpSuiteInfo({
                corpID: "corpID",
                suiteID: "suiteID",
                permanentCode: "permanentCode",
                accessToken: "accessToken",
                accessTokenExpires: new Date(),
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
};

Repository.prototype.removeAuthCorpSuiteInfoByCorpIDAndSuiteID = function (corpID, suiteID, callback) {
    callback(null, true);
};
module.exports = Repository;