'use strict';
const _ = require('underscore');
const co = require('co');
const should = require('should');
var https = require('https');
const express = require('express');
const HttpWechatThirdAPIServiceGateway = require('../../../lib/infrastructure/serviceGateway/httpWechatThirdAPIServiceGateway');
var muk = require('muk');

describe('HttpWechatThirdAPIServiceGateway use case test', ()=> {
    let gateway;
    before(()=> {
        gateway = new HttpWechatThirdAPIServiceGateway();
    });
    describe('getSuiteAccessToken(suiteID, suiteSecret, suiteTicket, traceContext,  callback)', ()=> {
        context('get suite access token)', ()=> {
            it('is ok', done=> {
                let mockRequest = function (options) {
                    return new Promise((resolve, reject)=> {
                        resolve({
                            entity: {
                                suite_access_token: "61W3mEpU66027wgNZ_MhGHNQDHnFATkDa9-2llqrMBjUwxRSNPbVsMmyD-yq8wZETSoE5NQgecigDrSHkPtIYA",
                                expires_in: 7200
                            }
                        });
                    });
                };
                mockRequest.wrap = function () {
                    return this;
                }
                muk(gateway, "_httpRequest", mockRequest);
                gateway.getSuiteAccessToken("suiteID", "suiteSecret", "suiteTicket", {}, (err, resultJSON)=> {
                    if (err) {
                        done(err)
                    }
                    resultJSON.suite_access_token.should.be.eql("61W3mEpU66027wgNZ_MhGHNQDHnFATkDa9-2llqrMBjUwxRSNPbVsMmyD-yq8wZETSoE5NQgecigDrSHkPtIYA");
                    done();
                });
            });
        });
    });
});