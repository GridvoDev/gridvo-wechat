'use strict';

function Service() {
};

Service.prototype.updateSuiteTicket = function (suiteTicketData, callback) {
    if (!suiteTicketData.suiteID || !suiteTicketData.ticket) {
        callback(null, false);
        return;
    }
    callback(null, true);
};

module.exports = Service;