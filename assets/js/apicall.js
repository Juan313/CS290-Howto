var GoogleAuth;
var SCOPE = "https://www.googleapis.com/auth/prediction https://www.googleapis.com/auth/cloud-platform";
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
		'apiKey': 'AIzaSyC8CxdisJqDaPp_eQl6j9M1yrh5H6GFQzo',
		'discoveryDocs': [discoveryUrl],
		'clientId': '879715850906-qs24o9ha54dof58nlmj1lb8t15tqov8j.apps.googleusercontent.com',
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
	$('#auth-status').html('You are currently signed in and have granted ' +
			'access to this app.');
	makePrediction();
} else {
	$('#sign-in-or-out-button').html('Sign In/Authorize');
	$('#revoke-access-button').css('display', 'none');
	$('#auth-status').html('You have not authorized this app or you are ' +
			'signed out.');
}
}

function updateSigninStatus(isSignedIn) {
setSigninStatus();
}

function makePrediction(csvInstance) {
	var project = "polar-winter-167323";
	var id = "handwritten digit";

	gapi.client.request({
			'path': "https://www.googleapis.com/prediction/v1.6/projects/"+project+"/trainedmodels/"+id+"/predict",
			'method': "POST",
			'body': {
								"input": {
									"csvInstance": csvInstance
							}
							},
	}).then(function (resp) {
			var p = document.createElement('p');
			//
			var text = document.createTextNode(resp.result.outputLabel);
			p.appendChild(text);
			var element = document.getElementsByTagName("body")[0];
			element.appendChild(p);

			console.log(resp.result.outputLabel);
	});
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
