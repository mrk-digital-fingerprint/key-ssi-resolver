const KeySSIMixin = require("../KeySSIMixin");

function TemplateSSI(identifier) {
	KeySSIMixin(this);
	this.autoLoad(identifier);
}

function createTemplateSSI(identifier) {
	return new TemplateSSI(identifier);
}

module.exports = {
	createTemplateSSI
}