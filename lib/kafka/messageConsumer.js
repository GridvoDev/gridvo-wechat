'use strict';
const {KafkaZipkinMessageConsumer, kafkaWithZipkinTraceContextFeach} = require('gridvo-common-js');
const {tracer} = require('../util');
const {
    createSuiteAccessTokenService,
    createAuthCorpService,
    createCorpAuthSuiteService
} = require('../application');
const {logger} = require('../util');

class Consumer {
    constructor(serviceName = "gridvo-wechat") {
        this._consumer = new KafkaZipkinMessageConsumer({tracer, serviceName});
        this._corpAuthSuiteService = createCorpAuthSuiteService();
        this._authCorpService = createAuthCorpService();
        this._suiteAccessTokenService = createSuiteAccessTokenService();
    }

    startConsume() {
        let topics = [{
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
            if (err) {
                logger.error(err.message);
                return;
            }
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
                            logger.info(`corp ${data.corpID} cancel auth suite ${data.suiteID} success`, traceContext);
                        } else {
                            logger.error(`corp ${data.corpID} cancel auth suite ${data.suiteID} fail`, traceContext);
                        }
                    });
                    return;
                case "corp-change-auth":
                    self._authCorpService.updateAuthCorpSuiteInfo(data.corpID, data.suiteID, traceContext, (err, isSuccess)=> {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`corp ${data.corpID} change auth suite ${data.suiteID} success`, traceContext);
                        } else {
                            logger.error(`corp ${data.corpID} change auth suite ${data.suiteID} fail`, traceContext);
                        }
                    });
                    return;
                case "corp-create-auth":
                    self._corpAuthSuiteService.authSuite(data.suiteID, data.authCode, traceContext, (err, isSuccess)=> {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`corp ${data.corpID} auth suite ${data.suiteID} success`, traceContext);
                        } else {
                            logger.error(`corp ${data.corpID} auth suite ${data.suiteID} fail`, traceContext);
                        }
                    });
                    return;
                case "suite-ticket-arrive":
                    delete data.zipkinTrace;
                    let suiteTicketData = data;
                    self._suiteAccessTokenService.updateSuiteTicket(suiteTicketData, traceContext, (err, isSuccess)=> {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`update suite ticket success`, traceContext);
                        } else {
                            logger.error(`update suite ticket success fail`, traceContext);
                        }
                    });
                    return;
                default:
                    logger.error(`unknow topic "${message.topic}"`, traceContext);
                    return;
            }
        });
    }

    stopConsume(callback) {
        this._consumer.close(callback);
    }
}

module.exports = Consumer;
