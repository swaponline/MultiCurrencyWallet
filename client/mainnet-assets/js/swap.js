/**
 * Get Cookie by name, if not exist return undefined
 */
function getCookie(name) {
	var matches = document.cookie.match(new RegExp( "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)" ));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Set Cookie
 */
function setCookie(name, value, options) {
	options = options || {};

	var expires = options.expires;

	if (typeof expires == "number" && expires) {
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		expires = options.expires = d;
	}
	if (expires && expires.toUTCString) {
		options.expires = expires.toUTCString();
	}

	value = encodeURIComponent(value);

	var updatedCookie = name + "=" + value;

	for (var propName in options) {
		updatedCookie += "; " + propName;
		var propValue = options[propName];
		if (propValue !== true) {
			updatedCookie += "=" + propValue;
		}
	}

	document.cookie = updatedCookie;
}

/**
 * Delete Cookie
 */
function deleteCookie(name) {
	setCookie(name, "", {
		expires: -1
	})
}

/**
 * Get Query Variable
 */
function getQueryVariable(variable) {
	let query = window.location.search.substring(1);
	let vars = query.split("&");
	for (let i = 0; i < vars.length; i++) {
		let pair = vars[i].split("=");
		if (pair[0] === variable) {
			return pair[1];
		}
	}
	return (false);
}

/**
 * Swap get Hour, Day and Month in seconds
 */
var swapGetHourSec  = 60 * 60,
	swapGetDaySec   = swapGetHourSec * 24,
	swapGetWeekSec  = swapGetDaySec * 7,
	swapGetMonthSec = swapGetDaySec * 30,
	swapGetYearSec  = swapGetMonthSec * 12;

/**
 * Swap Modal
 */
var swapDisalbeStarter = getCookie('swapDisalbeStarter');
if( swapDisalbeStarter != 'true' ){
	document.getElementById('starter-modal').classList.remove('d-none');
	document.body.classList.add('overflow-hidden');
}
document.getElementById('swap-create-wallet').addEventListener('click', function(e){
	e.preventDefault();
	document.getElementById('starter-modal').classList.add('loading');
	setCookie('swapDisalbeStarter', 'true', { expires: swapGetYearSec } );
	setTimeout( function() {
		document.getElementById('starter-modal').classList.add('d-none');
		document.body.classList.remove('overflow-hidden');
	}, 3000 );
	if (typeof ga != undefined){
		ga('send', {
			hitType: 'event',
			eventCategory: 'Splash',
			eventAction: 'CreateWallet',
			eventLabel: 'CreateWallet'
		});
	}
});
document.getElementById('swap-has-wallet').addEventListener('click', function(e){
	e.preventDefault();
	setCookie('swapDisalbeStarter', 'true', { expires: swapGetYearSec } );
	document.getElementById('starter-modal').classList.add('d-none');
	document.body.classList.remove('overflow-hidden');
});

/**
 * Swap Alert
 */
var swapDisalbeAlert = getCookie('swapDisalbeAlert');
if( swapDisalbeAlert != 'true' ){
	document.getElementById('swap-alert').classList.add('d-md-block');
}
document.getElementById('swap-alert-close').addEventListener('click', function(){
	document.getElementById('swap-alert').classList.remove('d-md-block');
	setCookie('swapDisalbeAlert', 'true', { expires: swapGetYearSec } );
});
