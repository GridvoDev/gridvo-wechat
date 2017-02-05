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

    getUserInfo(authCorpSuiteAccessToken, code, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/user/getuserinfo?access_token=${authCorpSuiteAccessToken}&code=${code}`;
        var options = {
            method: "GET",
            path: url
        };
        let request = this._httpRequest.wrap(restZipkinInterceptor, {
            tracer,
            traceContext,
            serviceName: 'gridvo-wechat',
            remoteServiceName: 'wechat-qyapi'
        }).wrap(mime);
        request(options).then(response => {
            if (response && response.entity) {
                callback(null, response.entity);
            }
            else {
                callback(null, null);
            }
        }).catch(err => {
            callback(err);
        });
    }

}

module.exports = Gateway;