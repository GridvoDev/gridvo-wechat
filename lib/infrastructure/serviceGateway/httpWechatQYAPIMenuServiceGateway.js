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

    createMenu(authCorpSuiteAccessToken, agentID, menuData, traceContext, callback) {
        var url = `https://${WECHAT_QYAPI_SERVICE_HOST}/cgi-bin/menu/create?access_token=${authCorpSuiteAccessToken}&agentid=${agentID}`;
        var options = {
            method: "POST",
            path: url,
            entity: menuData
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