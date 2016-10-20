'use strict';

function Service() {
};

Service.prototype.getAuthCorpLatesSuiteAccessToken = function (corpID, suiteID, callback) {
    callback(null, "suiteAccessToken");
};

module.exports = Service;