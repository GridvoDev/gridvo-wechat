'use strict';
const SuiteAccessTokenService = require("./suiteAccessTokenService");
const AuthCorpService = require("./authCorpService");
const AuthCorpContactsService = require("./authCorpContactsService");
const CorpAuthSuiteService = require("./corpAuthSuiteService");
const OAuthService = require("./oAuthService");

let suiteAccessTokenService = null;
function createSuiteAccessTokenService(single = true) {
    if (single && suiteAccessTokenService) {
        return suiteAccessTokenService;
    }
    suiteAccessTokenService = new SuiteAccessTokenService();
    return suiteAccessTokenService;
};

let authCorpService = null;
function createAuthCorpService(single = true) {
    if (single && authCorpService) {
        return authCorpService;
    }
    authCorpService = new AuthCorpService();
    return authCorpService;
};

let authCorpContactsService = null;
function createAuthCorpContactsService(single = true) {
    if (single && authCorpContactsService) {
        return authCorpContactsService;
    }
    authCorpContactsService = new AuthCorpContactsService();
    return authCorpContactsService;
};

let corpAuthSuiteService = null;
function createCorpAuthSuiteService(single = true) {
    if (single && corpAuthSuiteService) {
        return corpAuthSuiteService;
    }
    corpAuthSuiteService = new CorpAuthSuiteService();
    return corpAuthSuiteService;
};

let oAuthService = null;
function createOAuthService(single = true) {
    if (single && oAuthService) {
        return oAuthService;
    }
    oAuthService = new OAuthService();
    return oAuthService;
};

module.exports = {
    createSuiteAccessTokenService,
    createAuthCorpService,
    createAuthCorpContactsService,
    createCorpAuthSuiteService,
    createOAuthService
};