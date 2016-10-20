'use strict';

function Producer() {
};
Producer.prototype.produceMessage = function (message, callback) {
    callback(null, true);
};

module.exports = Producer;