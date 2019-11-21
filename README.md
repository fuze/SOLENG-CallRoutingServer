# SOLENG-CallRoutingServer
CallRoutingServer is a javascript application that enables the easy creation of web servers that interface with Fuze’s REST Call Routing API. CallRoutingServer handles the creation of the web server, parsing the request from the Fuze call server, and formating the routing response to be sent back to the call server, leaving only the routing logic to be defined.

## Installation
```npm install```

## Usage
```nodeCallRoute.createListener(config, routingFunction)```

### Routing function response
The last argument you pass to the create listener function is your routing function. This routing will be passed a call data object each time a call routing request is sent to the server. Once the routing function returns an object, the Call Routing Server will parse this object to create the valid XML response to send to the call server. Check out [the documentation](null) for the REST Call Routing API to see whave commands you can send back to the call server in the response XML.

### Example script
```
const callRouting = require('./nodeCallRoute.js');
// use http
const config = {
  https: 0,
  port: 8009,
  user: 'RESTusername',
  password: 'RESTpassword'
}

// use https with key and cert
//const config = {
//  https: 1,
//  https_key_path: '/path/to/key.pem',
//  https_cert_path: '/path/to/cert.pem',
//  port: 8009,
//  user: 'RESTusername',
//  password: 'RESTpassword'
//}

// use https with pfx
//const config = {
//  https: 1,
//  https_pfx_path: '/path/to/cert.pfx',
//  https_pfx_passphrase: 'passphrase',
//  port: 8009,
//  user: 'RESTusername',
//  password: 'RESTpassword'
//}
callRouting.createListener(config, processRequest);

function processRequest(callData){
  response = {
    "TpnResponse" : {
      "RequestId" : callData.requestID,
      "CallActions" : {
        "ObjectId" : callData.objectID,
        "SetCallerId" : null,
        "RouteCall" : {
          "Ivr" : null,
          "Exten" : null
        },
        "SetAttributes" : {
          "Attribute" : {
            "Name" : null,
            "Value" : null
          }
        }
      }
    }
  };
  return response
};
```
