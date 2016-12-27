'use strict';
const {createMessageProducer} = require("./message");
const {
    createAuthCorpSuiteInfoRepository,
    createSuiteAccessTokenRepository,
    createSuiteTicketRepository
} = require("./repository");
const {createWechatThirdAPIServiceGateway} = require("./serviceGateway");
module.exports = {
    createAuthCorpSuiteInfoRepository,
    createSuiteAccessTokenRepository,
    createSuiteTicketRepository,
    createMessageProducer,
    createWechatThirdAPIServiceGateway
};