import OfferModal from './OfferModal/OfferModal'
import LimitOrder from './LimitOrder'
import WithdrawModal from './WithdrawModal/WithdrawModal'
import WithdrawModalMultisigUser from './WithdrawModalMultisig/WithdrawModalMultisigUser'
import PrivateKeysModal from './PrivateKeysModal/PrivateKeysModal'
import ReceiveModal from './ReceiveModal/ReceiveModal'
import DownloadModal from './DownloadModal/DownloadModal'
import DeclineOrdersModal from './DeclineOrdersModal/DeclineOrdersModal'
import IncompletedSwaps from './IncompletedSwaps/IncompletedSwaps'
import CurrencyAction from './CurrencyAction/CurrencyAction'
import Confirm from './Confirm/Confirm'
import ConfirmBeginSwap from './ConfirmBeginSwap/ConfirmBeginSwap'
import MultisignJoinLink from './MultisignJoinLink/MultisignJoinLink'
import InvoiceModal from './InvoiceModal/InvoiceModal'
import InvoiceLinkModal from './InvoiceLinkModal/InvoiceLinkModal'
import AlertModal from './Alert/AlertModal'
import AddCustomToken from './AddCustomToken'
import BtcMultisignSwitch from './BtcMultisignSwitch/BtcMultisignSwitch'
import ShareModal from './Share/Share'
import BtcMultisignConfirmTx from './BtcMultisignConfirmTx/BtcMultisignConfirmTx'
import SaveMnemonicModal from './SaveMnemonicModal/SaveMnemonicModal'
import RestoryMnemonicWallet from './RestoryMnemonicWallet/RestoryMnemonicWallet'
import HowToWithdrawModal from './HowToWithdrawModal/HowToWithdrawModal'
import InfoInvoice from './InfoInvoice/InfoInvoice'

import RegisterPINProtected from './RegisterPINProtected/RegisterPINProtected'

import WithdrawBtcPin from './WithdrawBtcPin/WithdrawBtcPin'
import WithdrawBtcMultisig from './WithdrawBtcMultisig/WithdrawBtcMultisig'

import WalletAddressModal from './WalletAddressModal/WalletAddressModal'

import AlertWindow from "./AlertWindow"

import ConnectWalletModal from './ConnectWalletModal/ConnectWalletModal'
import WalletConnectAccount from './WalletConnectAccount/WalletConnectAccount'

// Shamir's Secret-Sharing for Mnemonic Codes
import ShamirsSecretRestory from './ShamirsSecretRestory/ShamirsSecretRestory'
import ShamirsSecretSave from './ShamirsSecretSave/ShamirsSecretSave'
import RestoreWalletSelectMethod from './RestoreWalletSelectMethod/RestoreWalletSelectMethod'
import SaveWalletSelectMethod from './SaveWalletSelectMethod/SaveWalletSelectMethod'


export default {
  DeclineOrdersModal,
  ShareModal,
  OfferModal,
  LimitOrder,
  WithdrawModal,
  WithdrawModalMultisigUser, // Deprecated
  PrivateKeysModal,
  ReceiveModal,
  DownloadModal,
  IncompletedSwaps,
  Confirm,
  ConfirmBeginSwap,

  MultisignJoinLink,
  CurrencyAction,
  InvoiceModal,
  InvoiceLinkModal,
  AlertModal,
  AddCustomToken,
  BtcMultisignSwitch,
  BtcMultisignConfirmTx,

  HowToWithdrawModal,
  InfoInvoice,

  RegisterPINProtected,
  WithdrawBtcPin,

  WalletAddressModal,

  WithdrawBtcMultisig, 

  AlertWindow,

  ConnectWalletModal,
  WalletConnectAccount,

  ShamirsSecretRestory,
  ShamirsSecretSave,
  RestoreWalletSelectMethod,
  SaveWalletSelectMethod,
  SaveMnemonicModal,
  RestoryMnemonicWallet,
}
