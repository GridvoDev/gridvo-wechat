'use strict';
const {kafkaZipkinMessageConsumer, kafkaWithZipkinTraceContextFeach} = require('gridvo-common-js');
const {tracer} = require('../util');
const {
    createSuiteAccessTokenService,
    createAuthCorpService,
    createCorpAuthSuiteService
} = require('../application');
const {logger} = require('../util');

function Consumer() {
    this._consumer = new kafkaZipkinMessageConsumer({tracer, serviceName: "gridvo-wechat"});
    this._corpAuthSuiteService = createCorpAuthSuiteService();
    this._authCorpService = createAuthCorpService();
    this._suiteAccessTokenService = createSuiteAccessTokenService();
};

Consumer.prototype.startConsume = function () {
    var topics = [{
        topic: "corp-cancel-auth"
    }, {
        topic: "corp-change-auth"
    }, {
        topic: "corp-create-auth"
    }, {
        topic: "suite-ticket-arrive"
    }];
    let self = this;
    this._consumer.consumeMessage(topics, (err, message)=> {
        let data = JSON.parse(message.value);
        let traceContext = kafkaWithZipkinTraceContextFeach(data);
        switch (message.topic) {
            case "corp-cancel-auth":
                self._corpAuthSuiteService.cancelAuthSuite(data.corpID, data.suiteID, traceContext, (err, isSuccess)=> {
                    if (err) {
                        logger.error(err.message, traceContext);
                        return;
                    }
                    if (isSuccess) {
                        logger.error(err.message, traceContext);
                        logger.error(`corp ${data.corpID} cancel auth suite ${data.suiteID} success`, traceContext);
                    } else {
                        logger.error(`corp ${data.corpID} cancel auth suite ${data.suiteID} fail`, traceContext);
                    }
                });
            case "corp-change-auth":
                self._authCorpService.updateAuthCorpSuiteInfo(data.corpID, data.suiteID, traceContext, (err, isSuccess)=> {
                    if (err) {
                        logger.error(err.message, traceContext);
                        return;
                    }
                    if (isSuccess) {
                        logger.error(err.message, traceContext);
                        logger.error(`corp ${data.corpID} change auth suite ${data.suiteID} success`, traceContext);
                    } else {
                        logger.error(`corp ${data.corpID} change auth suite ${data.suiteID} fail`, traceContext);
                    }
                });
            case "corp-create-auth":
                self._corpAuthSuiteService.authSuite(data.suiteID, data.authCode, traceContext, (err, isSuccess)=> {
                    if (err) {
                        logger.error(err.message, traceContext);
                        return;
                    }
                    if (isSuccess) {
                        logger.error(err.message, traceContext);
                        logger.error(`corp ${data.corpID} auth suite ${data.suiteID} success`, traceContext);
                    } else {
                        logger.error(`corp ${data.corpID} auth suite ${data.suiteID} fail`, traceContext);
                    }
                });
            case "suite-ticket-arrive":
                delete data.zipkinTrace;
                let suiteTicketData = data;
                self._suiteAccessTokenService.updateSuiteTicket(suiteTicketData, traceContext, (err, isSuccess)=> {
                    if (err) {
                        logger.error(err.message, traceContext);
                        return;
                    }
                    if (isSuccess) {
                        logger.error(err.message, traceContext);
                        logger.error(`corp ${data.corpID} auth suite ${data.suiteID} success`, traceContext);
                    } else {
                        logger.error(`corp ${data.corpID} auth suite ${data.suiteID} fail`, traceContext);
                    }
                });
            default:
                logger.error("unknow topic", traceContext);
        }
    });
};

Consumer.prototype.stopConsume = function (callback) {
    this._consumer.close(callback);
};

module.exports = Consumer;
