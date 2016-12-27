'use strict';
const SuiteAccessTokenService = require("./suiteAccessTokenService");

let suiteAccessTokenService = null;
function createSuiteAccessTokenService(single = true) {
    if (single && suiteAccessTokenService) {
        return wechatThirdAPIServiceGateway;
    }
    suiteAccessTokenService = new SuiteAccessTokenService();
    return suiteAccessTokenService;
};

module.exports = {
    createSuiteAccessTokenService
};