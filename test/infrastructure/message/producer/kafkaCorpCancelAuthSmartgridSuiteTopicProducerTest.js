'use strict';
var kafka = require('kafka-node');
var _ = require('underscore');
var should = require('should');
var muk = require('muk');
var kafkaCorpCancelAuthSmartgridSuiteTopicProducer = require('../../../../lib/infrastructure/message/producer/kafkaCorpCancelAuthSmartgridSuiteTopicProducer');

describe('kafkaCorpCancelAuthSmartgridSuiteTopicProducer use case test', function () {
    var producer;
    var consumer;
    before(function (done) {
        var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
        var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
        var Producer = kafka.Producer;
        var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
        var initProducer = new Producer(client);
        initProducer.on('ready', function () {
            initProducer.createTopics(['corp-cancel-auth-smartgrid-suite'], true, (err, data)=> {
                client.refreshMetadata(['corp-cancel-auth-smartgrid-suite'], ()=> {
                    producer = new kafkaCorpCancelAuthSmartgridSuiteTopicProducer();
                    initProducer.close(()=> {
                        done();
                    });
                });
            });
        });
        initProducer.on('error', (err)=> {
            done(err);
        });
    });
    describe('#produceMessage(message, callback)', function () {
        context('produce corp-cancel-auth-smartgrid-suite topic message', function () {
            it('should return true if message is send success', function (done) {
                var message = {
                    corpID: "corpID",
                    timestamp: 1403610513000
                };
                producer.produceMessage(message, (err, isSuccess)=> {
                    isSuccess.should.be.eql(true);
                    var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
                    var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
                    var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
                    var topics = [{
                        topic: "corp-cancel-auth-smartgrid-suite"
                    }];
                    var options = {
                        groupId: "corp-auth-manage-group"
                    };
                    consumer = new kafka.Consumer(client, topics, options);
                    consumer.on('message', function (message) {
                        var data = JSON.parse(message.value);
                        data.corpID.should.be.eql("corpID");
                        data.timestamp.should.be.eql(1403610513000);
                        done();
                    });
                });
            });
        });
    });
    after(function () {
        consumer.close(true, ()=> {
        });
    });
});