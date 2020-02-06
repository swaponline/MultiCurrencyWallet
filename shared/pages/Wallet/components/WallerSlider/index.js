import React from "react";

import { constants } from "helpers";
import actions from "redux/actions";

import security from "../NotityBlock/images/security.svg";
import mail from "../NotityBlock/images/mail.svg";
import info from "../NotityBlock/images/info-solid.svg";

import Slider from "react-slick";
import NotifyBlock from "pages/Wallet/components/NotityBlock/NotifyBock";

import { FormattedMessage } from "react-intl";

const handleShowKeys = () => {
  actions.modals.open(constants.modals.DownloadModal);
};

const handleSaveKeys = () => {
  actions.modals.open(constants.modals.PrivateKeys);
};

const handleSignUp = () => {
  actions.modals.open(constants.modals.SignUp);
};

export default props => {
  const {
    settings,
    isPrivateKeysSaved,
    isClosedNotifyBlockSignUp,
    isSigned,
    isClosedNotifyBlockBanner,
    handleNotifyBlockClose,
    host
  } = props;
  return (
    <Slider {...settings}>
      {!isPrivateKeysSaved && (
        <NotifyBlock
          className="notifyBlockSaveKeys"
          descr={
            <FormattedMessage id="descr279" defaultMessage="Before you continue be sure to save your private keys!" />
          }
          tooltip={
            <FormattedMessage
              id="descr280"
              defaultMessage="We do not store your private keys and will not be able to restore them"
            />
          }
          icon={security}
          firstBtn={<FormattedMessage id="descr282" defaultMessage="Show my keys" />}
          firstFunc={handleShowKeys}
          secondBtn={<FormattedMessage id="descr284" defaultMessage="I saved my keys" />}
          secondFunc={handleSaveKeys}
        />
      )}
      {(host === "localhost" || host === "swaponline.io") && (
        <NotifyBlock
          className="notifyBlockBanner"
          descr={
            <FormattedMessage
              id="descr295"
              defaultMessage="Store Bitcoin and other cryptocurrencies without installing a wallet"
            />
          }
          tooltip={
            <FormattedMessage
              id="descr296"
              defaultMessage="Secured transactions with SMS verification. Exchange cryptocurrencies with no threat of hold (Atomic Swap). [Start exchanging]"
            />
          }
          icon={info}
          firstFunc={handleSignUp}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockSignUp")}
        />
      )}

      {(host === "localhost" || host === "swaponline.io") && (
        <NotifyBlock
          className="notifyBlockBanner"
          descr={
            <FormattedMessage
              id="descr297"
              defaultMessage="Store Bitcoin and other cryptocurrencies without installing a wallet"
            />
          }
          tooltip={
            <FormattedMessage
              id="descr298"
              defaultMessage="Secured transactions with SMS verification. Exchange cryptocurrencies with no threat of hold (Atomic Swap). [Start exchanging]"
            />
          }
          icon={info}
          firstFunc={handleSignUp}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockSignUp")}
        />
      )}

      {(host === "localhost" || host === "swaponline.io") && (
        <NotifyBlock
          className="notifyBlockBanner"
          descr={
            <FormattedMessage
              id="descr299"
              defaultMessage="Store Bitcoin and other cryptocurrencies without installing a wallet"
            />
          }
          tooltip={
            <FormattedMessage
              id="descr300"
              defaultMessage="Secured transactions with SMS verification. Exchange cryptocurrencies with no threat of hold (Atomic Swap). [Start exchanging]"
            />
          }
          icon={info}
          firstFunc={handleSignUp}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockSignUp")}
        />
      )}

      {(host === "localhost" || host === "swaponline.io") && (
        <NotifyBlock
          className="notifyBlockBanner"
          descr={
            <FormattedMessage
              id="descr304"
              defaultMessage="Store Bitcoin and other cryptocurrencies without installing a wallet"
            />
          }
          tooltip={
            <FormattedMessage
              id="descr305"
              defaultMessage="Secured transactions with SMS verification. Exchange cryptocurrencies with no threat of hold (Atomic Swap). [Start exchanging]"
            />
          }
          icon={info}
          firstFunc={handleSignUp}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockSignUp")}
        />
      )}

      {/* {!isSigned && !isClosedNotifyBlockSignUp && (
        <NotifyBlock
          className="notifyBlockSignUp"
          descr={<FormattedMessage id="descr291" defaultMessage="Sign up and get your free cryptocurrency for test!" />}
          tooltip={
            <FormattedMessage
              id="descr292"
              defaultMessage="You will also be able to receive notifications regarding updates with your account"
            />
          }
          firstBtn={<FormattedMessage id="descr293" defaultMessage="Sign Up" />}
          secondBtn={<FormattedMessage id="descr294" defaultMessage="I’ll do this later" />}
          icon={mail}
          firstFunc={handleSignUp}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockSignUp")}
        />
      )} */}
      {!isClosedNotifyBlockBanner && (
        <NotifyBlock
          descr={<FormattedMessage id="descr301" defaultMessage="Updates" />}
          tooltip={
            <FormattedMessage
              id="descr302"
              defaultMessage="Let us notify you that the main domain name for Swap.online exchange service will be changed from swap.online to swaponline.io."
            />
          }
          secondBtn={<FormattedMessage id="descr303" defaultMessage="Close" />}
          className="notifyBlockBanner"
          icon={info}
          secondFunc={() => handleNotifyBlockClose("isClosedNotifyBlockBanner")}
        />
      )}
    </Slider>
  );
};
