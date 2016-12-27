'use strict';
const KafkaMessageProducer = require("./kafkaMessageProducer");

let producer = null;
function createMessageProducer(single = true) {
    if (single && producer) {
        return producer;
    }
    producer = new KafkaMessageProducer();
    return producer;
};

module.exports = {
    createMessageProducer
};