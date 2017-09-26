import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {TextField, SelectField, MenuItem, Paper, RaisedButton,
  FlatButton, Chip, CircularProgress} from './widgets'
import {Link} from 'react-router-dom'
import {layout} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


function Text({value, children=[]}) {
  return h('div', {style: {
    width: '256px',
    height: '72px',
    lineHeight: '30px',
    ...layout({dr: 'v', jc: '+'})}},
    h('span', null, value, ...children),
  )
}

export function Item({categories, curItem, curImage, isBusy, setField, modify, mode}) {
  var fileInput
  var modeInv = {
    'edit': 'view',
    'view': 'edit',
  }

  var cats = curItem.categories.map((v, i) => h(Chip, {key: v,
    onRequestDelete: ev => modify(null, 'curItem', 'categories', i),
    style: {margin: '0.25em'},
  }, (categories.find(e => e.id === v) || {}).title ))

  var col1 =
  h('div', {style: layout({dr: 'v', 'jc': '<'})},
    h('h2', null, mode == 'edit' ? 'Edit Item' : 'View Item'),
    mode != 'edit' ? null : h(RaisedButton, {
      label: isBusy ? null : 'Save',
      disabled: isBusy,
      primary: true,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy) return
        modify({do: 'save', on: 'items'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    mode != 'edit' ? null : h(FlatButton, {
      label: isBusy ? null : 'Delete',
      disabled: isBusy || !curItem.id,
      style: {margin: '1em 0 0 0'},
      onTouchTap: ev => {
        if (isBusy || !curItem.id) return
        modify({do: 'remove', on: 'items'}, 'action')
      }
    }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'})),
    !curItem.id ? null : h(Link, {to: `/${modeInv[mode]}/item/${curItem.id}`},
      h(FlatButton, {
        label: isBusy ? null : mode == 'edit' ? 'view' : 'edit',
        disabled: isBusy || !curItem.id,
        style: {margin: '1em 0 0 0', width: '100%'},
      }, !isBusy ? null : h(CircularProgress, {size: 15, thickness: 1, className: 'CircularProgress'}))
    ),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Item name',
      hintText: 'ex: Snowboard',
      value: curItem.title,
      onChange: setField('curItem', 'title'),
    }),
    h(mode != 'edit' ? Text : TextField, {
      floatingLabelText: 'Item description',
      hintText: 'ex: An awesome snowboard',
      value: curItem.description,
      onChange: setField('curItem', 'description'),
    }),
    h(mode != 'edit' ? Text : TextField, {
      disabled: true,
      floatingLabelText: 'Item author',
      hintText: 'ex: Hank Venture',
      value: curItem.author || '',
      style: {cursor: 'default'}
    }),
    mode != 'edit' ? null : h(TextField, {
      floatingLabelText: 'Item image',
      hintText: 'ex: item.png',
      value: curImage.name,
      onTouchTap: ev => fileInput.click()
    }),
    h('input', {
      ref: el => fileInput = el,
      type: 'file',
      accept: 'image/*',
      style: {display: 'none'},
      onChange: ({target:{files:[file]}}) => {
        if (file) {
          modify({name: file.name, type: file.type, blob: file}, 'files', 0)
          modify({name: file.name, type: file.type, blob: file}, 'curImage')
        }
      },
    }),
    mode != 'edit' ? null : h(SelectField, {
      floatingLabelText: 'Select category',
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
    h('div', {style: layout({dr: 'h', jc: '<', pd: '1em 0 0 0'})}, cats),
  )

  var col2 =
  h(Theme, {theme: lightTheme},
    h(Paper, {style: layout({dr: 'v', jc: 'a', ai: '+', fx: '1', mg: '0 0 0 3em', pd: '1em'})},
      h('img', {
        style: {maxWidth: '100%', width: 'fit-content'},
        src: curImage.blob instanceof Blob ? URL.createObjectURL(curImage.blob) : `/api/files/${curImage.id}/blob`
      })
    )
  )

  return h('div', {style: layout({dr: 'h'})}, col1, col2)
}
