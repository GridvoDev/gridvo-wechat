'use strict';
const {Log4jsLogger} = require("gridvo-common-js");

const logger = new Log4jsLogger({
        serviceName: "wechat-server-interaction"
    });
module.exports = logger;