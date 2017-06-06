import React from 'react'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Drawer from 'material-ui/Drawer'


export default class AppNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: []
    }
  }

  componentDidMount = () => {
    this.fetch()
  }

  fetch = () => {
    return fetch('/api/categories/', {
      method: 'get',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'Fetch'
      },
    })
    .then(resp => Promise.all([resp, resp.json()]))
    .then(([resp, json]) => {
      if(!resp.ok)
        throw json
      return json
    })
    .then(resp => {
      this.setState({categories: resp})
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load categories.'})
    })
  }

  render() {
    var categoryList = this.state.categories.map(cat => {
      return <ListItem key={cat.id} primaryText={cat.title} rightIcon={<NavigationChevronRight />} />
    })

    return (
      <Drawer
        docked={false}
        open={this.props.nav.isOpen}
        onRequestChange={(open, reason) => {
            this.props.pub('nav', {isOpen: false})
        }}
      >
        <List>
          <ListItem primaryText="Home" rightIcon={<NavigationChevronRight />} />
        </List>
        <Divider />
        <List>
          {categoryList}
        </List>
      </Drawer>
    )
  }
}
