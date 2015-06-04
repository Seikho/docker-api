import Promise = require("bluebird");
import path = require("path");
import https = require("https");
import http = require("http");
import fs = require("fs");
var readFileAsync = Promise.promisify(fs.readFile);
var cwd = path.resolve(__dirname);

// TODO: Docker API URL should be in config
// TODO: Docker API version should be in config
// TODO: Ensure API requests are prefixed with a forward-slash
// TODO: Ensure docker() works as intended on *nix systems
// TODO: key/cert/ca location should be configurable
var dockerConfig = {
	hostname: "192.168.59.103",
	sslPath: cwd,
	version: "v1.18",
	port: 2376
}

export function get(request: string) {
	return docker(request);
}

export function post(request: string) {
	return docker(request, "POST");
}

export function config(updatedConfig: any) {
	for (var key in updatedConfig) {
		dockerConfig[key] = updatedConfig[key];
	}
}

function docker(request: string, method?: string) {
	var options = dockerOptions(request, method);
	
	// Windows Docker API requires SSL information
	var keyPromise = readFileAsync(path.join(cwd, "key.pem"))
		.then(key => { options.key = key.toString(); });

	var certPromise = readFileAsync(path.join(cwd, "cert.pem"))
		.then(cert => { options.cert = cert.toString(); });

	var caPromise = readFileAsync(path.join(cwd, "ca.pem"))
		.then(ca => { options.ca = ca.toString(); });
	
	return Promise.all([keyPromise, certPromise, caPromise]).then(() => {
		return dockerPromise(options, https.request);
	});
}

function dockerPromise(options: https.RequestOptions, requestApi: any) {
	var dockerResponse = "";

	return new Promise((resolve, reject) => {
		var req = requestApi(options, response => {
			response.on("data", data => dockerResponse += data.toString());
			response.on("end", data => {
				var dockerJson = JSON.parse(dockerResponse);
				resolve(Promise.resolve(dockerJson))
			});
		});
		req.on("error", err => reject(err));
		req.end();
	});
}

function dockerOptions(request: string, method?: string): https.RequestOptions {
	var options = {
		key: "",
		cert: "",
		ca: "",
		hostname: dockerConfig.hostname,
		port: dockerConfig.port,
		method: method || "GET",
		path: request
	};

	if (options.method !== "GET" && options.method !== "POST") options.method = "GET";

	return options;
}
