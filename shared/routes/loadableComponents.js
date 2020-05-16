import loadable from "@loadable/component";

export const SwapComponent = loadable(() => import('pages/Swap/Swap'));
export const Home = loadable(() => import('pages/Home/Home'));
export const History = loadable(() => import('pages/History/History'));
export const CreateWallet = loadable(() => import('pages/CreateWallet/CreateWallet'));
export const NotFound = loadable(() => import('pages/NotFound/NotFound'));
export const About = loadable(() => import('pages/About/About'));
export const Wallet = loadable(() => import('pages/Wallet/Wallet'));
export const Currency = loadable(() => import('pages/Currency/Currency'));
export const PartialClosure = loadable(() => import('pages/PartialClosure/PartialClosure'));
export const PointOfSell = loadable(() => import('pages/PointOfSell/PointOfSell'));
export const CurrencyWallet = loadable(() => import('pages/CurrencyWallet/CurrencyWallet'));
export const Transaction = loadable(() => import('pages/Transaction/Transaction'));
export const IEO = loadable(() => import('pages/IEO/IEO'));
export const BtcMultisignProcessor = loadable(() => import('pages/Multisign/Btc/Btc'));
export const CreateInvoice = loadable(() => import('pages/Invoices/CreateInvoice'));
export const InvoicesList = loadable(() => import('pages/Invoices/InvoicesList'));
export const Invoice = loadable(() => import('pages/Invoices/Invoice'));

export default {
    SwapComponent,
    Home,
    History,
    CreateWallet,
    NotFound,
    About,
    Wallet,
    Currency,
    PartialClosure,
    PointOfSell,
    CurrencyWallet,
    Transaction,
    IEO,
    BtcMultisignProcessor,
    CreateInvoice,
    InvoicesList,
    Invoice,
};
