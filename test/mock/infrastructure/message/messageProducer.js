'use strict';

class MessageProducer {
    produceCorpAuthSmartgridSuiteMessage(message, traceContext, callback) {
        callback(null, {"test-topic": {}});
    }

    produceCorpCancelAuthSmartgridSuiteMessage(message, traceContext, callback) {
        callback(null, {"test-topic": {}});
    }

    close() {

    }
}

module.exports = MessageProducer;