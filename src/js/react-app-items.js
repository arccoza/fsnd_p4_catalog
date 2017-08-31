import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile} from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import {layout} from './utils'
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
    this.state = {
      categories: [{
          id: '',
          title: 'hello',
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
      }
    }
  }

  componentDidMount = () => {
    // this.fetch()
  }

  fetch = () => {
    return api.get('categories', this.props.id)
    .then(resp => {
      // this.setState({categories: resp})
      this.state.categories = resp
      // Gather all the ids from each category into one array
      var ids = resp.reduce((acc, val) => acc.concat(val.items), [])
      return api.get('items', ids)
    })
    .then(resp => {
      this.setState({items: resp})
      return resp
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load content.'})
    })
  }

  render() {
    // print(this.props.match)
    var content
    var setField = (obj, fld, idx) => ev => {
      this.setState({
        [obj]: {
          ...this.state[obj],
          [fld]: ev.target.value
        }
      })
    }

    if (this.props.match.params.mode == 'edit') {
      var col1 = h('div', {style: layout({dr: 'v', 'jc': '<'})},
        h('h2', null, 'Edit Item'),
        h(TextField, {
          hintText: 'ex: Snowboard',
          floatingLabelText: 'Enter item name',
          value: this.state.curItem.title,
          onChange: setField('curItem', 'title'),
        }),
        h(TextField, {
          hintText: 'ex: An awesome snowboard',
          floatingLabelText: 'Enter item description',
          value: this.state.curItem.description,
          onChange: setField('curItem', 'description'),
        }),
        h(SelectField, {
          floatingLabelText: 'Select a category',
          value: this.state.curItem.categories,
          listStyle: {backgroundColor: '#fff'},
          menuItemStyle: {color: '#00bcd4'},
          onChange: setField('curItem', 'categories'),
        },
          this.state.categories.map(cat => (
              h(MenuItem, {key: cat.id, value: cat.id, primaryText: cat.title})
            )
          )
        ),
        h(TextField, {
          hintText: 'ex: Hank Venture',
          floatingLabelText: 'The author of this item',
          value: this.state.curItem.author,
        }),
        h(TextField, {
          hintText: 'ex: item.png',
          floatingLabelText: 'An image of the item',
          value: this.state.curImage.name,
          onTouchTap: ev => this.fileInput.click()
        }),
        h('input', {
          ref: el => this.fileInput = el,
          type: 'file',
          accept: 'image/*',
          style: {display: 'none'},
          onChange: ev => {
            if (ev.target.files) {
              var file = ev.target.files[0]
              this.setState({
                curImage: {
                  name: file.name,
                  type: file.type,
                  blob: file,
                }
              })
            }
          },
        }),
        h(RaisedButton, {
          label: 'Save',
          primary: true,
          style: {margin: '1em 0 0 0'},
          onTouchTap: ev => {
            // print(this.state.curItem, this.state.curImage)
            api.add('files', null, this.state.curImage, 'form')
            .catch(([data, resp]) => {
              if ('id' in data)
                return data
              else
                throw [data, resp]
            })
            .then(data => {
              this.state.curItem.image = data.id
              this.state.curImage.image = data.id

              print(this.state.curItem)

              if (this.state.curItem.id != null)
                return api.set('items', this.state.curItem.id, this.state.curItem)
              else
                return api.add('items', null, this.state.curItem)
            })
            .then(([data]) => print(data))
          }
        }),
      )

      var col2 = h(Theme, {theme: lightTheme},
        h(Paper, {style: layout({dr: 'v', fx: '1', mg: '0 0 0 3em', pd: '1em'})},
          h('img', {
            style: {maxWidth: '100%'},
            src: this.state.curImage.blob instanceof Blob && URL.createObjectURL(this.state.curImage.blob)
          })
        )
      )

      content = [h('div', {style: layout({dr: 'h'})}, col1, col2)]
    }
    else {
      content = [
        h('h2', null, 'View'),
        h(GridList, {cellHeight: 180, cols: 4},
          h(Subheader, null, 'December'),
          this.state.items.map((item) => (
            h(GridTile, {key: item.id, title: item.title, subtitle: item.author},
              h('img', {src: item.image})
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
