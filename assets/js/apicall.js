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

// reference: https://www.youtube.com/watch?v=RNep4_QpIM0&list=PL5UFsTza4wWQRiguVuAuSsnhZK5NIXZEO
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.lineWidth = 30;
var down = false;
var data;
var csvOriginal =[];

canvas.addEventListener('mousemove',draw);
canvas.addEventListener('mousedown',function(){
  down = true;
  context.beginPath();
  context.moveTo(xPos,yPos);
  canvas.addEventListener("mousemove",draw);

});

canvas.addEventListener('mouseup',function() {down = false;});

function draw(e){
  var pos = getMousePos(canvas,e);
  xPos = pos.x;
  yPos = pos.y;
  if (down == true){
    context.lineTo(xPos,yPos);
    context.stroke();
  }
  var imageData = context.getImageData(0,0,canvas.width,canvas.height);
  data = imageData.data;
  csvOriginal =[];
  for (var i=0; i<data.length; i+=4){
    if(data[i+3]>0){
      csvOriginal.push(1);
    }
    else {
      csvOriginal.push(0);
    }
  };

}
// reference: http://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function clearCanvas(){
  context.clearRect(0,0,canvas.width,canvas.height);
  var myEle = document.getElementById("prediction");
  if (myEle){
    myEle.remove(0);
  }
}


function processData(imgData){
  var maxVal=0;
  for (var i=0; i<imgData.length; i+=4){
    if (imgData[i]>maxVal){
      maxVal = imgData[i];
    }
  }
  console.log(maxVal);
}

function getCSV()
{
  return compress(csvOriginal);
}

function predict(){
  var length = csvOriginal.reduce(function (a, b) {
            return a + b;
            }, 0);
  if (length===0) {
    return;
  } else {
    var csv = compress(csvOriginal);
    console.log(csv.toString());
    makePrediction(csv);
  }

}

function compress(original){
  var left=canvas.width-1,right=0,top=canvas.height-1,bottom=0;
  var width,height;
  var rowIndex,columnIndex;
  var size;
  for (var i=0; i<original.length; i+=1){
    rowIndex = parseInt(i/canvas.width);
    columnIndex = i%canvas.width;
    if (original[i]>0){
      if (rowIndex<top) {
        top = rowIndex;
      }
      if (rowIndex>bottom) {
        bottom = rowIndex;
      }
      if (columnIndex<left) {
        left = columnIndex;
      }
      if (columnIndex>right) {
        right = columnIndex;
      }
    }
  }
  width = right - left;
  height = bottom - top;
  size = Math.max(width,height);

  var midWidth = parseInt((right+left)/2);
  var midHeight = parseInt((bottom + top)/2);
  size = 2* parseInt(size/2);
  console.log("width = ",width, " height = ", height, "size = ",size);
  var newLeft = midWidth - (size/2);
  var newRight = midWidth + (size/2);
  var newTop = midHeight - (size/2);
  var newBottom = midHeight +(size/2);
  console.log("newleft = ",newLeft, " newRight = ", newRight, "newTop = ",newTop, "newBottom = ",newBottom);
  var csv_zoom_in =[];
  for (var j=0; j<original.length; j+=1){
    rowIndex = parseInt(j/canvas.width);
    columnIndex = j%canvas.width;
    if (rowIndex>= newTop && rowIndex< newBottom && columnIndex < newRight && columnIndex >= newLeft){
      //console.log("rowIndex = ",rowIndex, " columnIndex = ",columnIndex);
      csv_zoom_in.push(original[j]);
    }
  }
  console.log(csv_zoom_in);
  csvInstance=averageFilter(csv_zoom_in,size);
  /*

  var canvas2 = document.createElement("canvas"),
      ctx = canvas2.getContext("2d"),
      img = [];
      canvas2.setAttribute("id", "canvas2");
  for (var k=0; k<csvInstance.length; k+=1){
    if(csvInstance[k]===1){
      img.push(0);
      img.push(0);
      img.push(0);
      img.push(255);
    } else {
      img.push(0);
      img.push(0);
      img.push(0);
      img.push(0);
    }
  }

  // Get a pointer to the current location in the image.
  var palette = ctx.getImageData(0,0,16,16); //x,y,w,h
  // Wrap your array as a Uint8ClampedArray
  palette.data.set(new Uint8ClampedArray(img)); // assuming values 0..255, RGBA, pre-mult.
  // Repost the data.
  ctx.putImageData(palette,0,0);
  var element = document.getElementsByTagName("body")[0];
  element.appendChild(canvas2);

  */

  return csvInstance;
}

function averageFilter(array,size){
  var width = size;
  var height = size;
  var result=[];
  var thumbwidth = 16;
  var thumbheight = 16;
  var xscale = (thumbwidth+0.0) / width;
  var yscale = (thumbheight+0.0) / height;
  var threshold = 0.35 / (xscale * yscale);
  var yend = 0.0;
  for (var f = 0; f < thumbheight; f+=1) // y on output
  {
    var ystart = yend;
    yend = (f + 1) / yscale;
    if (yend >= height) {yend = height - 0.000001;}
    var xend = 0.0;
    for (var g = 0; g < thumbwidth; g+=1) // x on output
    {
        var xstart = xend;
        xend = (g + 1) / xscale;
        if (xend >= width) {xend = width - 0.000001;}
        var sum = 0.0;
        for (var y = parseInt(ystart); y <= parseInt(yend); y+=1)
        {
            var yportion = 1.0;
            if (y == parseInt(ystart)) {yportion -= ystart - y;}
            if (y == parseInt(yend)) {yportion -= y+1 - yend;}
            for (var x = parseInt(xstart); x <= parseInt(xend); x+=1)
            {
                var xportion = 1.0;
                if (x == parseInt(xstart)) {xportion -= xstart - x;}
                if (x == parseInt(xend)) {xportion -= x+1 - xend;}
                sum += array[x+y*width] * yportion * xportion;
            }
        }
        //result[f][g] = (sum > threshold) ? 1 : 0;
        if (sum>threshold) {
          result[g+f*thumbwidth] = 1;
        } else {
          result[g+f*thumbwidth] = 0;
        }
    }
}
  console.log(result);
  return result;
}
