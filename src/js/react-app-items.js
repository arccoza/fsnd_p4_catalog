import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile, Subheader, TextField, SelectField,
  MenuItem, Paper, RaisedButton} from './widgets'
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

    this.state = {
      categories: [{
          id: 12,
          title: 'hello',
        },
        {
          id: 34,
          title: 'oi',
        }],
      items: tilesData,
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

  componentDidMount = () => {
    // this.fetch()
    var modify = this.modify
    var {mode, type, id} = this.props
    type = this.types[type]  // Use `this.types` for singular to plural conversion for the REST API.

    if (type == undefined) return  // If the type couldn't be found return.

    var p = api.get(type, id)
    .then(([data, resp]) => (modify(data, type), [data, resp]))
    .then(([data, resp]) => {
      var ids = data.reduce((acc, val) => acc.concat(val[type]), []).filter(e => e !== undefined)
      print(this.typesInv[type], ids)
      if (ids.length)
        return api.get(this.typesInv[type], ids)
      else
        return [[], resp]
    })
    .then(([data, resp]) => (modify(data, this.typesInv[type]), [data, resp]))
  }

  // fetch = () => {
  //   return api.get('categories', this.props.id)
  //   .then(resp => {
  //     // this.setState({categories: resp})
  //     this.state.categories = resp
  //     // Gather all the ids from each category into one array
  //     var ids = resp.reduce((acc, val) => acc.concat(val.items), [])
  //     return api.get('items', ids)
  //   })
  //   .then(resp => {
  //     this.setState({items: resp})
  //     return resp
  //   })
  //   .catch(err => {
  //     this.props.pub('message', {isOpen:true, content: 'Couldn\'t load content.'})
  //   })
  // }

  render() {
    // print(this.state.items)
    var content
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)
    var modify = this.modify
    var {id, cat, mode} = this.props

    if (mode == 'edit') {
      content = EditItem({...this.state, setField, modify})
    }
    else {
      content = [
        h('h2', null, 'View'),
        h(GridList, {cellHeight: 180, cols: 4},
          h(Subheader, null, 'December'),
          this.state.items.map((item) => (
            h(GridTile, {key: item.id, title: item.title, subtitle: item.author},
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
