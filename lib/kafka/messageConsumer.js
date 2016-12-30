'use strict';
const {kafkaZipkinMessageConsumer, kafkaWithZipkinTraceContextFeach} = require('gridvo-common-js');
const {tracer} = require('../util');
const {
    createSuiteAccessTokenService,
    createAuthCorpService,
    createCorpAuthSuiteService
} = require('../application');

function Consumer() {
    this._consumer = new kafkaZipkinMessageConsumer({tracer, serviceName: "gridvo-wechat"});
    this._corpAuthSuiteService = createSuiteAccessTokenService();
    this._authCorpService = createAuthCorpService();
    this._suiteAccessTokenService = createCorpAuthSuiteService();
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
                        logger.error(`${data.suiteID} suite cancel auth success`, traceContext);
                    } else {
                        logger.error(`${data.suiteID} suite cancel auth fail`, traceContext);
                    }
                });
        }
    });
};

Consumer.prototype.stopConsume = function (callback) {
    this._consumer.close(callback);
};

module.exports = Consumer;
