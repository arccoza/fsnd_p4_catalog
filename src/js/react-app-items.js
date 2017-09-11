import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile, Subheader, TextField, SelectField,
  MenuItem, Paper, RaisedButton} from './widgets'
import {Link} from 'react-router-dom'
import {EditItem} from './react-app-items-edit'
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

    this.state = {
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
      curCategory: {
        id: null,
        title: '',
        description: '',
        items: [],
        author: '',
      },
      curItem: {
        id: null,
        image: null,
        title: '',
        description: '',
        categories: [],
        author: 'Brock Samson',
      },
      curImage: {
        id: null,
        name: '',
        type: null,
        blob: null,
      },
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

  render() {
    // print(this.state.items)
    var content
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)
    var modify = this.modify
    var {mode, type, id} = this.props

    this.state.curCategory = this.state.categories[0] || this.state.curCategory
    this.state.curItem = this.state.items[0] || this.state.curItem
    this.state.curImage = this.state.files[0] || this.state.curImage

    if (mode == 'edit') {
      content = EditItem({...this.state, setField, modify})
    }
    else {
      content = [
        h('h2', null, 'View '),
        h(GridList, {cellHeight: 180, cols: 4},
          h(Subheader, null, 'December'),
          this.state.items.map((item) => (
            h(GridTile, {
              key: item.id,
              containerElement: h(Link, {to: '/view/item/' + item.id}),
              title: item.title,
              subtitle: item.author,
              style: {borderRadius: '4px'}
            },
              h('img', {src: `/api/files/${item.image}/blob`})
            )
          ))
        )
      ]
    }

    return h(Theme, {theme: darkTheme},
      h('div', {style: layout({dr: 'v.', mg: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
