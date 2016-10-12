'use strict';
var bearcat = require('bearcat');
var should = require('should');

describe('suiteAccessTokenService use case test', function () {
    var service;
    before(function () {
        var contextPath = require.resolve('../../../unittest_application_bcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            service = bearcat.getBean('suiteAccessTokenService');
        });
    });
    describe('#updateSuiteTicket(suiteTicketData,callback)', function () {
        context('update a suite ticket', function () {
            it('update suite ticket fail if no suiteID or ticket or dateTime', function (done) {
                var suiteTicketData = {};
                suiteTicketData.suiteID = "";
                service.updateSuiteTicket(suiteTicketData, function (err, isSuccess) {
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('save suite ticket success', function (done) {
                var suiteTicketData = {};
                suiteTicketData.suiteID = "suiteID";
                suiteTicketData.ticket = "Ticket";
                suiteTicketData.dateTime = new Date();
                service.updateSuiteTicket(suiteTicketData, function (err, isSuccess) {
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
});