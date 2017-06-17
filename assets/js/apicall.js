var GoogleAuth;
//var SCOPE = "https://www.googleapis.com/auth/prediction https://www.googleapis.com/auth/cloud-platform";
var SCOPE = "https://www.googleapis.com/auth/prediction";
function handleClientLoad() {
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.
gapi.load('client:auth2', initClient);
}

function initClient() {
// Retrieve the discovery document for version 3 of Google Drive API.
// In practice, your app can retrieve one or more discovery documents.
var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Initialize the gapi.client object, which app uses to make API requests.
// Get API key and client ID from API Console.
// 'scope' field specifies space-delimited list of access scopes.
gapi.client.init({
		'apiKey': 'AIzaSyBhxlQUXE-F04zIfsYjfTLJ8XUadl7GTwg',
		'discoveryDocs': [discoveryUrl],
		'clientId': '879715850906-os345pp9q0tka0sr172ircva5697b3so.apps.googleusercontent.com',
		'scope': SCOPE
}).then(function () {
	GoogleAuth = gapi.auth2.getAuthInstance();

	// Listen for sign-in state changes.
	GoogleAuth.isSignedIn.listen(updateSigninStatus);

	// Handle initial sign-in state. (Determine if user is already signed in.)
	var user = GoogleAuth.currentUser.get();
	setSigninStatus();

	// Call handleAuthClick function when user clicks on
	//      "Sign In/Authorize" button.
	$('#sign-in-or-out-button').click(function() {
		handleAuthClick();
	});
	$('#revoke-access-button').click(function() {
		revokeAccess();
	});
});
}

function handleAuthClick() {
if (GoogleAuth.isSignedIn.get()) {
	// User is authorized and has clicked 'Sign out' button.
	GoogleAuth.signOut();
} else {
	// User is not signed in. Start Google auth flow.
	GoogleAuth.signIn();
}
}

function revokeAccess() {
GoogleAuth.disconnect();
}

function setSigninStatus(isSignedIn) {
var user = GoogleAuth.currentUser.get();
var isAuthorized = user.hasGrantedScopes(SCOPE);
if (isAuthorized) {
	$('#sign-in-or-out-button').html('Sign out');
	$('#revoke-access-button').css('display', 'inline-block');
	$('#auth-status').html('');
	 makePrediction();
} else {
	$('#sign-in-or-out-button').html('Sign In/Authorize');
	$('#revoke-access-button').css('display', 'none');
	$('#auth-status').html(' ');
}
}

function updateSigninStatus(isSignedIn) {
setSigninStatus();
}
/*
function makePrediction(csvInstance) {
		var project = "polar-winter-167323";
		var id = "handwritten digit";
		var token = getToken();
		var req = new XMLHttpRequest();

    var payload = {

								"input": {
									"csvInstance": csvInstance
							};


    req.open('POST', "https://www.googleapis.com/prediction/v1.6/projects/"+project+"/trainedmodels/"+id+"/predict", true);
    req.setRequestHeader('Content-Type', 'application/json');
		req.setRequestHeader('Authorization',token);

    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);

      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    req.send(JSON.stringify(payload));
    event.preventDefault();
}
*/

function makePrediction() {
	var project = "polar-winter-167323";
	var id = "handwritten digit";
	var token = getToken();
	var csvInstance = getCSV();

	gapi.client.request({
			'path': "https://www.googleapis.com/prediction/v1.6/projects/"+project+"/trainedmodels/"+id+"/predict",
			'method': "POST",
			'authorization': "Bearer "+token,
			'body': {
								"input": {
									"csvInstance": csvInstance
							}
							},
	}).then(function (resp) {
			var node = document.createElement('p');
		  var confidence;
			var index;
			switch(resp.result.outputLabel) {
				case ("ZERO"): index = 0;
											break;
				case ("ONE"): index = 1;
											break;
				case ("TWO"): index = 2;
												break;
				case ("THREE"): index = 3;
											break;
				case ("FOUR"): index = 4;
											break;
				case ("FIVE"): index = 5;
												break;
				case ("SIX"): index = 6;
											break;
				case ("SEVEN"): index = 7;
											break;
				case ("EIGHT"): index = 8;
												break;
				case ("NINE"): index = 9;
											break;

			}
			var myEle = document.getElementById("prediction");
  			if (myEle){
  			  myEle.remove(0);
 			}
			var outputString = "The prediction is " + index +
			    " with confidence level of " +resp.result.outputMulti[index].score ;

			var label = document.createTextNode(outputString);
			node.appendChild(label);
			node.setAttribute("id","prediction");
			var element = document.getElementById("canvas_div");

			element.appendChild(node);


			console.log(resp.result.outputLabel);
	});
}


