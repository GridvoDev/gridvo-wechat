'use strict';

function SuiteTicket(suiteTicketData) {
    this.suiteID = suiteTicketData.suiteID;
    this.ticket = suiteTicketData.ticket;
    this.dateTime = suiteTicketData.dateTime;
};

module.exports = SuiteTicket;
