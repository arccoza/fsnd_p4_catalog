import Auth from './auth.js'
var print = console.log.bind(console)


var googleScriptSrc = '//apis.google.com/js/platform.js'
var facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js'

var gg = new Auth({provider: 'google', scriptSrc:googleScriptSrc, cred:{
    'clientId': '32902065428-sbal87ccp0eedjoo2opcq0tr22ha3884.apps.googleusercontent.com',
    'scope': 'profile email'
  }})

var fb = new Auth({provider: 'facebook', scriptSrc:facebookScriptSrc, cred:{
    'appId': '126309204593715',
    'cookie': true,
    'xfbml': true,
    'version': 'v2.9',
    'scope': 'email'
  }})


window.gg = gg
window.fb = fb
