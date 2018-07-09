module.exports = {
  createListener: function createListener(port, callback) {
    var http = require('http');
    var fs = require('fs');
    var querystring = require('querystring');

    var server = http.createServer(function(req, res) {
      if (req.method == "POST"){ //check if we are being posted to
        console.log("got request. Method: POST")
        req.on('data', function(data) {
          res.writeHead(200)
          getXMLdata(data, function(reqObject){
            var callData = getCallData(reqObject)
            callback(callData, function(resObject) {sendResponse(res, callData, resObject)});
          });
        });
      } else {  //if this is a GET request, do manual testing
        console.log("got request. Method: NOT POST")
        res.writeHead(200)
        var reqObject = fs.readFile("sample.xml", function(err, data) {
          getXMLdata(data, function(reqObject){
            var callData = getCallData(reqObject)
            callback(callData, function(resObject) {sendResponse(res, callData, resObject)});
          });
        });
      }
    });
    server.listen(port);
  }
};

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
    for (i = 0; i < customAttributeList.length; i++){
      customAttributes[customAttributeList[i].Attribute[0].Name[0]] = customAttributeList[i].Attribute[0].Value[0] //adds the atribute name and value to the customAtributes Object
    }
    return customAttributes
  } catch (err) {
//    console.log("no custom attributes")
    return null
  }
}

function sendResponse (res, callData, XMLobject) {
  var xml = generateXML(callData, XMLobject)
  console.log(xml)
  res.end(xml)
}

function generateXML(callData, resObject) {
  var xml2js = require('xml2js'); 
  var XMLbuilder = new xml2js.Builder();
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

  var XMLobject = resObject

  return XMLbuilder.buildObject(XMLobject);

}
