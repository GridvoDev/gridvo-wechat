'use strict';
var SuiteAccessToken = require('../../../../lib/domain/suiteAccessToken');

function Repository() {

};

Repository.prototype.saveSuiteAccessToken = function (suiteAccessToken, callback) {
    callback(null, true);
};

Repository.prototype.getSuiteAccessTokenBySuiteID = function (suiteID, callback) {
    callback(null, new SuiteAccessToken({
        suiteID: "suiteID",
        accessToken: "accessToken",
        expire: new Date()
    }));
};

module.exports = Repository;