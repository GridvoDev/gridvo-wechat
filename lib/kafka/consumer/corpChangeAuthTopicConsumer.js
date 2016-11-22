'use strict';
var kafka = require('kafka-node');

function Consumer() {
    this.__AuthCorpService__ = null;
};

Consumer.prototype.startConsume = function () {
    var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
    var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
    var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
    var topics = [{
        topic: "corp-change-auth"
    }];
    var options = {
        groupId: "corp-auth-suite-manage-group"
    };
    var consumer = new kafka.Consumer(client, topics, options);
    this.consumer = consumer;
    var self = this;
    consumer.on('message', function (message) {
        var data = message.value;
        self.__AuthCorpService__.updateAuthCorpSuiteInfo(data.corpID, data.suiteID, (err, isSuccess)=> {
            if (err) {
                console.log(err);
                return;
            }
            if (isSuccess) {
                console.log(`${new Date()}:${data.suiteID} suite change auth success`);
            } else {
                console.log(`${new Date()}:${data.suiteID} suite change auth fail`);
            }
        });
    });
};

Consumer.prototype.stopConsume = function () {
    if (this.consumer) {
        this.consumer.close(true, ()=> {
            console.log(`stop consume suite ticket arrive topic`);
        });
    }
};

module.exports = Consumer;
