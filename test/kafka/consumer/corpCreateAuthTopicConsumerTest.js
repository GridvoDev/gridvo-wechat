'use strict';
var kafka = require('kafka-node');
var _ = require('underscore');
var should = require('should');
var muk = require('muk');
var bearcat = require('bearcat');

describe('corpCreateAuthTopicConsumer use case test', function () {
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
                producer.createTopics(['corp-create-auth'], true, (err, data)=> {
                    producerClient.refreshMetadata(['corp-create-auth'], ()=> {
                        done();
                    });
                });
            });
            producer.on('error', (err)=> {
                done(err);
            });
            consumer = bearcat.getBean('corpCreateAuthTopicConsumer');
        });
    });
    describe('#startConsume(callback)', function () {
        context('start consume corp-create-auth topic', function () {
            it('should call corpAuthSuiteService.authSuite methods when consumer this topic', function (done) {
                var mockCorpAuthSuiteService = {};
                mockCorpAuthSuiteService.authSuite = ()=> {
                    done();
                };
                muk(consumer, "__CorpAuthSuiteService__", mockCorpAuthSuiteService);
                consumer.startConsume();
                var message = {
                    suiteID: "suiteID",
                    authCode: "authCode",
                    timestamp: 1403610513000
                };
                producer.send([{
                    topic: "corp-create-auth",
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