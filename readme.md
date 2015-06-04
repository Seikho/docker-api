## An API for querying the Docker RESTful API

#### Installation
```
npm install docker-webapi 
```

#### Usage

The API 

```javascript
var docker = require("docker-restapi");
docker("/images/json").then(console.log);
```

#### TODO

API configuration:
* End-point
* SSL information
* API version target

JavaScript Wrapper of the v1.18 Docker REST Api