'use strict';

class SuiteAccessToken {
    constructor({suiteID, accessToken, expires}) {
        this._suiteID = suiteID;
        this._accessToken = accessToken;
        this._expires = expires;
    }

    get suiteID() {
        return this._suiteID;
    }

    get accessToken() {
        return this._accessToken;
    }

    get expires() {
        return this._expires;
    }

}

module.exports = SuiteAccessToken;