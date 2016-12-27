'use strict';

class AuthCorpSuiteInfo {
    constructor({corpID, suiteID, permanentCode, accessToken, accessTokenExpires, agents}) {
        this._corpID = corpID;
        this._suiteID = suiteID;
        this._permanentCode = permanentCode;
        this._accessToken = accessToken;
        this._accessTokenExpires = accessTokenExpires;
        this._agents = agents;
    }

    get corpID() {
        return this._corpID;
    }

    get suiteID() {
        return this._suiteID;
    }

    get permanentCode() {
        return this._permanentCode;
    }

    set accessToken(accessToken) {
        return this._accessToken = accessToken;
    }

    get accessToken() {
        return this._accessToken;
    }

    set accessTokenExpires(accessTokenExpires) {
        return this._accessTokenExpires = accessTokenExpires;
    }

    get accessTokenExpires() {
        return this._accessTokenExpires;
    }

    set agents(agents) {
        return this._agents = agents;
    }

    get agents() {
        return this._agents;
    }

}

module.exports = AuthCorpSuiteInfo;