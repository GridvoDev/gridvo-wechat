'use strict';
const suiteAuthURLRouter = require('./suite/suiteAuthURL');
const oAuthRouter = require('./suite/oAuth');
const userRouter = require('./authCorp/user');

module.exports = {
    suiteAuthURLRouter,
    oAuthRouter,
    userRouter
};