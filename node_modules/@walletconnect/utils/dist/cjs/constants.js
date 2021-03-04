"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservedEvents = [
    "session_request",
    "session_update",
    "exchange_key",
    "connect",
    "disconnect",
    "display_uri",
    "modal_closed",
    "transport_open",
    "transport_close",
    "transport_error",
];
exports.signingMethods = [
    "eth_sendTransaction",
    "eth_signTransaction",
    "eth_sign",
    "eth_signTypedData",
    "eth_signTypedData_v1",
    "eth_signTypedData_v2",
    "eth_signTypedData_v3",
    "eth_signTypedData_v4",
    "personal_sign",
];
exports.stateMethods = ["eth_accounts", "eth_chainId", "net_version"];
exports.mobileLinkChoiceKey = "WALLETCONNECT_DEEPLINK_CHOICE";
//# sourceMappingURL=constants.js.map