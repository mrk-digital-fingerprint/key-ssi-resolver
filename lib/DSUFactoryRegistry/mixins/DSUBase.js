module.exports = function(archive){
	archive.call = (functionName, ...args) => {
		if(args.length === 0){
			throw Error('Missing arguments. Usage: call(functionName, [arg1, arg2 ...] callback)');
		}

		const callback = args.pop();

		archive.readFile("/code/api.js", function(err, apiCode){
			if(err){
				return callback(err);
			}

			try{
				//before eval we need to convert from Buffer/ArrayBuffer to String
				const or = require("overwrite-require");
				switch($$.environmentType){
					case or.constants.BROWSER_ENVIRONMENT_TYPE:
					case or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE:
						apiCode = new TextDecoder("utf-8").decode(apiCode);
						break;
					default:
						apiCode = apiCode.toString();
				}
				apiCode = "let module = {exports: {}}\n" + apiCode + "\nmodule.exports";
				const apis = eval(apiCode);
				apis[functionName].call(this, ...args, callback);

			}catch(err){
				return callback(err);
			}
		});
	}
	return archive;
}