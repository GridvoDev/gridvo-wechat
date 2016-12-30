'use strict';

class Service {
    getUsers(corpID, suiteID, traceContext, callback) {
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
    }
}

module.exports = Service;