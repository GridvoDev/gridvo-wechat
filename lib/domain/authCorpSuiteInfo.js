'use strict';

function AuthCorpSuiteInfo(authCorpSuiteInfoData) {
    this.corpID = authCorpSuiteInfoData.corpID;
    this.suiteID = authCorpSuiteInfoData.suiteID;
    this.permanentCode = authCorpSuiteInfoData.permanentCode;
    this.accessToken = authCorpSuiteInfoData.accessToken;
    this.accessTokenExpires = authCorpSuiteInfoData.accessTokenExpires;
    this.agents = authCorpSuiteInfoData.agents ? authCorpSuiteInfoData.agents : {};
};

module.exports = AuthCorpSuiteInfo;