var _ = require('underscore');
var async = require('async');
var bearcat = require('bearcat');
var should = require('should');
var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var suiteAuthURLRouter = require('../../../../lib/express/routes/suite/suiteAuthURL.js');

describe('suiteAuthURLRouter use case test', function () {
    var app;
    var server;
    before(function (done) {
        async.waterfall([
            function (callback) {
                app = express();
                app.use('/suites', suiteAuthURLRouter);
                server = app.listen(3001, callback);
            },
            function (callback) {
                var bearcatContextPath = require.resolve("../../../../unittest_express_bcontext.json");
                bearcat.createApp([bearcatContextPath]);
                bearcat.start(function () {
                    app.set('bearcat', bearcat);
                    callback(null);
                });
            }
        ], function (err) {
            if (err) {
                done(err);
                return;
            }
            done();
        });
    });
    describe('#get:/suites/:suiteID/suite-auth-url', function () {
        context('get suite auth url', function () {
            it('should response suite auth url', function (done) {
                request(server)
                    .get(`/suites/suiteID/suite-auth-url`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.suite_auth_url.should.be.eql("suite-auth-url");
                        done();
                    });
            });
        });
    });
    after(function (done) {
        async.parallel([
            function (callback) {
                server.close(callback);
            }], function (err, results) {
            if (err) {
                done(err);
                return;
            }
            done();
        });
    });
});