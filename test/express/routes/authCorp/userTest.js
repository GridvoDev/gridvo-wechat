const _ = require('underscore');
const co = require('co');
const should = require('should');
const request = require('supertest');
const express = require('express');
const userRouter = require('../../../../lib/express/routes/authCorp/user.js');
const MockAuthCorpContactsService = require('../../../mock/application/service/authCorpContactsService');
const {expressZipkinMiddleware, createZipkinTracer} = require("gridvo-common-js");

describe('userRouter use case test', ()=> {
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
                app.use('/auth-corps', userRouter);
                let authCorpContactsService = new MockAuthCorpContactsService();
                app.set('authCorpContactsService', authCorpContactsService);
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
    describe('#get:/auth-corps/:corpID/:suiteID/users', ()=> {
        context('get auth corp suite users', ()=> {
            it('should response err', done=> {
                request(server)
                    .get(`/auth-corps/noCorpID/suiteID/users`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(400);
                        res.body.errmsg.should.be.eql("fail");
                        done();
                    });
            });
            it('should response users', done=> {
                request(server)
                    .get(`/auth-corps/corpID/suiteID/users`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res)=> {
                        if (err) {
                            done(err);
                            return;
                        }
                        res.body.errcode.should.be.eql(200);
                        res.body.errmsg.should.be.eql("ok");
                        res.body.users.length.should.be.eql(1);
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