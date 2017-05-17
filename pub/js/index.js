(function () {
'use strict';

// REF: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

function loadScript(url) {
  var id = b64EncodeUnicode(url);
  var script = document.getElementById(id);
  if (script) return Promise.resolve(script);
  script = document.createElement('script');
  script.setAttribute('defer', '');
  script.setAttribute('async', '');
  var head = document.getElementsByTagName('head')[0];
  var p = new Promise(function (res, rej) {
    script.id = id;
    script.onload = function (ev) {
      res(script);
    };
    script.onerror = function (ev) {
      rej(script);
    };
    script.src = url;
    head.append(script);
  });
  return p;
}

var print$1 = console.log.bind(console);

class Auth {
  constructor({ provider, scriptSrc, cred }) {
    if (!(provider && scriptSrc && cred)) throw 'Must have a provider, scriptSrc, and cred arg';

    this.provider = provider;
    this.scriptSrc = scriptSrc;
    this.cred = cred;

    if (provider == 'google') {
      this.signin = this.googleSignin;
      this.signout = this.googleSignout;
    } else if (provider == 'facebook') {
      this.signin = this.facebookSignin;
      this.signout = this.facebookSignout;
    } else {
      throw 'Unknown provider ' + provider;
    }
  }

  get googleUser() {
    if (this.ga) return this.ga.currentUser.get();else return null;
  }

  get googleIsIn() {
    if (this.ga) return this.ga.isSignedIn.get();else null;
  }

  get googleIsOut() {
    return !this.isIn;
  }

  googleSignin() {
    var self = this;
    return loadScript(self.scriptSrc).then(s => {
      return new Promise(function (res, rej) {
        gapi.load('auth2', function () {
          res();
        });
      });
    }).then(() => {
      return gapi.auth2.init(self.cred).then();
    }).then(() => {
      self.ga = gapi.auth2.getAuthInstance();
      return self.ga.grantOfflineAccess();
    }).then(resp => {
      return fetch('/api/auth/', {
        method: 'get',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'Fetch',
          'Authorization': 'Google ' + resp.code
        }
      });
    }).then(resp => Promise.all([resp, resp.json()])).then(([resp, json]) => {
      if (!resp.ok) throw json;
      return json;
    }).then(resp => {
      print$1(resp);
    }).catch(err => {
      print$1(err);
      alert('Could not authenticate with Google.');
    });
  }

  googleSignout() {
    if (gapi && gapi.auth2) {
      return gapi.auth2.getAuthInstance().signOut();
    } else return Promise.reject();
  }

  googleIsAuthorized() {
    if (this.user) return this.user.hasGrantedScopes(this.cred.scope);else return null;
  }

  get facebookUser() {}

  facebookSignin() {
    var self = this;
    return loadScript(self.scriptSrc).then(function (s) {
      return FB.init(self.cred);
    }).then(function () {
      return new Promise((res, rej) => {
        FB.login(resp => {
          if (resp.status == 'connected' && resp.authResponse) res(resp);else rej(resp);
        }, { scope: self.cred.scope, return_scopes: true });
      });
    }).then(function (resp) {
      return fetch('/api/auth/', {
        method: 'get',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'Fetch',
          'Authorization': 'Facebook ' + resp.authResponse.accessToken
        }
      });
    }).then(resp => Promise.all([resp, resp.json()])).then(([resp, json]) => {
      if (!resp.ok) throw json;
      return json;
    }).then(resp => {
      print$1(resp);
    }).catch(function (err) {
      print$1(err);
      alert('Could not authenticate with Facebook.');
    });
  }

  facebookSignout() {
    if (FB) {
      return new Promise((res, rej) => {
        FB.logout(resp => {
          print$1(resp);
          res(resp);
        });
      });
    } else return Promise.reject();
  }

}

var print = console.log.bind(console);

var googleScriptSrc = '//apis.google.com/js/platform.js';
var facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js';

var gg = new Auth({ provider: 'google', scriptSrc: googleScriptSrc, cred: {
        'clientId': '32902065428-sbal87ccp0eedjoo2opcq0tr22ha3884.apps.googleusercontent.com',
        'scope': 'profile email'
    } });

var fb = new Auth({ provider: 'facebook', scriptSrc: facebookScriptSrc, cred: {
        'appId': '126309204593715',
        'cookie': true,
        'xfbml': true,
        'version': 'v2.9',
        'scope': 'email'
    } });

window.gg = gg;
window.fb = fb;

}());

//# sourceMappingURL=index.js.map