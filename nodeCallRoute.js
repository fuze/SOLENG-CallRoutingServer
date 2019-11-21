module.exports = {
  createListener: function createListener(config, routingFunction) {
    var useHttps = config.https
    var port = config.port
    var username = config.user
    var password = config.password

    var httpServer
    var options
    var fs = require('fs');
    if (useHttps) {
      httpServer = require('https')

      if (config.https_key_path && config.https_cert_path) {
        options = {
          key: fs.readFileSync(config.https_key_path, "utf8"),
          cert: fs.readFileSync(config.https_cert_path, "utf8")
        }
        if (config.https_ca_path) {
          options.ca = fs.readFileSync(config.https_ca_path, "utf8")
        }
      } else if (config.https_pfx_path && config.https_pfx_passphrase) {
        options = {
          pfx: fs.readFileSync(config.https_pfx_path, "utf8"),
          passphrase: config.https_pfx_passphrase
        }
      } else {
        throw new Error('No configured CERT for enabling SSL!')
      }
    } else {
      httpServer = require('http');
    }

    var server = httpServer.createServer(options, function(req, res) {
    console.log('server request')
    console.log(req.headers);
      if (req.method == "POST"){ //check if we are being posted to
        if (verifyCredentials(req.headers.authorization, username, password)){
          console.log("got request. Method: POST")
          req.on('data', function(data) {
            res.writeHead(200)
            getXMLdata(data, async function(reqObject){
              var callData = getCallData(reqObject)
              let routingResult = await routingPromise(callData, routingFunction)
              sendResponse(res, routingResult)
            });
          });
        } else {
          console.log("error authenticating")
          res.writeHead(403)
          res.end("error while authenticating")
        }
      } else {  //if this is a GET request, do manual testing
        console.log("got request. Method: NOT POST")
        res.writeHead(200)
        var reqObject = fs.readFile("sample.xml", function(err, data) {
          getXMLdata(data, async function(reqObject){
            var callData = getCallData(reqObject)
            let routingResult = await routingPromise(callData, routingFunction)
            sendResponse(res, routingResult)
          });
        });
      }
    });
    server.listen(port);
  },

};

function routingPromise (callData, routingFunction){
  let promise = new Promise((resolve, reject) => {
    resolve(routingFunction(callData))
  })
  return promise
}

function verifyCredentials (header, username, password){
  if (username === undefined && password === undefined){
    return true
  }
  if (username === undefined){username = ""}  //fixes values for when only a username or password is present
  if (password === undefined){password = ""}

  let encoded = Buffer.from(username + ":" + password).toString('base64') //encode credentails in base 64
  console.log("Basic " + encoded + " === " + header)
  if (header === "Basic " + encoded){
    return true
  } else {
    return false
  }
}

function getXMLdata(data, callback){ // read the named file into a javascript object
  var xml2js = require('xml2js');
  var parser = new xml2js.Parser();
  parser.parseString(data, function(err, result){
    callback(result);
  });
};

function getCallData(input, callback){ //get the data we need an make our call data object
  var callData = {
    requestID: input.TpnRequest.RequestId[0].trim(),
    objectID: input.TpnRequest.CallInfo[0].ObjectId[0].trim(),
    clid: input.TpnRequest.CallInfo[0].ClidNum[0].trim(),
    idid: input.TpnRequest.CallInfo[0].Idid[0].trim(),
    customAttributes: getCustomAttributes(input)
  }
  return callData
};

function getCustomAttributes(data){ //build 2d array of custom attributes
  var customAttributeList = data.TpnRequest.CallInfo[0].CustomAttributes
  var customAttributes = {}
  try {
    for (i = 0; i < customAttributeList[0].Attribute.length; i++){
      customAttributes[customAttributeList[0].Attribute[i].Name[0]] = customAttributeList[0].Attribute[i].Value[0] //adds the atribute name and value to the customAtributes Object
    }
    return customAttributes
  } catch (err) {
//    console.log("no custom attributes")
    return null
  }
}

function sendResponse (res, XMLobject) {
  var xml = generateXML(XMLobject)
  console.log(xml)
  res.end(xml)
}

function generateXML(resObject) {
  var xml2js = require('xml2js'); 
  var XMLbuilder = new xml2js.Builder();
  return XMLbuilder.buildObject(resObject);
/*
  var XMLobject = {}
  XMLobject.TpnResponse = {
    "RequestId" : callData.requestID,
    "CallActions" : {
      "ObjectId" : callData.objectID,
      "SetCallerId" : {
        "ClidNum" :
        "ClidName" : 
      }
      "RouteCall" : {
        "Ivr" : null,
        "Exten" : transferNumber
      },
      "SetAttributes" : null
    }
  }
*/
}
