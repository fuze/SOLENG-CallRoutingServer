const callRouting = require('./nodeCallRoute.js');
// use http
const config = {
  https: 0,
  port: 8009,
  user: 'RESTusername',
  password: 'RESTpassword'
}
/*
// use https with key and cert
const config = {
  https: 1,
  https_key_path: '/path/to/key.pem',
  https_cert_path: '/path/to/cert.pem',
  port: 8009,
  user: 'RESTusername',
  password: 'RESTpassword'
}

// use https with pfx
const config = {
  https: 1,
  https_pfx_path: '/path/to/cert.pfx',
  https_pfx_passphrase: 'passphrase',
  port: 8009,
  user: 'RESTusername',
  password: 'RESTpassword'
}
*/

callRouting.createListener(config, processRequest);

function processRequest(callData){
  //
  // Available variables:
  // callData.requestID - A Fuze generated unique identifier that uniquely identifies the request. This requestID must be referenced in the response from the webservice. Do NOT modify
  // callData.clid - the caller ID #
  // callData.clidname - the caller ID name
  // callData.idid - the inbound DID, i.e. the number that was called
  // callData.curcontext - the current asterisk context for the call
  // callData.curexten - the current asterisk extension for the call (note, exten is NOT a dialed extension)
  // callData.timestamp - the UNIX epoch timestamp the request was made
  // callData.customAttributes - an object containing custom variables

  //console.log('Request:');
  //console.log(callData);

  // Default value returned by this script to route calls to
  var sendToExtension = null
  var sendToIVR = null;
  var sendClidName = callData.clidname;

  // Sample logic to determine where to route call to
  if(callData.clid === '5555551111') { // this is just an example
    sendToExtension = '1111';
  }
  else if (callData.customAttributes.IdPin === '1234') {
    sendToExtension = '1234';
  }

  // console.log(`Sending call to ${sendToExtension}`);
  
  // Sample logic to update the caller ID Name
  if(callData.clid === '5555554321') {
    sendClidName = 'Someone Else';
  }

  // Create response to send back to Fuze
  response = {
    "TpnResponse" : {
      "RequestId" : callData.requestID,
      "CallActions" : {
        "ObjectId" : callData.objectID,
        "SetCallerId" : {
          "ClidNum" : '+15555551234',
          "ClidName" : sendClidName
        },
        "RouteCall" : {
          "Ivr" : sendToIVR,
          "Exten" : sendToExtension
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

  // Response
  return response
};