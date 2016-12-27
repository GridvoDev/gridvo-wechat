'use strict';
const MongoDBAuthCorpSuiteInfoRepository = require("./mongoDBAuthCorpSuiteInfoRepository");
const MongoDBSuiteAccessTokenRepository = require("./mongoDBSuiteAccessTokenRepository");
const MongoDBSuiteTicketRepository = require("./mongoDBSuiteTicketRepository");

let mongoDBAuthCorpSuiteInfoRepository = null;
function createAuthCorpSuiteInfoRepository(single = true) {
    if (single && mongoDBAuthCorpSuiteInfoRepository) {
        return mongoDBAuthCorpSuiteInfoRepository;
    }
    mongoDBAuthCorpSuiteInfoRepository = new MongoDBAuthCorpSuiteInfoRepository();
    return mongoDBAuthCorpSuiteInfoRepository;
};

let mongoDBSuiteAccessTokenRepository = null;
function createSuiteAccessTokenRepository(single = true) {
    if (single && mongoDBSuiteAccessTokenRepository) {
        return mongoDBSuiteAccessTokenRepository;
    }
    mongoDBSuiteAccessTokenRepository = new MongoDBSuiteAccessTokenRepository();
    return mongoDBSuiteAccessTokenRepository;
};

let mongoDBSuiteTicketRepository = null;
function createSuiteTicketRepository(single = true) {
    if (single && mongoDBSuiteTicketRepository) {
        return mongoDBSuiteTicketRepository;
    }
    mongoDBSuiteTicketRepository = new MongoDBSuiteTicketRepository();
    return mongoDBSuiteTicketRepository;
};

module.exports = {
    createAuthCorpSuiteInfoRepository,
    createSuiteAccessTokenRepository,
    createSuiteTicketRepository
};