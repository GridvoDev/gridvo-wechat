'use strict';
const {KafkaZipkinMessageProducer} = require('gridvo-common-js');
const {tracer} = require('../../../lib/util');

class MessageProducer {
    constructor() {
        this._producer = new KafkaZipkinMessageProducer({
            tracer,
            serviceName: "gridvo-wechat"
        });
    }

    produceCorpAuthSmartgridSuiteMessage(message, traceContext, callback) {
        this._producer.produceMessage("corp-auth-smartgrid-suite", message, traceContext, callback);
    }

    produceCorpCancelAuthSmartgridSuiteMessage(message, traceContext, callback) {
        this._producer.produceMessage("corp-cancel-auth-smartgrid-suite", message, traceContext, callback);
    }

    close() {
        return this._producer.close();
    }
}

module.exports = MessageProducer;