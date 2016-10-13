'use strict';

function SuiteAccessToken(suiteAccessTokenData) {
    this.suiteID = suiteAccessTokenData.suiteID;
    this.accessToken = suiteAccessTokenData.accessToken;
    this.expire = suiteAccessTokenData.expire
};

module.exports = SuiteAccessToken;