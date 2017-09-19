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

  fetch({mode, type, id}) {
    var modify = this.modify
    type = this.types[type]  // Use `this.types` for singular to plural conversion for the REST API.

    if (type == undefined) return  // If the type couldn't be found return.

    var p = api.get(type, id)
    .then(([data, resp]) => (modify(data, type), [data, resp]))

    // Branch the promise here to fetch the attached image
    // if the first element is an `item` with an `image` prop.
    p.then(([data]) => {
      if (data[0] && data[0].image)
        return api.get('files', data[0].image)
      else
        return []
    })
    .then(([data]) => modify(data, 'files'))

    // Continue the original branch fetching the alternate data:
    // `items` if `categories` or `categories` if `items`.
    p = p.then(([data, resp]) => {
      var ids = data.reduce((acc, val) => acc.concat(val[type]), []).filter(e => e !== undefined)

      if (ids.length)
        return api.get(this.typesInv[type], ids)
      else
        return [[], resp]
    })
    .then(([data, resp]) => (modify(data, this.typesInv[type]), [data, resp]))
  }

  componentDidMount() {
    this.fetch(this.props)
  }

  componentWillReceiveProps(nextProps) {
    var {mode, type, id} = this.props

    if (nextProps.type === type && nextProps.id === id)
      return

    this.fetch(nextProps)
  }

  // componentWillUpdate(nextProps, nextState) {

  // }

  save({curCategory, curItem, curImage}) {
    var modify = this.modify
    print(curCategory, curItem, curImage)
    // return Promise.resolve(true)

    return Promise.resolve(curImage.blob ? api.add('files', null, curImage, 'form') : [{id: curImage.id}])
    .catch(([data, resp]) => {
      print('resp set img: ', data, resp)
      if ('id' in data)
        return [data, resp]
      else
        throw [data, resp]
    })
    .then(([data]) => {
      print('set item: ', data)
      modify(data.id, 'curItem', 'image')
      modify(data.id, 'curImage', 'id')
      curItem.image = data.id
      curImage.id = data.id
      print('curItem')

      if (curItem.id != null)
        return api.set('items', curItem.id, curItem)
      else
        return api.add('items', null, curItem)
    })
  }

  remove({curCategory, curItem}) {
    var modify = this.modify

    if (curItem.id) {
      return api.rem('items', curItem.id)
      .then(resp => print(resp))
      .catch(err => print(err))
    }
    else
      return Promise.reject('Object must exist (needs an id).')
  }

  componentDidUpdate(prevProps, prevState) {
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
    // print(this.state.items)
    var content
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)
    var modify = this.modify
    var {mode, type, id} = this.props
    // print(mode, type, id)

    var testCats = [{
      id: 12,
      title: 'hello',
    },
    {
      id: 34,
      title: 'oi',
    }]

    if (id == null) {
      var curCategory = this.state.curCategory = this.blank.category()
      var curItem = this.state.curItem = this.blank.item()
      var curImage = this.state.curImage = this.blank.image()
    }
    else {
      var curCategory = this.state.curCategory = this.state.categories[0] || this.state.curCategory
      var curItem = this.state.curItem = this.state.items[0] || this.state.curItem
      var curImage = this.state.curImage = this.state.files[0] || this.state.curImage
    }


    if (type == 'item') {
      if ((id !== null && this.state.items[0] && this.state.items[0].id == id) || (id === null && mode == 'edit'))
        var singleItem = true
    }
    else if (type == 'category') {
      if ((id !== null && this.state.categories[0] && this.state.categories[0].id == id) || (id === null && mode == 'edit'))
        var singleCategory = true
    }

    if (singleItem) {
      content = [Item({...this.state, setField, modify, mode})]
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
      content = ['not found']
    }

    return h(Theme, {theme: darkTheme},
      h('div', {style: layout({dr: 'v.', mg: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
