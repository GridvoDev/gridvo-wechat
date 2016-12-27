'use strict';
const {createZipkinTracer} = require("gridvo-common-js");

const tracer = createZipkinTracer({http: true});
module.exports = tracer;