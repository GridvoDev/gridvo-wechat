'use strict';
const HttpWechatThirdAPIServiceGateway = require("./httpWechatThirdAPIServiceGateway");
const HttpWechatQYAPIMenuServiceGateway = require("./httpWechatQYAPIMenuServiceGateway");
const HttpWechatQYAPIContactsServiceGateway = require("./httpWechatQYAPIContactsServiceGateway");
const HttpWechatQYAPIOAuthServiceGateway = require("./httpWechatQYAPIOAuthServiceGateway");

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

let httpWechatQYAPIOAuthServiceGateway = null;
function createWechatQYAPIOAuthServiceGateway(single = true) {
    if (single && httpWechatQYAPIOAuthServiceGateway) {
        return httpWechatQYAPIOAuthServiceGateway;
    }
    httpWechatQYAPIOAuthServiceGateway = new HttpWechatQYAPIOAuthServiceGateway();
    return httpWechatQYAPIOAuthServiceGateway;
};

module.exports = {
    createWechatThirdAPIServiceGateway,
    createWechatQYAPIMenuServiceGateway,
    createWechatQYAPIContactsServiceGateway,
    createWechatQYAPIOAuthServiceGateway
};