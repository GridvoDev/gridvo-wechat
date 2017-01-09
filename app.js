'use strict';
const kafka = require('kafka-node');
const express = require('express');
const {expressZipkinMiddleware} = require("gridvo-common-js");
const {logger, tracer} = require('./lib/util');
const {suiteAuthURLRouter, userRouter} = require('./lib/express');
const {
    createSuiteAccessTokenService,
    createAuthCorpService,
    createAuthCorpContactsService,
    createCorpAuthSuiteService
} = require('./lib/application');
const {MessageConsumer} = require('./lib/kafka');

let app;
let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
let Producer = kafka.HighLevelProducer;
let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
let initProducer = new Producer(client);
initProducer.on('ready', function () {
    initProducer.createTopics(["corp-auth-smartgrid-suite",
        "corp-cancel-auth-smartgrid-suite",
        "suite-ticket-arrive",
        "corp-create-auth",
        "corp-change-auth",
        "corp-cancel-auth",
        "zipkin"], true, (err)=> {
        if (err) {
            logger.error(err.message);
            return;
        }
        client.refreshMetadata(["corp-auth-smartgrid-suite",
            "corp-cancel-auth-smartgrid-suite",
            "suite-ticket-arrive",
            "corp-create-auth",
            "corp-change-auth",
            "corp-cancel-auth",
            "zipkin"], ()=> {
            initProducer.close(()=> {
                logger.info("init kafka topics success");
                let messageConsumer = new MessageConsumer();
                messageConsumer.startConsume();
                logger.info("start consuming topics");
            });
        });
    });
});
initProducer.on('error', (err)=> {
    logger.error(err.message);
});
app = express();
app.use(expressZipkinMiddleware({
    tracer: tracer,
    serviceName: 'gridvo-wechat'
}));
app.use('/suites', suiteAuthURLRouter);
app.use('/auth-corps', userRouter);
let suiteAccessTokenService = createSuiteAccessTokenService();
app.set('suiteAccessTokenService', suiteAccessTokenService);
let authCorpService = createAuthCorpService();
app.set('authCorpService', authCorpService);
let authCorpContactsService = createAuthCorpContactsService();
app.set('authCorpContactsService', authCorpContactsService);
let corpAuthSuiteService = createCorpAuthSuiteService();
app.set('corpAuthSuiteService', corpAuthSuiteService);
app.listen(3001, (err)=> {
    if (err) {
        logger.error(err.message);
    }
    else {
        logger.info("express server is starting");
    }
});