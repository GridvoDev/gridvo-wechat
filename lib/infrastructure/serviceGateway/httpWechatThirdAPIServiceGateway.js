'use strict';
const rest = require('rest');
const mime = require('rest/interceptor/mime');
const {restZipkinInterceptor} = require('gridvo-common-js');
const {tracer} = require('../../../lib/util');

const {WECHAT_QYAPI_SERVICE_HOST = "qyapi.weixin.qq.com"} = process.env;
class Gateway {
    constructor() {
        this._httpRequest = rest;
    }

    getSuiteAccessToken(suiteID, suiteSecret, suiteTicket, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/service/get_suite_token`;
        var options = {
            method: "POST",
            path: url,
            entity: {
                suite_id: suiteID,
                suite_secret: suiteSecret,
                suite_ticket: suiteTicket
            }
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime, {mime: 'application/json'});
        request(options).then(response=> {
            if (response && response.entity && response.entity.suite_access_token) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err=> {
            callback(err);
        });
    }

    getAuthInfo(corpID, suiteID, permanentCode, suiteAccessToken, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/service/get_auth_info?suite_access_token=${suiteAccessToken}`;
        var options = {
            method: "POST",
            path: url,
            entity: {
                suite_id: suiteID,
                auth_corpid: corpID,
                permanent_code: permanentCode
            }
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime, {mime: 'application/json'});
        request(options).then(response=> {
            if (response && response.entity && response.entity.auth_info) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err=> {
            callback(err);
        });
    }

    getCorpToken(corpID, suiteID, permanentCode, suiteAccessToken, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/service/get_corp_token?suite_access_token=${suiteAccessToken}`;
        var options = {
            method: "POST",
            path: url,
            entity: {
                suite_id: suiteID,
                auth_corpid: corpID,
                permanent_code: permanentCode
            }
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime, {mime: 'application/json'});
        request(options).then(response=> {
            if (response && response.entity && response.entity.access_token) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err=> {
            callback(err);
        });
    }

    getPreAuthCode(suiteID, suiteAccessToken, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/service/get_pre_auth_code?suite_access_token=${suiteAccessToken}`;
        var options = {
            method: "POST",
            path: url,
            entity: {
                suite_id: suiteID
            }
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime, {mime: 'application/json'});
        request(options).then(response=> {
            if (response && response.entity && response.entity.pre_auth_code) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err=> {
            callback(err);
        });
    }

    getPermanentCode(suiteID, authCode, suiteAccessToken, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/service/get_permanent_code?suite_access_token=${suiteAccessToken}`;
        var options = {
            method: "POST",
            path: url,
            entity: {
                suite_id: suiteID,
                auth_code: authCode
            }
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime, {mime: 'application/json'});
        request(options).then(response=> {
            if (response && response.entity) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Gateway;