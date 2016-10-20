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

Service.prototype.authSuite = function (suiteID, authCode, callback) {
    callback(null, null);
};

module.exports = Service;