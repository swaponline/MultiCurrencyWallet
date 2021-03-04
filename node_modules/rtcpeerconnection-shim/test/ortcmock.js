/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
/* eslint-env node */
const EventEmitter = require('events');

module.exports = function(window) {
  // required by the shim to mock an EventEmitter.
  global.document = {
    createDocumentFragment: () => {
      let e = new EventEmitter();
      e.addEventListener = e.addListener.bind(e);
      e.removeEventListener = e.removeListener.bind(e);
      e.dispatchEvent = function(ev) {
        e.emit(ev.type, ev);
      };
      return e;
    }
  };
  global.Event = function(type) {
    this.type = type;
  };

  window.RTCSessionDescription = function(init) {
    return init;
  };

  const RTCIceGatherer = function(options) {
    this.component = 'rtp';

    this._emitter = new EventEmitter();
    this.addEventListener = this._emitter.addListener.bind(this);
    this.removeEventListener = this._emitter.removeListener.bind(this);
    this.dispatchEvent = (ev) => {
      this._emitter.emit(ev.type, ev);
    };

    let candidates = [
      {
        foundation: '702786350',
        priority: 41819902,
        protocol: 'udp',
        ip: '8.8.8.8',
        port: 60769,
        type: 'host'
      },
      {}
    ];
    this._emittedCandidates = [];
    let emitCandidate = () => {
      let e = new Event('RTCIceGatherEvent');
      e.candidate = candidates.shift();
      if (Object.keys(e.candidate).length) {
        this._emittedCandidates.push(e.candidate);
      }
      if (this.onlocalcandidate) {
        this.onlocalcandidate(e);
      }
      if (candidates.length) {
        setTimeout(emitCandidate, 50);
      }
    };
    setTimeout(emitCandidate, 50);
  };

  RTCIceGatherer.prototype.getLocalCandidates = function() {
    return this._emittedCandidates;
  };

  RTCIceGatherer.prototype.getLocalParameters = function() {
    return {
      usernameFragment: 'someufrag',
      password: 'somepass'
    };
  };
  RTCIceGatherer.prototype.getStats = function() {
    return Promise.resolve({});
  };
  window.RTCIceGatherer = RTCIceGatherer;

  const RTCIceTransport = function() {
    this._remoteCandidates = [];
    this.state = 'new';
  };
  RTCIceTransport.prototype.start = function(gatherer, parameters, role) {
    this._gatherer = gatherer;
    this._remoteParameters = parameters;
    this._role = role || 'controlled';
    if (this._remoteCandidates.length > 0) {
      this.state = 'completed'; // TODO: not accurate, should go to checking.
    }
  };
  RTCIceTransport.prototype.addRemoteCandidate = function(remoteCandidate) {
    if (Object.keys(remoteCandidate).length) {
      this._remoteCandidates.push(remoteCandidate);
    }
    if (this.state === 'new') {
      this.state = 'completed'; // TODO: not accurate, should go to checking.
    }
  };
  RTCIceTransport.prototype.setRemoteCandidates = function(remoteCandidates) {
    this._remoteCandidates = remoteCandidates;
  };
  RTCIceTransport.prototype.getRemoteCandidates = function() {
    return this._remoteCandidates;
  };
  RTCIceTransport.prototype.getRemoteParameters = function() {
    return this._remoteParameters;
  };
  RTCIceTransport.prototype.stop = function() {};
  RTCIceTransport.prototype.getStats = function() {
    return Promise.resolve({});
  };
  window.RTCIceTransport = RTCIceTransport;

  const RTCDtlsTransport = function(transport) {
    this.transport = transport;
    this.state = 'new';
  };
  RTCDtlsTransport.prototype.start = function() {
    this.state = 'connected'; // TODO: not accurate.
  };
  RTCDtlsTransport.prototype.stop = function() {};
  RTCDtlsTransport.prototype.getLocalParameters = function() {
    return {
      role: 'auto',
      fingerprints: [
        {
          algorithm: 'sha-256',
          value: '00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00' +
            ':00:00:00:00:00:00:00:00:00:00:00:00:00:00:00'
        }
      ]
    };
  };
  RTCDtlsTransport.prototype.getStats = function() {
    return Promise.resolve({});
  };
  window.RTCDtlsTransport = RTCDtlsTransport;

  function getCapabilities(kind) {
    var opus = {
      name: 'opus',
      kind: 'audio',
      clockRate: 48000,
      preferredPayloadType: 111,
      numChannels: 2
    };
    var vp8 = {
      name: 'vp8',
      kind: 'video',
      clockRate: 90000,
      preferredPayloadType: 100,
      numChannels: 1,
      rtcpFeedback: [
          {type: 'nack', parameter: ''},
          {type: 'nack', parameter: 'pli'}
      ]
    };
    var rtx = {
      name: 'rtx',
      kind: 'video',
      clockRate: 90000,
      preferredPayloadType: 101,
      numChannels: 1,
      parameters: {apt: 100}
    };
    var codecs;
    switch (kind) {
      case 'audio':
        codecs = [opus];
        break;
      case 'video':
        codecs = [vp8, rtx];
        break;
      default:
        codecs = [opus, vp8, rtx];
        break;
    }
    var headerExtensions;
    switch (kind) {
      case 'audio':
        headerExtensions = [];
        break;
      default:
      case 'video':
        headerExtensions = [{
          id: 3,
          uri: 'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time'
        }];
        break;
    }
    return {
      codecs: codecs,
      headerExtensions: headerExtensions
    };
  }

  const RTCRtpReceiver = function(transport, kind) {
    this.track = new window.MediaStreamTrack();
    this.track.kind = kind;
    this.transport = transport;
  };
  RTCRtpReceiver.prototype.receive = function() {};
  RTCRtpReceiver.prototype.stop = function() {};
  RTCRtpReceiver.prototype.setTransport = function(transport) {
    this.transport = transport;
  };

  RTCRtpReceiver.getCapabilities = getCapabilities;
  RTCRtpReceiver.prototype.getStats = function() {
    return Promise.resolve({});
  };
  window.RTCRtpReceiver = RTCRtpReceiver;

  const RTCRtpSender = function(track, transport) {
    this.track = track;
    this.transport = transport;
  };
  RTCRtpSender.prototype.send = function() {};
  RTCRtpSender.prototype.stop = function() {};
  RTCRtpSender.prototype.setTransport = function(transport) {
    this.transport = transport;
  };

  RTCRtpSender.getCapabilities = getCapabilities;
  RTCRtpSender.prototype.getStats = function() {
    return Promise.resolve({123: {type: 'outboundrtp', id: 123}});
  };
  RTCRtpSender.prototype.replaceTrack = function(withTrack) {
    this.track = withTrack;
    return Promise.resolve();
  };
  window.RTCRtpSender = RTCRtpSender;
};
