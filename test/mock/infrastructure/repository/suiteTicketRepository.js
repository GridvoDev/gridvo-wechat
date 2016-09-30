'use strict';
var SuiteTicket = require('../../../../lib/domain/suiteTicket');

function Repository() {
};

Repository.prototype.saveSuiteTicket = function (suiteTicket, callback) {
    callback(null, true);
};

Repository.prototype.getSuiteTicket = function (suiteID, callback) {
    callback(null, new SuiteTicket({
        suiteID: "suiteID",
        ticket: "Ticket"
    }));
};

module.exports = Repository;