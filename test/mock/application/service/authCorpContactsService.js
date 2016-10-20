'use strict';

function Service() {
};

Service.prototype.getUsers = function (corpID, suiteID, callback) {
    if (!corpID || !suiteID) {
        callback(null, null);
        return;
    }
    if (corpID == "corpID") {
        callback(null, [{
            corpID: "corpID",
            userID: "userID",
            userName: "userName"
        }]);
    } else {
        callback(null, null);
    }
};

module.exports = Service;