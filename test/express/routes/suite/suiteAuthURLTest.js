const _ = require('underscore');
const co = require('co');
const should = require('should');
const request = require('supertest');
const express = require('express');
const suiteAuthURLRouter = require('../../../../lib/express/routes/suite/suiteAuthURL.js');
const MockCorpAuthSuiteService = require('../../../mock/application/service/corpAuthSuiteService');
const {expressZipkinMiddleware, createZipkinTracer} = require("gridvo-common-js");

describe('suiteAuthURLRouter use case test', ()=> {
    let app;
    let server;
    before(done=> {
        function setupExpress() {
            return new Promise((resolve, reject)=> {
                app = express();
                app.use(expressZipkinMiddleware({
                    tracer: createZipkinTracer({}),
                    serviceName: 'test-service'
                }));
                app.use('/suites', suiteAuthURLRouter);
                let corpAuthSuiteService = new MockCorpAuthSuiteService();
                app.set('corpAuthSuiteService', corpAuthSuiteService);
                server = app.listen(3001, err=> {
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
        co(setup).then(()=> {
            done();
        }).catch(err=> {
            done(err);
        });
    });
    describe('#get:/suites/:suiteID/suite-auth-url', ()=> {
        context('get suite auth url', ()=> {
            it('should response suite auth url', done=> {
                request(server)
                    .get(`/suites/suiteID/suite-auth-url`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.suiteAuthUrl.should.be.eql("suite-auth-url");
                        done();
                    });
            });
        });
    });
    after(done=> {
        function teardownExpress() {
            return new Promise((resolve, reject)=> {
                server.close(err=> {
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
        co(teardown).then(()=> {
            done();
        }).catch(err=> {
            done(err);
        });
    });
});