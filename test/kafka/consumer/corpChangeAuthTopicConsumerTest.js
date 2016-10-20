'use strict';
var kafka = require('kafka-node');
var _ = require('underscore');
var should = require('should');
var muk = require('muk');
var bearcat = require('bearcat');

describe('corpChangeAuthTopicConsumer use case test', function () {
    var consumer;
    var producer;
    var producerClient;
    before(function (done) {
        var contextPath = require.resolve('../../../unittest_kafka_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
            var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
            var Producer = kafka.Producer;
            producerClient = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
            producer = new Producer(producerClient);
            producer.on('ready', function () {
                producer.createTopics(['corp-change-auth'], true, (err, data)=> {
                    producerClient.refreshMetadata(['corp-change-auth'], ()=> {
                        done();
                    });
                });
            });
            producer.on('error', (err)=> {
                done(err);
            });
            consumer = bearcat.getBean('corpChangeAuthTopicConsumer');
        });
    });
    describe('#startConsume(callback)', function () {
        context('start consume corp-change-auth topic', function () {
            it('should call authCorpService.updateAuthCorpSuiteInfo methods when consumer this topic', function (done) {
                var mockAuthCorpService = {};
                mockAuthCorpService.updateAuthCorpSuiteInfo = ()=> {
                    done();
                };
                muk(consumer, "__AuthCorpService__", mockAuthCorpService);
                consumer.startConsume();
                var message = {
                    suiteID: "suiteID",
                    corpID: "corpID",
                    timestamp: 1403610513000
                };
                producer.send([{
                    topic: "corp-change-auth",
                    messages: [JSON.stringify(message)]
                }], ()=> {
                });
            });
        });
    });
    after(function (done) {
        consumer.stopConsume();
        producer.close();
        producerClient.close(()=> {
            done();
        });
    });
})
;