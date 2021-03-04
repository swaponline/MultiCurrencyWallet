"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
message RPC {
  repeated SubOpts subscriptions = 1;
  repeated Message msgs = 2;
  optional ControlMessage control = 3;

  message SubOpts {
    optional bool subscribe = 1; // subscribe or unsubcribe
    optional string topicID = 2;
  }

  message Message {
    optional bytes from = 1;
    optional bytes data = 2;
    optional bytes seqno = 3;
    repeated string topicIDs = 4; 
    optional bytes signature = 5;
    optional bytes key = 6;
  }

  message ControlMessage {
    repeated ControlIHave ihave = 1;
    repeated ControlIWant iwant = 2;
    repeated ControlGraft graft = 3;
    repeated ControlPrune prune = 4;
  }

  message ControlIHave {
    optional string topicID = 1;
    repeated bytes messageIDs = 2;
  }

  message ControlIWant {
    repeated bytes messageIDs = 1;  
  }

  message ControlGraft {
    optional string topicID = 1;
  }

  message ControlPrune {
    optional string topicID = 1;
    repeated PeerInfo peers = 2;
    optional uint64 backoff = 3;
  }

  message PeerInfo {
    optional bytes peerID = 1;
    optional bytes signedPeerRecord = 2;
  }
}`;
