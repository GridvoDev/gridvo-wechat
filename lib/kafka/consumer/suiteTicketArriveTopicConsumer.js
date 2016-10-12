'use strict';
var kafka = require('kafka-node');

function Consumer() {
    this.__suiteAccessTokenService__ = null;
};

Consumer.prototype.startConsume = function () {
    var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
    var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
    var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
    var topics = [{
        topic: "suite-ticket-arrive"
    }];
    var options = {
        groupId: "suite-access-token-manage-group"
    };
    var consumer = new kafka.Consumer(client, topics, options);
    this.consumer = consumer;
    var self = this;
    consumer.on('message', function (message) {
        var suiteTicketData = message.value;
        self.__suiteAccessTokenService__.updateSuiteTicket(suiteTicketData, (err, isSuccess)=> {
            if (err) {
                console.log(err);
                return;
            }
            if (isSuccess) {
                console.log(`${new Date()}:${suiteTicketData.suiteID} suite ticket update success`);
            } else {
                console.log(`${new Date()}:${suiteTicketData.suiteID} suite ticket update fail`);
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
