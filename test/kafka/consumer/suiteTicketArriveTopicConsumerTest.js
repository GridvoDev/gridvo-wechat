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
        producer = new Producer(producerClient);
        producer.on('ready', function () {
            producer.createTopics(['suite-ticket-arrive'], true, (err, data)=> {
                producerClient.refreshMetadata(['suite-ticket-arrive'], ()=> {
                    done();
                });
            });
        });
        producer.on('error', (err)=> {
            done(err);
        });
        consumer = new SuiteTicketArriveTopicConsumer();
    });
    describe('#startConsume()', function () {
        context('start consume suite-ticket-arrive topic', function () {
            it('should call suiteAccessTokenService.updateSuiteTicket methods when consumer this topic', function (done) {
                var mockSuiteAccessTokenService = {};
                mockSuiteAccessTokenService.updateSuiteTicket = ()=> {
                    done();
                };
                muk(consumer, "suiteAccessTokenService", mockSuiteAccessTokenService);
                consumer.startConsume();
                var suiteTicketData = {
                    suiteID: "suiteID",
                    ticket: "ticket",
                    dateTime: new Date()
                };
                producer.send([{
                    topic: "suite-ticket-arrive",
                    messages: [JSON.stringify(suiteTicketData)]
                }], ()=> {
                });
            });
        });
    });
    after(function (done) {
        if (!process.env.IS_CI) {
            delete process.env.ZOOKEEPER_SERVICE_HOST;
            delete process.env.ZOOKEEPER_SERVICE_PORT;
        }
        consumer.stopConsume();
        producer.close();
        producerClient.close(()=> {
            done();
        });
    });
})
;