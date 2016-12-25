'use strict';
const {createZipkinTracer} = require("gridvo-common-js");

const tracer = createZipkinTracer({scribe: true});
module.exports = tracer;