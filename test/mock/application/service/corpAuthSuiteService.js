'use strict';

function Service() {
};

Service.prototype.getSuitePreAuthCode = function (suiteID, callback) {
    if (!suiteID) {
        callback(null, null);
        return;
    }
    callback(null, "suitePreAuthCode");
};

Service.prototype.generateSuiteAuthURL = function (suiteID, preAuthCode, redirectURI, state, callback) {
    callback(null, "suite-auth-url");
};

module.exports = Service;