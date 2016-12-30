'use strict';
const rest = require('rest');
const mime = require('rest/interceptor/mime');
const {restZipkinInterceptor} = require('gridvo-common-js');
const {tracer} = require('../../../lib/util');

const {WECHAT_QYAPI_SERVICE_HOST = "qyapi.weixin.qq.com", WECHAT_QYAPI_SERVICE_PORT = "80"} = process.env;
class Gateway {
    constructor() {
        this._httpRequest = rest;
    }

    listUsers(authCorpSuiteAccessToken, departmentID, fetchChild = 1, status = 1, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}:${WECHAT_QYAPI_SERVICE_PORT}/cgi-bin/user/list?access_token=${authCorpSuiteAccessToken}&department_id=${departmentID}&fetch_child=${fetchChild}&status=${status}`;
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