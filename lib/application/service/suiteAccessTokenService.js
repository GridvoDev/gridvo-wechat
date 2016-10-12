'use strict';
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events');
var SuiteTicket = require('../../domain/suiteTicket');

function Service() {
    EventEmitter.call(this);
    this.__suiteTicketRepository__ = null;
};

util.inherits(Service, EventEmitter);

Service.prototype.updateSuiteTicket = function (suiteTicketData, callback) {
    if (!suiteTicketData.suiteID || !suiteTicketData.ticket) {
        callback(null, false);
        return;
    }
    var suiteTicket = new SuiteTicket(suiteTicketData);
    this.__suiteTicketRepository__.saveSuiteTicket(suiteTicket, function (err, isSuccess) {
        if (err) {
            callback(err, false);
            return;
        }
        callback(null, isSuccess);
    });
};

module.exports = Service;