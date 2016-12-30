'use strict';
const {createZipkinTracer} = require("gridvo-common-js");

let {ZK_TRACER_HTTP = false, ZK_TRACER_KAFKA = false} = process.env;
let tracer = createZipkinTracer({http: ZK_TRACER_HTTP, kafka: ZK_TRACER_KAFKA});
module.exports = tracer;