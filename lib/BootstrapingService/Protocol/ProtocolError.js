'use strict';
const nodeUtils = require('util');

function ProtocolError(error) {
    Error.call(this, error.message, error.fileName, error.lineNumber);
}

nodeUtils.inherits(ProtocolError, Error);

module.exports = ProtocolError;
