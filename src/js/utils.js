// REF: https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
export function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }))
}

export function loadScript(url) {
  var id = b64EncodeUnicode(url)
  var script = document.getElementById(id)
  if(script)
    return Promise.resolve(script)
  script = document.createElement('script')
  script.setAttribute('defer', '')
  script.setAttribute('async', '')
  var head = document.getElementsByTagName('head')[0]
  var p = new Promise(function(res, rej) {
    script.id = id
    script.onload = function(ev) {
      res(script)
    }
    script.onerror = function(ev) {
      rej(script)
    }
    script.src = url
    head.append(script)
  })
  return p
}

const ja = {
  '<': 'flex-start',
  '>': 'flex-end',
  '+': 'center',
  '~': 'stretch',
  '_': 'baseline',
  'a': 'space-around',
  'b': 'space-between',
  'e': 'space-evenly',
}

export function layout({dr='v', jc='b', ac='+', ai='~', fx=null, mg=null, pd=null}) {
  var style = {
    display: 'flex',
    flexFlow: dr.indexOf('v') != -1 ? 'column' : 'row' +
      dr.indexOf('-') != -1 ? '-reverse ' : ' ' +
      dr.indexOf('.') != -1 ? 'nowrap' : 'wrap',
    justifyContent: ja[jc],
    alignContent: ja[ac],
    alignItems: ja[ai],
  }

  if (fx)
    style.flex = fx
  if (mg)
    style.margin = mg
  if (pd)
    style.padding = pd

  return style
}
