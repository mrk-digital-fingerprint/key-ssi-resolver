const KeySSIMixin = require("../KeySSIMixin");

function TemplateSSI(identifier) {
	Object.assign(this, KeySSIMixin);
	this.autoLoad(identifier);
}

function createTemplateSSI(identifier) {
	return new TemplateSSI(identifier);
}

module.exports = {
	createTemplateSSI
}