const KeySSIMixin = require("../KeySSIMixin");

function TemplateSSI(identifier) {
	const self = this;
	KeySSIMixin(self);
	self.autoLoad(identifier);
}

function createTemplateSSI(identifier) {
	return new TemplateSSI(identifier);
}

module.exports = {
	createTemplateSSI
}