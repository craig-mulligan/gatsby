import React, { createElement } from "react"
import loader from "./loader"
import emitter from "./emitter"
import { withRouter } from "react-router-dom"

const DefaultLayout = ({ children }) =>
  <div>
    {children()}
  </div>

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class ComponentRenderer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      location: props.location,
      pageResources: loader.getResourcesForPathname(props.location.pathname),
    }
  }

  componentWillReceiveProps(nextProps) {
    // hmm, would this ever be false?

    if (this.state.pageResources !== nextProps.pageResources) {
      const pageResources = loader.getResourcesForPathname(
        nextProps.location.pathname
      )
      if (!pageResources) {
        // Page resources won't be set in cases where the browser back button
        // or forward button is pushed as we can't wait as normal for resources
        // to load before changing the page.
        loader.getResourcesForPathname(
          nextProps.location.pathname,
          pageResources => {
            this.setState({
              location: nextProps.location,
              pageResources,
            })
          }
        )
      } else {
        this.setState({
          location: nextProps.location,
          pageResources,
        })
      }
    }
  }

  componentDidMount() {
    // Listen to events so when our page gets updated, we can transition.
    // This is only useful on delayed transitions as the page will get rendered
    // without the necessary page resources and then re-render once those come in.
    emitter.on(`onPostLoadPageResources`, e => {
      if (e.page.path === loader.getPage(this.state.location.pathname).path) {
        this.setState({ pageResources: e.pageResources })
      }
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Check if the component or json have changed.
    if (
      this.state.pageResources.component !== nextState.pageResources.component
    ) {
      return true
    }
    if (this.state.pageResources.layout !== nextState.pageResources.layout) {
      return true
    }
    if (this.state.pageResources.json !== nextState.pageResources.json) {
      return true
    }
    // Check if location has changed on a page using internal routing
    // via matchPath configuration.
    if (
      this.state.location.key !== nextState.location.key &&
      nextState.pageResources.page &&
      nextState.pageResources.page.matchPath
    ) {
      return true
    }
    return false
  }

  render() {
    if (this.state.pageResources) {
      return createElement(
        withRouter(this.state.pageResources.layout || DefaultLayout),
        {
          ...this.state.pageResources.layoutJson,
          ...this.props,
          children: layoutProps =>
            createElement(this.state.pageResources.component, {
              key: this.props.location.pathname,
              ...layoutProps,
              ...this.props,
              ...this.state.pageResources.json,
            }),
        }
      )
    } else {
      return null
    }
  }
}

export default ComponentRenderer
