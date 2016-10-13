'use strict';

var errCodeTable = {
    "ERR": {
        errCode: 500,
        errMsg: "server internal error, please try again later."
    },
    "FAIL": {
        errCode: 400,
        errMsg: "fail"
    },

    "OK": {
        errCode: 200,
        errMsg: "ok"
    }
};

module.exports = errCodeTable;