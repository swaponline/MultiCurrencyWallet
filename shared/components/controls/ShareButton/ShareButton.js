import React from "react";
import styles from "./ShareButton.scss";
import shareIcon from './images/icon.svg';
import actions from "redux/actions";
import CSSModules from 'react-css-modules'
import { constants } from "helpers";
import Button from 'components/controls/Button/Button'

const ShareBustton =  ({ onClick }) => {
   
  return (
    <div styleName="WrapShareButton">

      <button styleName="shareButton"  onClick={onClick}   type="button" title="Share this article">
        <img src={shareIcon} alt='Open submenu' />
        <span>Share</span>
      </button>
      
    </div> 
  );
};

@CSSModules(styles, { allowMultiple: true })

export default class ShareButton extends React.Component {

  openShareModal = () => {
    const { link, title } = this.props
    actions.modals.open(constants.modals.Share, {
      link: link,
      title: title
    })
  }
  render() {
    return (
      <div styleName="WrapShareButton">
        <Button blue onClick={this.openShareModal}   type="button" title="Share this article">
    
          <span>
            <img src={shareIcon} alt='Share' />
            Share</span>
        </Button>
      </div> 
    );

  }

}


