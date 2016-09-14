'use strict';
var MongoClient = require('mongodb').MongoClient;
var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
var SuiteTicket = require('../../../lib/domain/suiteTicket');

console.log(process.env);
describe('suite ticket repository MongoDB use case test', function () {
    var Repository;
    before(function () {
        var contextPath = require.resolve('../../../unittest_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            Repository = bearcat.getBean('suiteTicketRepository');
        });
    });
    describe('#saveSuiteTicket(suiteTicket, cb)', function () {
        context('save a suite ticket', function () {
            it('should return true if save success', function (done) {
                var suiteTicket = new SuiteTicket({
                    suiteID: "suiteID",
                    ticket: "Ticket",
                    dateTime: new Date()
                });
                Repository.saveSuiteTicket(suiteTicket, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    after(function (done) {
        MongoClient.connect("mongodb://:27017/TestWeChat", function (err, db) {
            if (err) {
                return;
            }
            db.collection('suiteTicket').drop(function (err, response) {
                db.close();
                done();
            });
        });
    });
});