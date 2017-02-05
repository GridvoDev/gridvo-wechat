'use strict';
const {createMessageProducer} = require("./message");
const {
    createAuthCorpSuiteInfoRepository,
    createSuiteAccessTokenRepository,
    createSuiteTicketRepository
} = require("./repository");
const {
    createWechatThirdAPIServiceGateway,
    createWechatQYAPIMenuServiceGateway,
    createWechatQYAPIContactsServiceGateway,
    createWechatQYAPIOAuthServiceGateway
} = require("./serviceGateway");
module.exports = {
    createAuthCorpSuiteInfoRepository,
    createSuiteAccessTokenRepository,
    createSuiteTicketRepository,
    createMessageProducer,
    createWechatThirdAPIServiceGateway,
    createWechatQYAPIMenuServiceGateway,
    createWechatQYAPIContactsServiceGateway,
    createWechatQYAPIOAuthServiceGateway
};