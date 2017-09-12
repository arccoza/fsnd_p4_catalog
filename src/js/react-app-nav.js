import React from 'react'
import {List, ListItem, Divider, Drawer} from './widgets'
import {NavigationClose, NavigationChevronRight} from './icons'
import {Link} from 'react-router-dom'
import api from './api'


export default class AppNav extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: []
    }
  }

  componentDidMount = () => {
  }

  render() {
    var categoryList = this.props.categories.map(cat => {
      return (
        <Link to={`/category/${cat.id}`} key={cat.id}>
          <ListItem
            primaryText={cat.title}
            rightIcon={<NavigationChevronRight />}
            onTouchTap={ev => this.props.pub('nav', {isOpen: false})}
          />
        </Link>
      )
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
          <Link to={'/'}>
            <ListItem
              primaryText='Home'
              rightIcon={<NavigationChevronRight />}
              onTouchTap={ev => this.props.pub('nav', {isOpen: false})}
            />
          </Link>
          <Link to={'/view/all'}>
            <ListItem
              primaryText='Items'
              rightIcon={<NavigationChevronRight />}
              onTouchTap={ev => this.props.pub('nav', {isOpen: false})}
            />
          </Link>
        </List>
        <Divider />
        <List>
          {categoryList}
        </List>
      </Drawer>
    )
  }
}
