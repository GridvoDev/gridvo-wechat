'use strict';

class SuiteTicket {
    constructor({suiteID, ticket, dateTime}) {
        this._suiteID = suiteID;
        this._ticket = ticket;
        this._dateTime = dateTime;
    }

    get suiteID() {
        return this._suiteID;
    }

    get ticket() {
        return this._ticket;
    }

    get dateTime() {
        return this._dateTime;
    }
}

module.exports = SuiteTicket;
