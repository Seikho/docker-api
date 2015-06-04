## An API for querying the Docker RESTful API

#### Installation
```
npm install docker-restapi 
```

#### Usage

The API is a function that sends a request to the RESTful API and returns a promise.  
The promise resolves with the JSON parsed result or is rejected if an error was encountered.

```javascript

var docker = require("docker-restapi");
docker.get("/images/json") // GET request by default
  .then(function(images) {
	  // ...
  });
  
docker.post("/containers/create") // Specify POST for POST requests
.then(function(results) {
	  // ...
  });
```

#### TODO

API configuration:
* End-point (url)
* SSL information (path)
* API version target (defaults to v1.18)

JavaScript Wrapper of the v1.18 Docker REST Api