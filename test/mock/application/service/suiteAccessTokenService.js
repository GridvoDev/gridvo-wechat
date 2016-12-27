'use strict';

class Service {
    updateSuiteTicket(suiteTicketData, traceContext, callback) {
        if (!suiteTicketData.suiteID || !suiteTicketData.ticket) {
            callback(null, false);
            return;
        }
        callback(null, true);
    }

    getLatestSuiteAccessToken(suiteID, traceContext, callback) {
        callback(null, "suiteAccessToken");
    }

}

module.exports = Service;