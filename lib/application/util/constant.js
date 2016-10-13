'use strict';

var smartStationSuite = "tj75d1122acf5ed4aa";
var constant = {};
constant.corpID = "wx9b41eed392c6d447";
constant.token = "GuEccJzML5RxVB8fLhhzRPBda5aJNw5J";
constant.encodingAESKey = "FWj4LPoWHVbHglyHnxC4gifhjFfOn89hfYXMH3Y7N9b";
constant.qyapiPrefix = "https://qyapi.weixin.qq.com/cgi-bin/";
constant[smartStationSuite] = {};
constant[smartStationSuite].suiteID = "tj75d1122acf5ed4aa";
constant[smartStationSuite].suiteSecret = "YpLfaMsOAR0e0TKSSjQRNfgIMd-bHew9kyNMqHghaHcF9HOdHBGXNs7CNbOiPER1";
var waterStationApp = "1";
constant[smartStationSuite][waterStationApp] = {};
constant[smartStationSuite][waterStationApp].appContent = {};
constant[smartStationSuite][waterStationApp].appContent.menu = {
    "button": [
        {
            "type": "view",
            "name": "主控台",
            "url": "http://pascal.gridvo.com/wechat/ui//smart-station-suite/water"
        },
        {
            "type": "view",
            "name": "气象云图",
            "url": "http://pascal.gridvo.com"
        },
        {
            "name": "班组管理",
            "sub_button": [
                {
                    "type": "view",
                    "name": "运行日志",
                    "url": "http://pascal.gridvo.com"
                },
                {
                    "type": "view",
                    "name": "交接管理",
                    "url": "http://pascal.gridvo.com"
                }
            ]
        }
    ]
};
module.exports = constant;