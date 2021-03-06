var Promise = require("bluebird");
var path = require("path");
var https = require("https");
var fs = require("fs");
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
};
function get(request) {
    return docker(request);
}
exports.get = get;
function post(request) {
    return docker(request, "POST");
}
exports.post = post;
function config(updatedConfig) {
    for (var key in updatedConfig) {
        dockerConfig[key] = updatedConfig[key];
    }
}
exports.config = config;
function docker(request, method) {
    var options = dockerOptions(request, method);
    // Windows Docker API requires SSL information
    var basePath = path.resolve(dockerConfig.sslPath);
    var keyPromise = readFileAsync(path.join(basePath, "key.pem"))
        .then(function (key) { options.key = key.toString(); });
    var certPromise = readFileAsync(path.join(basePath, "cert.pem"))
        .then(function (cert) { options.cert = cert.toString(); });
    var caPromise = readFileAsync(path.join(basePath, "ca.pem"))
        .then(function (ca) { options.ca = ca.toString(); });
    return Promise.all([keyPromise, certPromise, caPromise]).then(function () {
        return dockerPromise(options, https.request);
    });
}
function dockerPromise(options, requestApi) {
    var dockerResponse = "";
    return new Promise(function (resolve, reject) {
        var req = requestApi(options, function (response) {
            response.on("data", function (data) { return dockerResponse += data.toString(); });
            response.on("end", function (data) {
                var dockerJson = JSON.parse(dockerResponse);
                resolve(Promise.resolve(dockerJson));
            });
        });
        req.on("error", function (err) { return reject(err); });
        req.end();
    });
}
function dockerOptions(request, method) {
    var options = {
        key: "",
        cert: "",
        ca: "",
        hostname: dockerConfig.hostname,
        port: dockerConfig.port,
        method: method || "GET",
        path: request
    };
    if (options.method !== "GET" && options.method !== "POST")
        options.method = "GET";
    return options;
}
