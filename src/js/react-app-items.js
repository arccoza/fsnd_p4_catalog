import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile} from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


const vlayout = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const hlayout = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const layoutStack = {
  position: 'relative',
  display: 'flex',
  // width: '100%',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

function merge(...objs) {
  return Object.assign({}, ...objs)
}

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
        image: null,
        title: '',
        description: '',
        categories: [],
        author: 'Brock Samson',
      },
      curImage: {
        name: '',
        content: null,
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
    print(this.props.match)
    var content

    if (this.props.match.params.mode == 'edit') {
      var col1 = h('div', {style: merge(vlayout, {justifyContent: 'flex-start'})},
        h('h2', null, 'Edit Item'),
        h(TextField, {
          hintText: 'ex: Snowboard',
          floatingLabelText: 'Enter item name',
          value: this.state.curItem.name,
          onChange: ev => {
            this.setState({
              curItem: {
                // ...this.state.curItem,
                name: ev.target.value
              }
            })
          }
        }),
        h(SelectField, {
          floatingLabelText: 'Select a category',
          value: this.state.curItem.categories,
          listStyle: {backgroundColor: '#fff'},
          menuItemStyle: {color: '#00bcd4'},
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
              // URL.createObjectURL(blob)
              this.setState({
                curImage: {
                  name: file.name,
                  content: file,  // TODO
                }
              })
            }
          },
        }),
      )

      var col2 = h(Theme, {theme: lightTheme},
        h(Paper, {style: merge(vlayout, {flex: 1, margin: '0 0 0 3em', padding: '1em'})},
          h('img', {
            style: {maxWidth: '100%'},
            src: this.state.curImage.content instanceof Blob && URL.createObjectURL(this.state.curImage.content)
          })
        )
      )

      content = [h('div', {style: hlayout}, col1, col2)]
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
      h('div', {style: merge(layoutStack, {margin: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
