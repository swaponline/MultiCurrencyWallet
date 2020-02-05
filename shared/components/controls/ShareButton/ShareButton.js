import React from "react";
import PropTypes from 'prop-types'
import cssModules from "react-css-modules";
import styles from "./ShareButton.scss";
import shareIcon from './images/icon.svg';
 
const ShareButton =  ({ onClick }) => {
   
  return (
    <div styleName="WrapShareButton">

      <button styleName="shareButton"  onClick={onClick}   type="button" title="Share this article">
        <img src={shareIcon} alt='Open submenu' />
        <span>Share</span>
      </button>
      
    </div> 
  );
};

ShareButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}



export default cssModules(ShareButton, styles);
