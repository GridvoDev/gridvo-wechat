'use strict';
const HttpWechatThirdAPIServiceGateway = require("./httpWechatThirdAPIServiceGateway");
const HttpWechatQYAPIMenuServiceGateway = require("./httpWechatQYAPIMenuServiceGateway");
const HttpWechatQYAPIContactsServiceGateway = require("./httpWechatQYAPIContactsServiceGateway");

let wechatThirdAPIServiceGateway = null;
function createWechatThirdAPIServiceGateway(single = true) {
    if (single && wechatThirdAPIServiceGateway) {
        return wechatThirdAPIServiceGateway;
    }
    wechatThirdAPIServiceGateway = new HttpWechatThirdAPIServiceGateway();
    return wechatThirdAPIServiceGateway;
};

let wechatQYAPIMenuServiceGateway = null;
function createWechatQYAPIMenuServiceGateway(single = true) {
    if (single && wechatQYAPIMenuServiceGateway) {
        return wechatQYAPIMenuServiceGateway;
    }
    wechatQYAPIMenuServiceGateway = new HttpWechatQYAPIMenuServiceGateway();
    return wechatQYAPIMenuServiceGateway;
};

let wechatQYAPIContactsServiceGateway = null;
function createWechatQYAPIContactsServiceGateway(single = true) {
    if (single && wechatQYAPIContactsServiceGateway) {
        return wechatQYAPIContactsServiceGateway;
    }
    wechatQYAPIContactsServiceGateway = new HttpWechatQYAPIContactsServiceGateway();
    return wechatQYAPIContactsServiceGateway;
};

module.exports = {
    createWechatThirdAPIServiceGateway,
    createWechatQYAPIMenuServiceGateway,
    createWechatQYAPIContactsServiceGateway
};