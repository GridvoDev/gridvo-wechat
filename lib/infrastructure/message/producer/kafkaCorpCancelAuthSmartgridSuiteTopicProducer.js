'use strict';
var kafka = require('kafka-node');

function Producer() {
};
Producer.prototype.produceMessage = function (message, callback) {
    var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
    var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
    var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
    var producer = new kafka.Producer(client);
    producer.on('ready', ()=> {
        var payloads = [{
            topic: "corp-cancel-auth-smartgrid-suite",
            messages: [JSON.stringify(message)]
        }];
        producer.send(payloads, (err, data)=> {
            if (err) {
                callback(err);
                return;
            }
            callback(null, true);
            client.close(()=> {
                console.log("closes the connection to zookeeper and the brokers");
                producer.close();
                console.log("closes the corp-cancel-auth-smartgrid-suite topic producer");
            })
        });
    });
    producer.on('error', (err)=> {
        console.log(err);
        client.close(()=> {
            console.log("closes the connection to zookeeper and the brokers");
            callback(err);
        })
    });
};

module.exports = Producer;