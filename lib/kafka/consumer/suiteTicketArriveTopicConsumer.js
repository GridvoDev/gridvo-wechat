'use strict';
var kafka = require('kafka-node');

function Consumer() {
    this.suiteAccessTokenService = null;
};

Consumer.prototype.startConsume = function () {
    var KConsumer = kafka.Consumer;
    var client = new kafka.Client(`${process.env.ZOOKEEPER_SERVICE_HOST}:${process.env.ZOOKEEPER_SERVICE_PORT}`);
    var topics = [{
        topic: "suite-ticket-arrive"
    }];
    var options = {
        groupId: "suite-access-token-manage-group"
    };
    var consumer = new KConsumer(client, topics, options);
    this.consumer = consumer;
    var self = this;
    consumer.on('message', function (message) {
        var suiteTicketData = message.value;
        self.suiteAccessTokenService.updateSuiteTicket(suiteTicketData, function (err, suiteTicket) {
            if (err) {
                console.log(err);
                return;
            }
            if (suiteTicket) {
                console.log(`${suiteTicket.dateTime}:${suiteTicket.suiteID} suite ticket update success`);
            } else {
                console.log(`suite ticket update fail`);
            }
        });
    });
};

Consumer.prototype.stopConsume = function () {
    if (this.consumer) {
        this.consumer.close(()=> {
            console.log(`stop consume suite ticket arrive topic`);
        });
    }
};

module.exports = Consumer;
