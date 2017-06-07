function apiRequest(method, what, id, data) {
  var input = `/api/${what}/${Array.isArray(id) ? id.join(',') : id || ''}`
  var init = {
    method: method,
    credentials: 'include',
    headers: {
      'X-Requested-With': 'Fetch',
    },
  }

  if(data)
    init.body = JSON.stringify(data)

  return fetch(input, init)
  .then(resp => Promise.all([resp, resp.json()]))
  .then(([resp, json]) => {
    if(!resp.ok)
      throw json
    return json
  })
}

var api = {
  get: apiRequest.bind(null, 'get'),
  set: apiRequest.bind(null, 'put'),
  // mod: apiRequest.bind(null, 'patch'),
  add: apiRequest.bind(null, 'post'),
  rem: apiRequest.bind(null, 'delete'),
}

export default api
