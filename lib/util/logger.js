'use strict';
const {Log4jsLogger} = require("gridvo-common-js");

const logger = new Log4jsLogger({
        serviceName: "gridvo-wechat"
    });
module.exports = logger;