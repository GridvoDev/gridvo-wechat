'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const SuiteTicket = require('../../../lib/domain/suiteTicket');
const mongoDBSuiteTicketRepository = require('../../../lib/infrastructure/repository/mongoDBSuiteTicketRepository');
const {createZipkinTracer} = require('gridvo-common-js');

describe.only('suite ticket repository MongoDB use case test', ()=> {
    let Repository;
    before(()=> {
        let tracer = createZipkinTracer({});
        Repository = new mongoDBSuiteTicketRepository({tracer});
    });
    describe('#saveSuiteTicket(suiteTicket, traceContext, cb)', ()=> {
        context('save a suite ticket', ()=> {
            it('should return true if save success', done=> {
                let suiteTicket = new SuiteTicket({
                    suiteID: "suiteID",
                    ticket: "Ticket",
                    dateTime: (new Date()).getTime()
                });
                Repository.saveSuiteTicket(suiteTicket, {}, (err, isSuccess)=> {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getSuiteTicketBySuiteID(suiteID,traceContext, cb)', ()=> {
        context('get a suite ticket for suite id', ()=> {
            it('should return null if no this suite ticket', done=> {
                let suiteID = "noSuiteID";
                Repository.getSuiteTicketBySuiteID(suiteID, {}, (err, suiteTicket)=> {
                    _.isNull(suiteTicket).should.be.eql(true);
                    done();
                });
            });
            it('should return suite ticket', done=> {
                let suiteID = "suiteID";
                Repository.getSuiteTicketBySuiteID(suiteID, {}, (err, suiteTicket)=> {
                    suiteTicket.suiteID.should.be.eql("suiteID");
                    suiteTicket.ticket.should.be.eql("Ticket");
                    done();
                });
            });
        });
    });
    after(done=> {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/Wechat`, (err, db)=> {
            if (err) {
                done(err);
            }
            db.collection('SuiteTicket').drop((err, response)=> {
                db.close();
                done();
            });
        });
    });
});