const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  forge = require('node-forge'),
  request = require('request'),
  url = require('url'),
  opn = require('opn'),
  _ = require('lodash');


var convertToXml = require('./src/utils/convertToXml'),
  config = require('./config/config-file');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/start', (req, res) => {
  res.json('Connected Successfully');
});

app.post('/webhook', function (req, res) {
  var headerHmacSignature = req.get("X-Classmarker-Hmac-Sha256");
  var jsonData = req.body;
  // You are given a un‌iquе sеc‌ret code when crеati‌ng a Wеbho‌ok.// TODO declare in ENVIRONMENT VARIABLE
  var secret = '1Hydpc0rchGKGT6';
  var verified = verifyData(jsonData, headerHmacSignature, secret);


  // console.log(js2xmlparser.parse("UpdateUserTranscript", tranformData));
  if (verified) {
    var tranformData = convertToXml.convertWebhookToXML(req.body);
    // Sa‌vе rеsu‌lts in your databasе.
    // Important: Do not use a script that will take a long timе to respond.
  	routeToLms(tranformData);
    // Notify ClassMarker you have recеiv‌ed the Wеbh‌ook.
    res.sendStatus(200);
  }
  else {
    res.sendStatus(400)
  }
});

app.post('/cook-childrens/webhook', function (req, res) {
  var headerHmacSignature = req.get("X-Classmarker-Hmac-Sha256");
  var jsonData = req.body;
  // You are given a un‌iquе sеc‌ret code when crеati‌ng a Wеbho‌ok.// TODO declare in ENVIRONMENT VARIABLE
  var secret = 'H9f6x7RYz9KPvb1';
  var verified = verifyData(jsonData, headerHmacSignature, secret);
 	
  if (verified) {
    var tranformData = convertToXml.convertWebhookToXML(req.body);
    // Sa‌vе rеsu‌lts in your databasе.
    // Important: Do not use a script that will take a long timе to respond.
    routeToLms(tranformData);

    // Notify ClassMarker you have recеiv‌ed the Wеbh‌ook.
    res.sendStatus(200);
  }
  else {
    res.sendStatus(400);
  }
});


app.post('/launchLmsTest', function (req, res) {
  var queryString;
  queryString = formatter.urlParameters(req.body);
  // opn(`${CLASSMARKER_URL}${queryString}`);
  res.json(`${CLASSMARKER_URL}${queryString}`);
  return res;
});

var verifyData = function (jsonData, headerHmacSignature, secret) {
  var jsonHmac = computeHmac(jsonData, secret);
  console.log('JSONHMAC:'+ jsonHmac);
  console.log('JSONHMAC:'+ headerHmacSignature);
 return jsonHmac == headerHmacSignature;
  //return jsonHmac !== headerHmacSignature;
};

var computeHmac = function (jsonData, secret) {
  var hmac = forge.hmac.create();
  hmac.start('sha256', secret);
  var jsonString = JSON.stringify(jsonData);
  var jsonBytes = new Buffer(jsonString, 'ascii');
  hmac.update(jsonBytes);
  return forge.util.encode64(hmac.digest().bytes());
};

var routeToLms = function (postData) {

  console.log('=============Start Request==================');
  var reqt =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:vuep="http://vuepoint.com/">
      <soapenv:Header/>
        <soapenv:Body>
          <vuep:UpdateUserTranscript>
           <!--Optional:-->
            <vuep:sourceXml>
              <![CDATA[         
                <UpdateUserTranscript>
	            	<Level>
	                  <UniqueId/>
	                </Level>
                 	${postData} 
                </UpdateUserTranscript>
              ]]>
            </vuep:sourceXml>
          </vuep:UpdateUserTranscript>
        </soapenv:Body>
      </soapenv:Envelope>
     `;

  console.log(reqt);
  console.log('=============End Request==================');


  var requestOptions = {
    'method': config.POST_METHOD,
    'url': config.POST_URL,
    'qs': { 'wsdl': '' },
    'headers': config.postheaders,
    'body': reqt,
  };

  request(requestOptions, function (error, response, body) {
 	 setTimeout(function() {
	 	console.log('=============Call LMS WS Start=============');
		if (error) {
		 console.log('===============ws error==================');
		 console.log(error);
		 console.log('===============ws error==================');
		} else {
	      	 console.log('===============ws resonse==================');
	         console.log(response.body);
	         console.log('===============ws resonse==================');
    	      }
	     console.log('=============Call LMS WS End=================');
		 }, 600000); // 600 seconds 
  });

};

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});