function getToken() {
	var pHeader = {"alg":"RS256","typ":"JWT"}
	var sHeader = JSON.stringify(pHeader);
	var pClaim = {};

	pClaim.aud = "https://www.googleapis.com/oauth2/v4/token";
	pClaim.scope = "https://www.googleapis.com/auth/prediction";
	pClaim.iss = "handwritten-digit-recognition@polar-winter-167323.iam.gserviceaccount.com";
	pClaim.exp = KJUR.jws.IntDate.get("now + 1hour");
	pClaim.iat = KJUR.jws.IntDate.get("now");

	var sClaim = JSON.stringify(pClaim);
	var key = "-----BEGIN PRIVATE KEY-----\n" +
	"MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqEO1Lmx2SqlHJ\n" +
	"HmqnaaekM0OEf0kQ15UbAJrEvEFuor4y/lOaEL3nwo2IFRxQmyd/0WKddB6Y2n4+\n" +
	"hENI7/oM0PRWU9BmKLczETw9Ia34glKRufM/wePaKzqua7kkkGeCsiNBnu2y7MTC\n" +
	"HHRtgaGrsxMfJu97tEycC3XlWBqU8Dldps1MwviXMg+xz88gyJPTy1xBXTOrwBw9\n" +
	"gy13m3hNwcs01OlntlnjNyHJWH/PoHK43q/v29bfYID89yuZbWraoY5DLpqaghdz\n" +
	"WfKHAALoK9RWn+ukSxdG4b3DYdRixBtDDVmmDLdAWmqKBv60+AMS0ERQD6cIurMr\n" +
	"N9fwgjjNAgMBAAECggEALt3ITyAZl7v5GugXczhSGxWHg0GClLIcZJsXi6TnkUIn\n" +
	"ES12Q4xekTpTv481xN7lFTvSJdsEvZHk3XycgEKl0ZdZ5lploWmSBvA2fhBEfaoI\n" +
	"cCFi8AySKqLkIoIMPQ/QfrtxrNlL3xWRqX6m9TCWqZcJa3nS4G/Q9uXPoRrVBHr1\n" +
	"/tbkhmKRRkbzNQGuVcuQGjmbzp1xbRDE5zGWxAK2TsqyMQQYvMDLYXQjDvnxho3f\n" +
	"sFZJ6YofxmoQDVfigBMi97r1LwAsfFemlXAt/L9ij7GnIe3DhCThosfdqrIXsFh0\n" +
	"A+O4Fh5d2fyjZWzEfrB6vwpFev8G1BBre4dW6yw3bwKBgQDW1ovJ6tUCB9G8fvD4\n" +
	"93lKeLjqPaJm2XN4gk654gyxUlNerzKyGJWNrRbXHGEHFHI+jd0vTpQrZX6Ap3Sy\n" +
	"AxFG6i0ePlZBNWFoRsGJaXzaknIxj5YdQ1jkOn+xsWCJwhGSwfUQ8f2rrATMSHe0\n" +
	"81oZYJGfcS8wS7b0f6K20dY8BwKBgQDKpmPxf1OJMPL5tUc2nNWAAHNy2tNM3g++\n" +
	"+4A6uLJi6qmqs/Ab3oZZfjfB7o89IloBwpxDmpFaF5sNCSjAiBzOyZFj74kgrquo\n" +
	"9RdPQTocj889iM5oivCSjBwwQATmjIoEZHAINhjXHULTCMRWbdL9kZmzhCjOaCXc\n" +
	"w3vAIx0XiwKBgQDJjG+KV4fMJt/KEeEqAKlGh2kbQAVarcgZl04aLwqvVEeofX52\n" +
	"/H9ZcbgKyLHyPWlMbDTES9jPuaDrO65Lznrn54u6Ysry1Ax1EmRA8LjUKS1+d3Fi\n" +
	"NKtxObxQTNL/ihSIdPPfGNddtbyulZHQLbkqM6GKTlnx2iZizFcvYj61AwKBgQC0\n" +
	"Poi4fQqdBLeomK9NiPNw1XXaG35DaWPR97qXAD5SMuxUE5WmBCe1I8mOKZSnyI0L\n" +
	"8b+xdaKA4mwbjSD9FlOhLbGulJiARDwUnGJuMNLyIosu7SbB34qYnhxYYii5sxjz\n" +
	"TS5Eb3Fqq/EK6UpQoYA/3yg5fnwZEpNSp2DDhbfTfwKBgFNVBqUY2Hi6NTy5ljp8\n" +
	"jyxztpkzYMzSy2oAAet/Lx0IbbvuE9RvgV8zl2RXPbANALIln4/c2D5OvwiVeYrY\n" +
	"bJ9KNwjMq6Ca5Z0c+oeCNBc8Wq6DpqdWkvuXjbBBufFw20KGxuS2R7eG3K2dE0Tm\n" +
	"3BTQq6vaTBj9dkCWfEI8f+Ii\n" +
	"-----END PRIVATE KEY-----\n";
	var sJWS = KJUR.jws.JWS.sign(null, sHeader, sClaim, key);

	var XHR = new XMLHttpRequest();
	var urlEncodedData = "";
	var urlEncodedDataPairs = [];

	urlEncodedDataPairs.push(encodeURIComponent("grant_type") + '=' + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer"));
	urlEncodedDataPairs.push(encodeURIComponent("assertion") + '=' + encodeURIComponent(sJWS));
	urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

	// We define what will happen if the data are successfully sent
	XHR.addEventListener('load', function(event) {
			var response = JSON.parse(XHR.responseText);
			console.log(response["access_token"]);
			return response["access_token"];

	});

	// We define what will happen in case of error
	XHR.addEventListener('error', function(event) {
			console.log('Oops! Something went wrong.');
	});

	XHR.open('POST', 'https://www.googleapis.com/oauth2/v4/token');
	XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	XHR.send(urlEncodedData);

}



function trainModel() {
	var project = "polar-winter-167323";

	gapi.client.request({

			'path': "https://www.googleapis.com/prediction/v1.6/projects/"+project+"/trainedmodels",
			'method': "POST",
			'body': {
			 		"id": "handwritten digit",
			 		"storageDataLocation": "handwritten_digit/output.txt"
				},
	}).then(function (resp) {
			console.log("Training model ...");
	});
}


function getTrainingStatus() {
	var project = "polar-winter-167323";
  var id = "handwritten digit";
	gapi.client.request({

			'path': "https://www.googleapis.com/prediction/v1.6/projects/"+project+"/trainedmodels/"+id,
			'method': "GET",

	}).then(function (resp) {
			console.log("Training status is: " ,JSON.parse(resp["body"])["trainingStatus"]);
	});
}
