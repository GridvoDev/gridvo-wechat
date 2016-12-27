'use strict';
const {SuiteTicket} = require('../../../../lib/domain');

class Repository {
    save(suiteTicket, traceContext, callback) {
        callback(null, true);
    }

    getSuiteTicketBySuiteID(suiteID, traceContext, callback) {
        callback(null, new SuiteTicket({
            suiteID: "suiteID",
            ticket: "Ticket"
        }));
    }
}

module.exports = Repository;