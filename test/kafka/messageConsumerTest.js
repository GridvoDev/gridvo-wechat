'use strict';
const kafka = require('kafka-node');
const _ = require('underscore');
const co = require('co');
const should = require('should');
const muk = require('muk');
const MessageConsumer = require('../../lib/kafka/messageConsumer');

describe('KafkaZipkinMessageConsumer(options) use case test', ()=> {
    let messageConsumer;
    let client
    let producer;
    before(done=> {
        function setupKafka() {
            return new Promise((resolve, reject)=> {
                let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                client = new kafka.Client(
                    `${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`,
                    "test-consumer-client");
                producer = new kafka.Producer(client);
                producer.on('ready', ()=> {
                    producer.createTopics(["corp-cancel-auth",
                        "corp-change-auth",
                        "corp-create-auth",
                        "suite-ticket-arrive"], true, (err, data)=> {
                        if (err) {
                            reject(err)
                        }
                        client.refreshMetadata(["corp-cancel-auth",
                            "corp-change-auth",
                            "corp-create-auth",
                            "suite-ticket-arrive"], (err)=> {
                            if (err) {
                                reject(err)
                            }
                            let message = {
                                corpID: "wxf8b4f85f3a794e77",
                                timestamp: 1403610513000,
                                zipkinTrace: {
                                    traceID: "aaa",
                                    parentID: "bbb",
                                    spanID: "ccc",
                                    flags: 1,
                                    step: 3
                                }
                            };
                            producer.send([{
                                topic: "corp-cancel-auth",
                                messages: [JSON.stringify(message)]
                            }], (err)=> {
                                if (err) {
                                    reject(err)
                                }
                                resolve();
                            });
                        });
                    });
                });
                producer.on('error', (err)=> {
                    reject(err);
                });
            });
        };
        function* setup() {
            yield setupKafka();
        };
        co(setup).then(()=> {
            messageConsumer = new MessageConsumer();
            done();
        }).catch(err=> {
            done(err);
        });
    });
    describe('#startConsume(callback)', ()=> {
        context('start consume message', ()=> {
            it('should call corpAuthSuiteService.cancelAuthSuite methods when consumer this topic', done=> {
                var mockCorpAuthSuiteService = {};
                mockCorpAuthSuiteService.cancelAuthSuite = ()=> {
                    done();
                };
                muk(messageConsumer, "_corpAuthSuiteService", mockCorpAuthSuiteService);
                messageConsumer.startConsume();
            });
            after(done=> {
                producer.close();
                client.close(()=> {
                    done();
                });
            });
        });
    });
    after(done=> {
        messageConsumer.stopConsume(()=> {
            done();
        });
    });
});