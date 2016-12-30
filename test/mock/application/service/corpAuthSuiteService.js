'use strict';

class Service {
    getSuitePreAuthCode(suiteID, traceContext, callback) {
        if (!suiteID) {
            callback(null, null);
            return;
        }
        callback(null, "suitePreAuthCode");
    }

    generateSuiteAuthURLSync(suiteID, preAuthCode, redirectURI, state) {
        if (!suiteID) {
            return null;
        }
        return "suite-auth-url";
    }

    authSuite(suiteID, authCode, traceContext, callback) {
        callback(null, true);
    }
}

module.exports = Service;