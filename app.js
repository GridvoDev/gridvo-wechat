'use strict';
var bearcat = require('bearcat');
var kafka = require('kafka-node');
var express = require('express');
var userRouter = require('./lib/express/routes/authCorp/user');
var suiteAuthURLRouter = require('./lib/express/routes/suite/suiteAuthURL');

var app;
var bearcatContextPath = require.resolve("./production_bcontext.json");
bearcat.createApp([bearcatContextPath]);
bearcat.start(function () {
    var ZOOKEEPER_SERVICE_HOST = process.env.ZOOKEEPER_SERVICE_HOST ? process.env.ZOOKEEPER_SERVICE_HOST : "127.0.0.1";
    var ZOOKEEPER_SERVICE_PORT = process.env.ZOOKEEPER_SERVICE_PORT ? process.env.ZOOKEEPER_SERVICE_PORT : "2181";
    var Producer = kafka.Producer;
    var client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
    var initProducer = new Producer(client);
    initProducer.on('ready', function () {
        initProducer.createTopics(["corp-auth-smartgrid-suite",
            "corp-cancel-auth-smartgrid-suite",
            "suite-ticket-arrive",
            "corp-create-auth",
            "corp-change-auth",
            "corp-cancel-auth"], true, (err)=> {
            if (err) {
                console.log(err);
                return;
            }
            client.refreshMetadata(["corp-auth-smartgrid-suite", "corp-cancel-auth-smartgrid-suite"], ()=> {
                initProducer.close(()=> {
                    console.log("gridvo-wechat service init topics success");
                });
            });
            bearcat.getBean('suiteTicketArriveTopicConsumer').startConsume();
            bearcat.getBean('corpCreateAuthTopicConsumer').startConsume();
            bearcat.getBean('corpChangeAuthTopicConsumer').startConsume();
            bearcat.getBean('corpCancelAuthTopicConsumer').startConsume();
        });
    });
    initProducer.on('error', (err)=> {
        console.log(err);
    });
    app = express();
    app.use('/auth-corps', userRouter);
    app.use('/suites', suiteAuthURLRouter);
    app.set('bearcat', bearcat);
    app.listen(3001);
    console.log("gridvo-wechat service is starting...");
});