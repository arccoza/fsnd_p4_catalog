import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {TextField, SelectField, MenuItem, Paper, RaisedButton, Chip} from './widgets'
import {layout} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


export function EditItem({categories, curItem, curImage, setField, modify}) {
  var fileInput

  var col1 =
  h('div', {style: layout({dr: 'v', 'jc': '<'})},
    h('h2', null, 'Edit Item'),
    h(TextField, {
      hintText: 'ex: Snowboard',
      floatingLabelText: 'Enter item name',
      value: curItem.title,
      onChange: setField('curItem', 'title'),
    }),
    h(TextField, {
      hintText: 'ex: An awesome snowboard',
      floatingLabelText: 'Enter item description',
      value: curItem.description,
      onChange: setField('curItem', 'description'),
    }),
    h(SelectField, {
      floatingLabelText: 'Select a category',
      value: curItem.categories,
      listStyle: {backgroundColor: '#fff'},
      menuItemStyle: {color: '#00bcd4'},
      multiple: true,
      onChange: (ev, k, v) => modify(v, 'curItem', 'categories'),
    },
      categories.map(cat => (
          h(MenuItem, {key: cat.id, value: cat.id, primaryText: cat.title})
        )
      )
    ),
    h(TextField, {
      hintText: 'ex: Hank Venture',
      floatingLabelText: 'The author of this item',
      value: curItem.author,
    }),
    h(TextField, {
      hintText: 'ex: item.png',
      floatingLabelText: 'An image of the item',
      value: curImage.name,
      onTouchTap: ev => fileInput.click()
    }),
    h('input', {
      ref: el => fileInput = el,
      type: 'file',
      accept: 'image/*',
      style: {display: 'none'},
      onChange: ({target:{files:[file]}}) => {
        if (file)
          modify({name: file.name, type: file.type, blob: file}, 'curImage')
      },
    }),
    h(RaisedButton, {
      label: 'Save',
      primary: true,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        // Promise.resolve(curImage.blob ? api.add('files', null, curImage, 'form') : null)
        api.add('files', null, curImage, 'form')
        .catch(([data, resp]) => {
          if ('id' in data)
            return data
          else
            throw [data, resp]
        })
        .then(data => {
          curItem.image = data.id
          curImage.id = data.id

          print(curItem)

          if (curItem.id != null)
            return api.set('items', curItem.id, curItem)
          else
            return api.add('items', null, curItem)
        })
        .then(([data]) => print(data))
      }
    }),
  )

  var cats = curItem.categories.map((v, i) => h(Chip, {key: v,
    onRequestDelete: ev => modify(null, 'curItem', 'categories', i),
    style: {margin: '0.25em'},
  }, (categories.find(e => e.id === v) || {}).title ))

  var col2 = h(Theme, {theme: lightTheme},
    h(Paper, {style: layout({dr: 'v', fx: '1', mg: '0 0 0 3em', pd: '1em'})},
      h('img', {
        style: {maxWidth: '100%'},
        src: curImage.blob instanceof Blob && URL.createObjectURL(curImage.blob)
      })
    )
  )

  return [h('div', {style: layout({dr: 'h'})}, col1, col2),
    h('div', {style: layout({dr: 'h', jc: '<', pd: '1em 0.75em 0 0.75em'})}, cats)]
}
