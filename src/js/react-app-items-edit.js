export function ViewItems(props) {
  var col1 =
  h('div', {style: layout({dr: 'v', 'jc': '<'})},
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

  return [h('div', {style: layout({dr: 'h'})}, col1, col2)]
}
