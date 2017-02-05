const _ = require('underscore');
const co = require('co');
const should = require('should');
const request = require('supertest');
const express = require('express');
const oAuthRouter = require('../../../../lib/express/routes/suite/oAuth.js');
const {expressZipkinMiddleware, createZipkinTracer} = require("gridvo-common-js");

describe('oAuthRouter use case test', () => {
    let app;
    let server;
    before(done => {
        function setupExpress() {
            return new Promise((resolve, reject) => {
                app = express();
                app.use(expressZipkinMiddleware({
                    tracer: createZipkinTracer({}),
                    serviceName: 'test-service'
                }));
                app.use('/suites', oAuthRouter);
                let mockOAuthService = {};
                mockOAuthService.auth = (corpID, suiteID, code, traceContext, callback) => {
                    if (code == "code") {
                        callback(null, {
                            userID: "wechat-user-id"
                        });
                    }
                    else {
                        callback(null, null)
                    }
                };
                app.set('oAuthService', mockOAuthService);
                server = app.listen(3001, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };
        function* setup() {
            yield setupExpress();
        };
        co(setup).then(() => {
            done();
        }).catch(err => {
            done(err);
        });
    });
    describe('#get:/suites/:suiteID/:corpID/corp-users?code=CODE', () => {
        context('wechat oauth ', () => {
            it('response fail if oAuthService.auth return null', done => {
                request(server)
                    .get(`/suites/suiteID/corpID/corp-users?code=failCode`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(400);
                        done();
                    });
            });
        });
        it('response ok', done => {
            request(server)
                .get(`/suites/suiteID/corpID/corp-users?code=code`)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.errcode.should.be.eql(200);
                    res.body.corpUser.userID.should.be.eql("wechat-user-id");
                    done();
                });
        });
    });
    after(done => {
        function teardownExpress() {
            return new Promise((resolve, reject) => {
                server.close(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };
        function* teardown() {
            yield teardownExpress();
        };
        co(teardown).then(() => {
            done();
        }).catch(err => {
            done(err);
        });
    });
});