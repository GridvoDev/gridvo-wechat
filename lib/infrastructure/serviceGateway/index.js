'use strict';
const HttpWechatThirdAPIServiceGateway = require("./httpWechatThirdAPIServiceGateway");

let wechatThirdAPIServiceGateway = null;
function createWechatThirdAPIServiceGateway(single = true) {
    if (single && wechatThirdAPIServiceGateway) {
        return wechatThirdAPIServiceGateway;
    }
    wechatThirdAPIServiceGateway = new HttpWechatThirdAPIServiceGateway();
    return wechatThirdAPIServiceGateway;
};

module.exports = {
    createWechatThirdAPIServiceGateway
};