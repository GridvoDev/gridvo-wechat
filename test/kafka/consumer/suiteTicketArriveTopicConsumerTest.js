'use strict';
var kafka = require('kafka-node');
var _ = require('underscore');
var should = require('should');
var muk = require('muk');
var SuiteTicketArriveTopicConsumer = require('../../../lib/kafka/consumer/suiteTicketArriveTopicConsumer');

describe('suite ticket arrive topic consumer use case test', function () {
    var consumer;
    var producer;
    var producerClient;
    before(function (done) {
        if (!process.env.IS_CI) {
            process.env.ZOOKEEPER_SERVICE_HOST = "127.0.0.1";
            process.env.ZOOKEEPER_SERVICE_PORT = "2181";
        }
        var Producer = kafka.Producer;
        producerClient = new kafka.Client(`${process.env.ZOOKEEPER_SERVICE_HOST}:${process.env.ZOOKEEPER_SERVICE_PORT}`);
        var argv = {
            topic: "/suite-ticket/arrive"
        };
        var topic = argv.topic || 'topic1';
        var p = argv.p || 0;
        var a = argv.a || 0;
        producer = new Producer(producerClient, {requireAcks: 1});
        producer.on('ready', function () {
            var args = {
                suiteID: "suiteID",
                ticket: "ticket",
                dateTime: new Date()
            };
            producer.send([{
                topic: topic,
                messages: [JSON.stringify(args)]
            }], function (err, result) {
                done();
            });
        });
        producer.on('error', (err)=> {
            done(err);
        });
    });
    describe('#startConsume()', function () {
        context('start consume /suite-ticket/arrive topic', function () {
            it('should call suiteAccessTokenService.updateSuiteTicket methods when consumer this topic', function () {
                var KConsumer = kafka.Consumer;
                var client = new kafka.Client(`${process.env.ZOOKEEPER_SERVICE_HOST}:${process.env.ZOOKEEPER_SERVICE_PORT}`);
                var topics = [{
                    topic: "/suite-ticket/arrive",
                    partition: 0,
                    offset: 8000
                }];
                var options = {
                    groupId: "suite-access-token-manage-group"
                };
                var consumer = new KConsumer(client, topics, options);
                var self = this;
                consumer.on('message', function (message) {
                    console.log(message);
                });
            });
        });
    });
    after(function (done) {

        if (!process.env.IS_CI) {
            delete process.env.ZOOKEEPER_SERVICE_HOST;
            delete process.env.ZOOKEEPER_SERVICE_PORT;
        }
        producerClient.close(()=> {
            done();
        });
    });
})
;