import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile, Subheader, TextField, SelectField,
  MenuItem, Paper, IconButton, RaisedButton, Chip, Divider} from './widgets'
import {EditorModeEdit} from './icons'
import {Link} from 'react-router-dom'
import {Item} from './react-app-items-item'
import {layout, modify} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


const tilesData = [
  {
    image: 'images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
  },
  {
    image: 'images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    image: 'images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    image: 'images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
  },
  {
    image: 'images/grid-list/hats-829509_640.jpg',
    title: 'Hats',
    author: 'Hans',
  },
  {
    image: 'images/grid-list/honey-823614_640.jpg',
    title: 'Honey',
    author: 'fancycravel',
  },
  {
    image: 'images/grid-list/vegetables-790022_640.jpg',
    title: 'Vegetables',
    author: 'jill111',
  },
  {
    image: 'images/grid-list/water-plant-821293_640.jpg',
    title: 'Water plant',
    author: 'BkrmadtyaKarki',
  },
]

export default class Items extends React.Component {
  constructor(props) {
    super(props)

    this.modify = modify.bind(this)

    this.types = {  // Provides a mapping of singular type names to plural for REST requests.
      'item': 'items',
      'category': 'categories',
      'items': 'items',
      'categories': 'categories',
    }

    this.typesInv = {  // Provides an inverse mapping of type names.
      'item': 'categories',
      'category': 'items',
      'items': 'categories',
      'categories': 'items',
    }

    this.blank = {
      category: () => ({
        id: null,
        title: '',
        description: '',
        items: [],
        author: '',
      }),
      item: () => ({
        id: null,
        image: null,
        title: '',
        description: '',
        categories: [],
        author: 'Brock Samson',
      }),
      image: () => ({
        id: null,
        name: '',
        type: null,
        blob: null,
      }),
    }

    this.state = {
      action: null,
      categories: [{
          id: 12,
          title: 'hello',
        },
        {
          id: 34,
          title: 'oi',
        }],
      items: [],
      files: [],
      curCategory: this.blank.category(),
      curItem: this.blank.item(),
      curImage: this.blank.image(),
      isBusy: false,
    }
  }

  // Fetches data from the server.
  fetch({mode, type, id}) {
    print('........................fetching')
    var modify = this.modify
    type = this.types[type]  // Use `this.types` for singular to plural conversion for the REST API.
    var obj = {}

    if (type == undefined) return  // If the type couldn't be found return.

    var p = api.get(type, id)
    // .then(([data, resp]) => (modify(data, type), [data, resp]))
    .then(([data, resp]) => (obj[type] = data, [data, resp]))

    // Branch the promise here to fetch the attached image
    // if the first element is an `item` with an `image` prop.
    var p2 = p.then(([data]) => {
      if (data[0] && data[0].image)
        return api.get('files', data[0].image)
      else
        return []
    })
    // .then(([data]) => modify(data, 'files'))
    .then(([data]) => (obj['files'] = data, [data]))

    // Continue the original branch fetching the alternate data:
    // `items` if `categories` or `categories` if `items`.
    p = p.then(([data, resp]) => {
      var ids = data.reduce((acc, val) => acc.concat(val[type]), []).filter(e => e !== undefined)

      if (ids.length)
        return api.get(this.typesInv[type], ids)
      else
        return [[], resp]
    })
    // .then(([data, resp]) => (modify(data, this.typesInv[type]), [data, resp]))
    .then(([data, resp]) => (obj[this.typesInv[type]] = data, [data, resp]))

    var p3 = Promise.all([p, p2])
    .then(([data, resp]) => (this.setState(obj), [obj]))

    return p3
  }

  // Saves the current state of an item, category or image to the server.
  save({curCategory, curItem, curImage}) {
    var modify = this.modify
    var {location, history} = this.props

    return Promise.resolve(curImage.blob ? api.add('files', null, curImage, 'form') : [{id: curImage.id}])
    .catch(([data, resp]) => {
      if ('id' in data)
        return [data, resp]
      else
        throw [data, resp]
    })
    .then(([data]) => {
      modify(data.id, 'curItem', 'image')
      modify(data.id, 'curImage', 'id')
      curItem.image = data.id
      curImage.id = data.id

      if (curItem.id != null)
        return api.set('items', curItem.id, curItem)
      else
        return api.add('items', null, curItem)
    })
    .catch(([err, resp]) => print(err))
    .then(([data, resp]) => {
      curItem.id = data.id
      var path = location.pathname.split('/')
      path = (path.splice(-1, 1, data.id), path.join('/'))
      history.replace(path)
      return [data, resp]
    })
  }

