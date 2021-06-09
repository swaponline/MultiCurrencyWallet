import React from 'react'
import PropTypes from 'prop-types'


export const withInfiniteScroll = () => Component => {
  class InfiniteScroll extends React.Component<any, any> {
    componentDidMount() {
      window.addEventListener('scroll', this.onScroll)
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll)
    }

    onScroll = () => {
      const { bottomOffset, items, itemsCount } = this.props

      const bottomSidePositionOnPage = document.documentElement.scrollTop + document.documentElement.clientHeight

      if (bottomSidePositionOnPage >= document.body.offsetHeight - bottomOffset && items.length !== itemsCount && items.length) {
        this.props.getMore()
      }
    }

    render() {
      const { getMore, bottomOffset, itemsCount, ...rest } = this.props
      return <Component {...rest} />
    }
  }

  //@ts-ignore
  InfiniteScroll.propTypes = {
    getMore: PropTypes.func,
    bottomOffset: PropTypes.number,
    items: PropTypes.array,
    itemsCount: PropTypes.number,
  }

  return InfiniteScroll
}