  // Deletes an item or category from the server.
  remove({curCategory, curItem}) {
    var modify = this.modify

    if (curItem.id) {
      return api.rem('items', curItem.id)
      .then(([data, resp]) => print(data))
      .catch(([err, resp]) => print(err))
    }
    else
      return Promise.reject('Object must exist (needs an id).')
  }

  setCurObjs(id, data) {
    var state = this.state
    var obj = {}

    if (id != null) {
      obj.curItem = data.items.length > 0 ? {...data.items[0]} : state.curItem
      obj.curImage = data.files.length > 0 ? {...data.files[0]} : state.curImage
      obj.curCategory = data.categories.length > 0 ? {...data.categories[0]} : state.curCategory
      this.setState(obj)
    }
    else {
      obj.curItem = this.blank.item()
      obj.curImage = this.blank.image()
      obj.curCategory = this.blank.category()
      this.setState(obj)
    }
  }

  // Tries to fetch data with the initial props.
  componentDidMount() {
    var state = this.state
    print('......................mounted')
    this.fetch(this.props)
    .then(([data]) => this.setCurObjs(this.props.id, data))
  }

  // Fetches data whenver the view changes and there are new props.
  componentWillReceiveProps(nextProps) {
    print('......................props')
    var state = this.state
    var {mode, type, id} = this.props

    // if (state.items.length == 1 && state.items[0].id != state.curItem.id)
    //   modify(state.items[0], 'curItem')

    if (nextProps.type == type && nextProps.id == id)
      return

    print('......................loading')


    this.fetch(nextProps)
    .then(([data]) => this.setCurObjs(nextProps.id, data))
  }

  componentDidUpdate(prevProps, prevState) {
    print('......................updated')
    var modify = this.modify
    var state = this.state

    if (state.action) {
      // if (state.curCategory !== prevState.curCategory)
        var curCategory = state.curCategory

      // if (state.curItem !== prevState.curItem)
        var curItem = state.curItem

      // if (state.curImage !== prevState.curImage)
        var curImage = state.curImage
    }

    if (state.action == 'save' && (curCategory || curItem || curImage)) {
      modify(true, 'isBusy')
      this.save({curCategory, curItem, curImage})
      .finally(() => (state.action = null, modify(false, 'isBusy')))
    }
    else if (state.action == 'remove') {
      modify(true, 'isBusy')
      this.remove({curCategory, curItem})
      .finally(() => (state.action = null, modify(false, 'isBusy')))
    }

    state.action = null
  }

  render() {
    print('......................rendering')
    var content = []
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)
    var modify = this.modify
    var singleItem = false
    var singleCategory = false
    var {mode, type, id} = this.props
    print(mode, type, id)

    var testCats = [{
      id: 12,
      title: 'hello',
    },
    {
      id: 34,
      title: 'oi',
    }]

    if (type == 'item') {
      if (this.state.items.length == 1 && id != null)
        singleItem = true
      else if (mode == 'edit' && id == null)
        singleItem = true
    }
    else if (type == 'category') {
      if (this.state.categories.length == 1 && id != null)
        singleCategory = true
      else if (mode == 'edit' && id == null)
        singleCategory = true
    }


    if (singleItem) {
      print('singleItem', mode, type, id, this.state.items[0])
      content = [Item({...this.state, setField, modify, mode})]
    }
    else if (singleCategory) {
      print('singleCategory')
    }
    else if (mode == 'view' && id === null) {
      content = [
        h('h2', null, 'View Items'),
        h(GridList, {cellHeight: 180, cols: 4},
          this.state.items.map((item) => (
            h(GridTile, {
              key: item.id,
              containerElement: h(Link, {to: `/view/item/${item.id}`}),
              title: item.title,
              subtitle: item.author,
              actionIcon: h(Link, {to: `/edit/item/${item.id}`}, h(IconButton, null, h(EditorModeEdit))),
              style: {borderRadius: '4px'},
            },
              h('img', {src: `/api/files/${item.image}/blob`})
            )
          ))
        )
      ]
    }
    else {
      print('Not found', mode, type, id, this.state.items[0])
      content = [h('h2', {style: {textAlign: 'center'}}, 'Not found')]
    }

    return h(Theme, {theme: darkTheme},
      h('div', {style: layout({dr: 'v.', mg: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
