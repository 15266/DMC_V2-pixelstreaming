var __ps = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/sdp/sdp.js
  var require_sdp = __commonJS({
    "node_modules/sdp/sdp.js"(exports, module) {
      "use strict";
      var SDPUtils2 = {};
      SDPUtils2.generateIdentifier = function() {
        return Math.random().toString(36).substring(2, 12);
      };
      SDPUtils2.localCName = SDPUtils2.generateIdentifier();
      SDPUtils2.splitLines = function(blob) {
        return blob.trim().split("\n").map((line) => line.trim());
      };
      SDPUtils2.splitSections = function(blob) {
        const parts = blob.split("\nm=");
        return parts.map((part, index2) => (index2 > 0 ? "m=" + part : part).trim() + "\r\n");
      };
      SDPUtils2.getDescription = function(blob) {
        const sections = SDPUtils2.splitSections(blob);
        return sections && sections[0];
      };
      SDPUtils2.getMediaSections = function(blob) {
        const sections = SDPUtils2.splitSections(blob);
        sections.shift();
        return sections;
      };
      SDPUtils2.matchPrefix = function(blob, prefix) {
        return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
      };
      SDPUtils2.parseCandidate = function(line) {
        let parts;
        if (line.indexOf("a=candidate:") === 0) {
          parts = line.substring(12).split(" ");
        } else {
          parts = line.substring(10).split(" ");
        }
        const candidate = {
          foundation: parts[0],
          component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
          protocol: parts[2].toLowerCase(),
          priority: parseInt(parts[3], 10),
          ip: parts[4],
          address: parts[4],
          // address is an alias for ip.
          port: parseInt(parts[5], 10),
          // skip parts[6] == 'typ'
          type: parts[7]
        };
        for (let i = 8; i < parts.length; i += 2) {
          switch (parts[i]) {
            case "raddr":
              candidate.relatedAddress = parts[i + 1];
              break;
            case "rport":
              candidate.relatedPort = parseInt(parts[i + 1], 10);
              break;
            case "tcptype":
              candidate.tcpType = parts[i + 1];
              break;
            case "ufrag":
              candidate.ufrag = parts[i + 1];
              candidate.usernameFragment = parts[i + 1];
              break;
            default:
              if (candidate[parts[i]] === void 0) {
                candidate[parts[i]] = parts[i + 1];
              }
              break;
          }
        }
        return candidate;
      };
      SDPUtils2.writeCandidate = function(candidate) {
        const sdp = [];
        sdp.push(candidate.foundation);
        const component = candidate.component;
        if (component === "rtp") {
          sdp.push(1);
        } else if (component === "rtcp") {
          sdp.push(2);
        } else {
          sdp.push(component);
        }
        sdp.push(candidate.protocol.toUpperCase());
        sdp.push(candidate.priority);
        sdp.push(candidate.address || candidate.ip);
        sdp.push(candidate.port);
        const type = candidate.type;
        sdp.push("typ");
        sdp.push(type);
        if (type !== "host" && candidate.relatedAddress && candidate.relatedPort !== void 0) {
          sdp.push("raddr");
          sdp.push(candidate.relatedAddress);
          sdp.push("rport");
          sdp.push(candidate.relatedPort);
        }
        if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
          sdp.push("tcptype");
          sdp.push(candidate.tcpType);
        }
        if (candidate.usernameFragment || candidate.ufrag) {
          sdp.push("ufrag");
          sdp.push(candidate.usernameFragment || candidate.ufrag);
        }
        return "candidate:" + sdp.join(" ");
      };
      SDPUtils2.parseIceOptions = function(line) {
        return line.substring(14).split(" ");
      };
      SDPUtils2.parseRtpMap = function(line) {
        let parts = line.substring(9).split(" ");
        const parsed = {
          payloadType: parseInt(parts.shift(), 10)
          // was: id
        };
        parts = parts[0].split("/");
        parsed.name = parts[0];
        parsed.clockRate = parseInt(parts[1], 10);
        parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        parsed.numChannels = parsed.channels;
        return parsed;
      };
      SDPUtils2.writeRtpMap = function(codec) {
        let pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        const channels = codec.channels || codec.numChannels || 1;
        return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
      };
      SDPUtils2.parseExtmap = function(line) {
        const parts = line.substring(9).split(" ");
        return {
          id: parseInt(parts[0], 10),
          direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
          uri: parts[1],
          attributes: parts.slice(2).join(" ")
        };
      };
      SDPUtils2.writeExtmap = function(headerExtension) {
        return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
      };
      SDPUtils2.parseFmtp = function(line) {
        const parsed = {};
        let kv;
        const parts = line.substring(line.indexOf(" ") + 1).split(";");
        for (let j = 0; j < parts.length; j++) {
          kv = parts[j].trim().split("=");
          parsed[kv[0].trim()] = kv[1];
        }
        return parsed;
      };
      SDPUtils2.writeFmtp = function(codec) {
        let line = "";
        let pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        if (codec.parameters && Object.keys(codec.parameters).length) {
          const params = [];
          Object.keys(codec.parameters).forEach((param) => {
            if (codec.parameters[param] !== void 0) {
              params.push(param + "=" + codec.parameters[param]);
            } else {
              params.push(param);
            }
          });
          line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
        }
        return line;
      };
      SDPUtils2.parseRtcpFb = function(line) {
        const parts = line.substring(line.indexOf(" ") + 1).split(" ");
        return {
          type: parts.shift(),
          parameter: parts.join(" ")
        };
      };
      SDPUtils2.writeRtcpFb = function(codec) {
        let lines = "";
        let pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
          codec.rtcpFeedback.forEach((fb) => {
            lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
          });
        }
        return lines;
      };
      SDPUtils2.parseSsrcMedia = function(line) {
        const sp = line.indexOf(" ");
        const parts = {
          ssrc: parseInt(line.substring(7, sp), 10)
        };
        const colon = line.indexOf(":", sp);
        if (colon > -1) {
          parts.attribute = line.substring(sp + 1, colon);
          parts.value = line.substring(colon + 1);
        } else {
          parts.attribute = line.substring(sp + 1);
        }
        return parts;
      };
      SDPUtils2.parseSsrcGroup = function(line) {
        const parts = line.substring(13).split(" ");
        return {
          semantics: parts.shift(),
          ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
        };
      };
      SDPUtils2.getMid = function(mediaSection) {
        const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
        if (mid) {
          return mid.substring(6);
        }
      };
      SDPUtils2.parseFingerprint = function(line) {
        const parts = line.substring(14).split(" ");
        return {
          algorithm: parts[0].toLowerCase(),
          // algorithm is case-sensitive in Edge.
          value: parts[1].toUpperCase()
          // the definition is upper-case in RFC 4572.
        };
      };
      SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
        const lines = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=fingerprint:"
        );
        return {
          role: "auto",
          fingerprints: lines.map(SDPUtils2.parseFingerprint)
        };
      };
      SDPUtils2.writeDtlsParameters = function(params, setupType) {
        let sdp = "a=setup:" + setupType + "\r\n";
        params.fingerprints.forEach((fp) => {
          sdp += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
        });
        return sdp;
      };
      SDPUtils2.parseCryptoLine = function(line) {
        const parts = line.substring(9).split(" ");
        return {
          tag: parseInt(parts[0], 10),
          cryptoSuite: parts[1],
          keyParams: parts[2],
          sessionParams: parts.slice(3)
        };
      };
      SDPUtils2.writeCryptoLine = function(parameters) {
        return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
      };
      SDPUtils2.parseCryptoKeyParams = function(keyParams) {
        if (keyParams.indexOf("inline:") !== 0) {
          return null;
        }
        const parts = keyParams.substring(7).split("|");
        return {
          keyMethod: "inline",
          keySalt: parts[0],
          lifeTime: parts[1],
          mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
          mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
        };
      };
      SDPUtils2.writeCryptoKeyParams = function(keyParams) {
        return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
      };
      SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
        const lines = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=crypto:"
        );
        return lines.map(SDPUtils2.parseCryptoLine);
      };
      SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
        const ufrag = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=ice-ufrag:"
        )[0];
        const pwd = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=ice-pwd:"
        )[0];
        if (!(ufrag && pwd)) {
          return null;
        }
        return {
          usernameFragment: ufrag.substring(12),
          password: pwd.substring(10)
        };
      };
      SDPUtils2.writeIceParameters = function(params) {
        let sdp = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
        if (params.iceLite) {
          sdp += "a=ice-lite\r\n";
        }
        return sdp;
      };
      SDPUtils2.parseRtpParameters = function(mediaSection) {
        const description = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        };
        const lines = SDPUtils2.splitLines(mediaSection);
        const mline = lines[0].split(" ");
        description.profile = mline[2];
        for (let i = 3; i < mline.length; i++) {
          const pt = mline[i];
          const rtpmapline = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtpmap:" + pt + " "
          )[0];
          if (rtpmapline) {
            const codec = SDPUtils2.parseRtpMap(rtpmapline);
            const fmtps = SDPUtils2.matchPrefix(
              mediaSection,
              "a=fmtp:" + pt + " "
            );
            codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
            codec.rtcpFeedback = SDPUtils2.matchPrefix(
              mediaSection,
              "a=rtcp-fb:" + pt + " "
            ).map(SDPUtils2.parseRtcpFb);
            description.codecs.push(codec);
            switch (codec.name.toUpperCase()) {
              case "RED":
              case "ULPFEC":
                description.fecMechanisms.push(codec.name.toUpperCase());
                break;
              default:
                break;
            }
          }
        }
        SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
          description.headerExtensions.push(SDPUtils2.parseExtmap(line));
        });
        const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
        description.codecs.forEach((codec) => {
          wildcardRtcpFb.forEach((fb) => {
            const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
              return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
            });
            if (!duplicate) {
              codec.rtcpFeedback.push(fb);
            }
          });
        });
        return description;
      };
      SDPUtils2.writeRtpDescription = function(kind, caps) {
        let sdp = "";
        sdp += "m=" + kind + " ";
        sdp += caps.codecs.length > 0 ? "9" : "0";
        sdp += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
        sdp += caps.codecs.map((codec) => {
          if (codec.preferredPayloadType !== void 0) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        }).join(" ") + "\r\n";
        sdp += "c=IN IP4 0.0.0.0\r\n";
        sdp += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
        caps.codecs.forEach((codec) => {
          sdp += SDPUtils2.writeRtpMap(codec);
          sdp += SDPUtils2.writeFmtp(codec);
          sdp += SDPUtils2.writeRtcpFb(codec);
        });
        let maxptime = 0;
        caps.codecs.forEach((codec) => {
          if (codec.maxptime > maxptime) {
            maxptime = codec.maxptime;
          }
        });
        if (maxptime > 0) {
          sdp += "a=maxptime:" + maxptime + "\r\n";
        }
        if (caps.headerExtensions) {
          caps.headerExtensions.forEach((extension) => {
            sdp += SDPUtils2.writeExtmap(extension);
          });
        }
        return sdp;
      };
      SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
        const encodingParameters = [];
        const description = SDPUtils2.parseRtpParameters(mediaSection);
        const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
        const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
        const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
        const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
        let secondarySsrc;
        const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
          const parts = line.substring(17).split(" ");
          return parts.map((part) => parseInt(part, 10));
        });
        if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
          secondarySsrc = flows[0][1];
        }
        description.codecs.forEach((codec) => {
          if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
            let encParam = {
              ssrc: primarySsrc,
              codecPayloadType: parseInt(codec.parameters.apt, 10)
            };
            if (primarySsrc && secondarySsrc) {
              encParam.rtx = { ssrc: secondarySsrc };
            }
            encodingParameters.push(encParam);
            if (hasRed) {
              encParam = JSON.parse(JSON.stringify(encParam));
              encParam.fec = {
                ssrc: primarySsrc,
                mechanism: hasUlpfec ? "red+ulpfec" : "red"
              };
              encodingParameters.push(encParam);
            }
          }
        });
        if (encodingParameters.length === 0 && primarySsrc) {
          encodingParameters.push({
            ssrc: primarySsrc
          });
        }
        let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
        if (bandwidth.length) {
          if (bandwidth[0].indexOf("b=TIAS:") === 0) {
            bandwidth = parseInt(bandwidth[0].substring(7), 10);
          } else if (bandwidth[0].indexOf("b=AS:") === 0) {
            bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
          } else {
            bandwidth = void 0;
          }
          encodingParameters.forEach((params) => {
            params.maxBitrate = bandwidth;
          });
        }
        return encodingParameters;
      };
      SDPUtils2.parseRtcpParameters = function(mediaSection) {
        const rtcpParameters = {};
        const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
        if (remoteSsrc) {
          rtcpParameters.cname = remoteSsrc.value;
          rtcpParameters.ssrc = remoteSsrc.ssrc;
        }
        const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
        rtcpParameters.reducedSize = rsize.length > 0;
        rtcpParameters.compound = rsize.length === 0;
        const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
        rtcpParameters.mux = mux.length > 0;
        return rtcpParameters;
      };
      SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
        let sdp = "";
        if (rtcpParameters.reducedSize) {
          sdp += "a=rtcp-rsize\r\n";
        }
        if (rtcpParameters.mux) {
          sdp += "a=rtcp-mux\r\n";
        }
        if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
          sdp += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
        }
        return sdp;
      };
      SDPUtils2.parseMsid = function(mediaSection) {
        let parts;
        const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
        if (spec.length === 1) {
          parts = spec[0].substring(7).split(" ");
          return { stream: parts[0], track: parts[1] };
        }
        const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
        if (planB.length > 0) {
          parts = planB[0].value.split(" ");
          return { stream: parts[0], track: parts[1] };
        }
      };
      SDPUtils2.parseSctpDescription = function(mediaSection) {
        const mline = SDPUtils2.parseMLine(mediaSection);
        const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
        let maxMessageSize;
        if (maxSizeLine.length > 0) {
          maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
        }
        if (isNaN(maxMessageSize)) {
          maxMessageSize = 65536;
        }
        const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
        if (sctpPort.length > 0) {
          return {
            port: parseInt(sctpPort[0].substring(12), 10),
            protocol: mline.fmt,
            maxMessageSize
          };
        }
        const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
        if (sctpMapLines.length > 0) {
          const parts = sctpMapLines[0].substring(10).split(" ");
          return {
            port: parseInt(parts[0], 10),
            protocol: parts[1],
            maxMessageSize
          };
        }
      };
      SDPUtils2.writeSctpDescription = function(media, sctp) {
        let output = [];
        if (media.protocol !== "DTLS/SCTP") {
          output = [
            "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctp-port:" + sctp.port + "\r\n"
          ];
        } else {
          output = [
            "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
          ];
        }
        if (sctp.maxMessageSize !== void 0) {
          output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
        }
        return output.join("");
      };
      SDPUtils2.generateSessionId = function() {
        return Math.random().toString().substr(2, 22);
      };
      SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
        let sessionId;
        const version = sessVer !== void 0 ? sessVer : 2;
        if (sessId) {
          sessionId = sessId;
        } else {
          sessionId = SDPUtils2.generateSessionId();
        }
        const user = sessUser || "thisisadapterortc";
        return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
      };
      SDPUtils2.getDirection = function(mediaSection, sessionpart) {
        const lines = SDPUtils2.splitLines(mediaSection);
        for (let i = 0; i < lines.length; i++) {
          switch (lines[i]) {
            case "a=sendrecv":
            case "a=sendonly":
            case "a=recvonly":
            case "a=inactive":
              return lines[i].substring(2);
            default:
          }
        }
        if (sessionpart) {
          return SDPUtils2.getDirection(sessionpart);
        }
        return "sendrecv";
      };
      SDPUtils2.getKind = function(mediaSection) {
        const lines = SDPUtils2.splitLines(mediaSection);
        const mline = lines[0].split(" ");
        return mline[0].substring(2);
      };
      SDPUtils2.isRejected = function(mediaSection) {
        return mediaSection.split(" ", 2)[1] === "0";
      };
      SDPUtils2.parseMLine = function(mediaSection) {
        const lines = SDPUtils2.splitLines(mediaSection);
        const parts = lines[0].substring(2).split(" ");
        return {
          kind: parts[0],
          port: parseInt(parts[1], 10),
          protocol: parts[2],
          fmt: parts.slice(3).join(" ")
        };
      };
      SDPUtils2.parseOLine = function(mediaSection) {
        const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
        const parts = line.substring(2).split(" ");
        return {
          username: parts[0],
          sessionId: parts[1],
          sessionVersion: parseInt(parts[2], 10),
          netType: parts[3],
          addressType: parts[4],
          address: parts[5]
        };
      };
      SDPUtils2.isValidSDP = function(blob) {
        if (typeof blob !== "string" || blob.length === 0) {
          return false;
        }
        const lines = SDPUtils2.splitLines(blob);
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
            return false;
          }
        }
        return true;
      };
      if (typeof module === "object") {
        module.exports = SDPUtils2;
      }
    }
  });

  // entry.mjs
  var entry_exports = {};
  __export(entry_exports, {
    default: () => entry_default
  });

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Logger/Logger.js
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["Disabled"] = 0] = "Disabled";
    LogLevel2[LogLevel2["Error"] = 1] = "Error";
    LogLevel2[LogLevel2["Warning"] = 2] = "Warning";
    LogLevel2[LogLevel2["Info"] = 3] = "Info";
    LogLevel2[LogLevel2["Debug"] = 4] = "Debug";
  })(LogLevel || (LogLevel = {}));
  var LoggerContext = class {
    constructor() {
      this.logLevel = LogLevel.Debug;
      this.includeStack = true;
    }
  };
  var LoggerType = class {
    /**
     * Set the log verbosity level
     */
    InitLogging(logLevel, includeStack) {
      this.ValidateContext();
      this.context.logLevel = logLevel;
      this.context.includeStack = includeStack;
    }
    /**
     * Logging output for debugging
     * @param message - the message to be logged
     */
    Debug(message) {
      this.ValidateContext();
      if (this.context.logLevel >= LogLevel.Debug) {
        this.CommonLog("Debug", message);
      }
    }
    /**
     * Basic logging output for standard messages
     * @param message - the message to be logged
     */
    Info(message) {
      this.ValidateContext();
      if (this.context.logLevel >= LogLevel.Info) {
        this.CommonLog("Info", message);
      }
    }
    /**
     * Logging for warnings
     * @param message - the message to be logged
     */
    Warning(message) {
      this.ValidateContext();
      if (this.context.logLevel >= LogLevel.Warning) {
        this.CommonLog("Warning", message);
      }
    }
    /**
     * Error logging
     * @param message - the message to be logged
     */
    Error(message) {
      this.ValidateContext();
      if (this.context.logLevel >= LogLevel.Error) {
        this.CommonLog("Error", message);
      }
    }
    /**
     * The common log function that all other log functions call to.
     * @param level - the level of this log message.
     * @param stack - an optional stack trace string from where the log message was called.
     * @param message - the message to be logged.
     */
    CommonLog(level, message) {
      let logMessage = `[${level}] - ${message}`;
      if (this.context.includeStack) {
        logMessage += `
Stack: ${this.GetStackTrace()}`;
      }
      if (level === "Error") {
        console.error(logMessage);
      } else if (level === "Warning") {
        console.warn(logMessage);
      } else {
        console.log(logMessage);
      }
    }
    /**
     * Captures the stack and returns it
     * @returns the current stack
     */
    GetStackTrace() {
      const error = new Error();
      let formattedStack = "No Stack Available for this browser";
      if (error.stack) {
        formattedStack = error.stack.toString().replace(/Error/g, "");
      }
      return formattedStack;
    }
    /**
     * Since there can be multiple execution contexts, (stats reporting and some webxr logging comes from
     * different execution contexts we can end up with multiple static Logger instances. Here we try to
     * work around it by storing the context on the window object.
     */
    ValidateContext() {
      if (!this.context) {
        if (typeof window == "undefined" || !window) {
          this.context = new LoggerContext();
        } else if (!window.loggerContext) {
          this.context = new LoggerContext();
          window.loggerContext = this.context;
        } else {
          this.context = window.loggerContext;
        }
      }
    }
  };
  var Logger = new LoggerType();

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Event/EventEmitter.js
  var PixelStreamingEventListener = class {
    constructor(callback) {
      this._args = [];
      this._callback = callback;
    }
    handleEvent(_evt) {
      this._callback(...this._args);
      this._args = [];
    }
    setArgs(...args) {
      this._args = args;
    }
  };
  var EventEmitter = class extends EventTarget {
    constructor() {
      super();
      this._eventListeners = /* @__PURE__ */ new Map();
    }
    removeListenerInternal(eventName, listener) {
      if (this._eventListeners.has(eventName)) {
        const listeners = this._eventListeners.get(eventName);
        if (listeners === void 0) {
          return this;
        }
        for (let i = 0; i < listeners.length; ++i) {
          const eventPair = listeners[i];
          if (eventPair.callback === listener) {
            super.removeEventListener(eventName, eventPair.eventListenerWrapper);
            listeners.splice(i, 1);
            break;
          }
        }
      }
      return this;
    }
    /**
     * Alias for `emitter.on(eventName, listener)`.
     */
    addListener(eventName, listener) {
      return this.on(eventName, listener);
    }
    /**
     * Adds the `listener` function to the end of the listeners array for the event
     * named `eventName`.
     *
     * ```js
     * server.on('connection', (stream) => {
     *   console.log('someone connected!');
     * });
     * ```
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * @param eventName - The name of the event.
     * @param listener - The callback function
     */
    on(eventName, listener) {
      var _a;
      const eventListenerWrapper = new PixelStreamingEventListener(listener);
      super.addEventListener(eventName, eventListenerWrapper);
      if (!this._eventListeners.has(eventName)) {
        this._eventListeners.set(eventName, new Array());
      }
      (_a = this._eventListeners.get(eventName)) === null || _a === void 0 ? void 0 : _a.push({ callback: listener, eventListenerWrapper });
      return this;
    }
    /**
     * Adds a **one-time** `listener` function for the event named `eventName`. The
     * next time `eventName` is triggered, this listener is removed and then invoked.
     *
     * ```js
     * server.once('connection', (stream) => {
     *   console.log('Ah, we have our first user!');
     * });
     * ```
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param eventName - The name of the event.
     * @param listener - The callback function
     */
    once(eventName, listener) {
      var _a;
      const eventListenerOpts = { once: true };
      const eventListenerWrapper = new PixelStreamingEventListener((...args) => {
        listener(...args);
        this.removeListenerInternal(eventName, listener);
      });
      super.addEventListener(eventName, eventListenerWrapper, eventListenerOpts);
      if (!this._eventListeners.has(eventName)) {
        this._eventListeners.set(eventName, new Array());
      }
      (_a = this._eventListeners.get(eventName)) === null || _a === void 0 ? void 0 : _a.push({ callback: listener, eventListenerWrapper });
      return this;
    }
    /**
     * Removes the specified `listener` from this EventEmitter.
     *
     * ```js
     * const callback = (stream) => {
     *   console.log('someone connected!');
     * };
     * server.on('connection', callback);
     * // ...
     * server.removeListener('connection', callback);
     * ```
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     */
    removeListener(eventName, listener) {
      this.removeListenerInternal(eventName, listener);
      return this;
    }
    /**
     * Alias for `emitter.removeListener()`.
     */
    off(eventName, listener) {
      return this.removeListener(eventName, listener);
    }
    /**
     * Removes all listeners, or those of the specified `eventName`.
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     */
    removeAllListeners(eventName) {
      if (this._eventListeners.has(eventName)) {
        const listeners = this._eventListeners.get(eventName);
        if (listeners === void 0) {
          return this;
        }
        for (const listenerPair of listeners) {
          this.removeEventListener(eventName, listenerPair.eventListenerWrapper);
        }
        this._eventListeners.delete(eventName);
      }
      return this;
    }
    /**
     * Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
     * to each.
     *
     * Returns `true` if the event had listeners, `false` otherwise.
     *
     * ```js
     * import { EventEmitter } from 'node:events';
     * const myEmitter = new EventEmitter();
     *
     * // First listener
     * myEmitter.on('event', function firstListener() {
     *   console.log('Helloooo! first listener');
     * });
     * // Second listener
     * myEmitter.on('event', function secondListener(arg1, arg2) {
     *   console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
     * });
     * // Third listener
     * myEmitter.on('event', function thirdListener(...args) {
     *   const parameters = args.join(', ');
     *   console.log(`event with parameters ${parameters} in third listener`);
     * });
     *
     * console.log(myEmitter.listeners('event'));
     *
     * myEmitter.emit('event', 1, 2, 3, 4, 5);
     *
     * // Prints:
     * // [
     * //   [Function: firstListener],
     * //   [Function: secondListener],
     * //   [Function: thirdListener]
     * // ]
     * // Helloooo! first listener
     * // event with parameters 1, 2 in second listener
     * // event with parameters 1, 2, 3, 4, 5 in third listener
     * ```
     */
    emit(eventName, ...args) {
      if (this._eventListeners.has(eventName)) {
        const listeners = this._eventListeners.get(eventName);
        if (listeners === void 0) {
          return false;
        }
        for (const listenerPair of listeners) {
          listenerPair.eventListenerWrapper.setArgs(...args);
        }
        super.dispatchEvent(new Event(eventName));
        return true;
      }
      return false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Transport/WebSocketTransport.js
  var WebSocketTransport = class extends EventEmitter {
    /**
     * Constructs a new WebSocketTransport for browser contexts.
     * @param protocols - An optional string or list of strings to pass to the new websocket protocols param
     */
    constructor(protocols) {
      super();
      this.WS_OPEN_STATE = 1;
      this.protocols = protocols;
    }
    /**
     * Sends a message over the websocket.
     * @param msg - The message to send.
     */
    sendMessage(msg) {
      if (this.webSocket) {
        this.webSocket.send(msg);
      }
    }
    /**
     * Connect to the signaling server
     * @param connectionURL - The Address of the signaling server
     * @returns If there is a connection
     */
    connect(connectionURL) {
      Logger.Info(connectionURL);
      try {
        this.webSocket = new WebSocket(connectionURL, this.protocols);
        this.webSocket.onopen = (_) => this.handleOnOpen();
        this.webSocket.onerror = (_) => this.handleOnError();
        this.webSocket.onclose = (event) => this.handleOnClose(event);
        this.webSocket.onmessage = (event) => this.handleOnMessage(event);
        this.webSocket.onmessagebinary = (event) => this.handleOnMessageBinary(event);
        return true;
      } catch (error) {
        Logger.Error(error instanceof Error ? error.message : String(error));
        return false;
      }
    }
    /**
     * Disconnect this transport.
     * @param code - An optional disconnect code.
     * @param reason - A descriptive string for the disconnect reason.
     */
    disconnect(code, reason) {
      if (this.webSocket) {
        this.webSocket.close(code, reason);
      }
    }
    /**
     * Should return true when the transport is connected and ready to send/receive messages.
     * @returns True if the transport is connected.
     */
    isConnected() {
      return !!this.webSocket && this.webSocket.readyState != WebSocket.CLOSED;
    }
    /**
     * Handles what happens when a message is received in binary form
     * @param event - Message Received
     */
    handleOnMessageBinary(event) {
      if (!event || !event.data) {
        return;
      }
      event.data.text().then((messageString) => {
        const constructedMessage = new MessageEvent("messageFromBinary", {
          data: messageString
        });
        this.handleOnMessage(constructedMessage);
      }).catch((error) => {
        Logger.Error(`Failed to parse binary blob from websocket, reason: ${error.message}`);
      });
    }
    /**
     * Handles what happens when a message is received
     * @param event - Message Received
     */
    handleOnMessage(event) {
      if (event.data && event.data instanceof Blob) {
        this.handleOnMessageBinary(event);
        return;
      }
      if (this.onMessage) {
        this.onMessage(event.data);
      }
    }
    /**
     * Handles when the Websocket is opened
     */
    handleOnOpen() {
      Logger.Info("Connected to the signalling server via WebSocket");
      this.emit("open");
    }
    /**
     * Handles when there is an error on the websocket
     */
    handleOnError() {
      this.emit("error");
    }
    /**
     * Handles when the Websocket is closed
     * @param event - Close Event
     */
    handleOnClose(event) {
      Logger.Info("Disconnected to the signalling server via WebSocket: " + JSON.stringify(event.code) + " - " + event.reason);
      this.emit("close", event);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Protocol/SignallingProtocol.js
  var SignallingProtocol = class extends EventEmitter {
    static get SIGNALLING_VERSION() {
      return "1.3.0";
    }
    constructor(transport) {
      super();
      this.transport = transport;
      transport.onMessage = (msg) => {
        let parsedMessage;
        try {
          const parsedData = JSON.parse(msg);
          Logger.Debug("Protocol received => \n" + JSON.stringify(parsedData, void 0, 4));
          parsedMessage = parsedData;
        } catch (e) {
          if (e instanceof Error) {
            Logger.Error(`Error parsing message string ${msg}.
${e.message}`);
          } else {
            Logger.Error(`Unknown error while parsing message data in handleOnMessage`);
          }
          return;
        }
        transport.emit("message", parsedMessage);
        if (!this.emit(parsedMessage.type, parsedMessage)) {
          this.emit("unhandled", parsedMessage);
        }
      };
    }
    /**
     * Asks the transport to connect to the given URL.
     * @param url - The url to connect to.
     * @returns True if the connection call succeeded.
     */
    connect(url) {
      return this.transport.connect(url);
    }
    /**
     * Asks the transport to disconnect from any connection it might have.
     * @param code - An optional disconnection code.
     * @param reason - An optional descriptive string for the disconnect reason.
     */
    disconnect(code, reason) {
      this.transport.disconnect(code, reason);
    }
    /**
     * Returns true if the transport is connected and ready to send/receive messages.
     * @returns True if the protocol is connected.
     */
    isConnected() {
      return this.transport.isConnected();
    }
    /**
     * Passes a message to the transport to send to the other end.
     * @param msg - The message to send.
     */
    sendMessage(msg) {
      this.transport.sendMessage(JSON.stringify(msg));
      this.transport.emit("out", msg);
      Logger.Debug("Protocol sent => \n" + JSON.stringify(msg, void 0, 4));
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Messages/signalling_messages.js
  var signalling_messages_exports = {};
  __export(signalling_messages_exports, {
    answer: () => answer,
    base_message: () => base_message,
    config: () => config,
    dataChannelRequest: () => dataChannelRequest,
    disconnectPlayer: () => disconnectPlayer,
    endpointId: () => endpointId,
    endpointIdConfirm: () => endpointIdConfirm,
    iceCandidate: () => iceCandidate,
    iceCandidateData: () => iceCandidateData,
    identify: () => identify,
    layerPreference: () => layerPreference,
    listStreamers: () => listStreamers,
    offer: () => offer,
    peerConnectionOptions: () => peerConnectionOptions,
    peerDataChannels: () => peerDataChannels,
    peerDataChannelsReady: () => peerDataChannelsReady,
    ping: () => ping,
    playerConnected: () => playerConnected,
    playerCount: () => playerCount,
    playerDisconnected: () => playerDisconnected,
    pong: () => pong,
    startStreaming: () => startStreaming,
    stats: () => stats,
    stopStreaming: () => stopStreaming,
    streamerDataChannels: () => streamerDataChannels,
    streamerDisconnected: () => streamerDisconnected,
    streamerIdChanged: () => streamerIdChanged,
    streamerList: () => streamerList,
    subscribe: () => subscribe,
    subscribeFailed: () => subscribeFailed,
    unsubscribe: () => unsubscribe
  });

  // node_modules/@protobuf-ts/runtime/build/es2015/json-typings.js
  function typeofJsonValue(value) {
    let t = typeof value;
    if (t == "object") {
      if (Array.isArray(value))
        return "array";
      if (value === null)
        return "null";
    }
    return t;
  }
  function isJsonObject(value) {
    return value !== null && typeof value == "object" && !Array.isArray(value);
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/base64.js
  var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
  var decTable = [];
  for (let i = 0; i < encTable.length; i++)
    decTable[encTable[i].charCodeAt(0)] = i;
  decTable["-".charCodeAt(0)] = encTable.indexOf("+");
  decTable["_".charCodeAt(0)] = encTable.indexOf("/");
  function base64decode(base64Str) {
    let es = base64Str.length * 3 / 4;
    if (base64Str[base64Str.length - 2] == "=")
      es -= 2;
    else if (base64Str[base64Str.length - 1] == "=")
      es -= 1;
    let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
    for (let i = 0; i < base64Str.length; i++) {
      b = decTable[base64Str.charCodeAt(i)];
      if (b === void 0) {
        switch (base64Str[i]) {
          case "=":
            groupPos = 0;
          // reset state when padding found
          case "\n":
          case "\r":
          case "	":
          case " ":
            continue;
          // skip white-space, and padding
          default:
            throw Error(`invalid base64 string.`);
        }
      }
      switch (groupPos) {
        case 0:
          p = b;
          groupPos = 1;
          break;
        case 1:
          bytes[bytePos++] = p << 2 | (b & 48) >> 4;
          p = b;
          groupPos = 2;
          break;
        case 2:
          bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
          p = b;
          groupPos = 3;
          break;
        case 3:
          bytes[bytePos++] = (p & 3) << 6 | b;
          groupPos = 0;
          break;
      }
    }
    if (groupPos == 1)
      throw Error(`invalid base64 string.`);
    return bytes.subarray(0, bytePos);
  }
  function base64encode(bytes) {
    let base64 = "", groupPos = 0, b, p = 0;
    for (let i = 0; i < bytes.length; i++) {
      b = bytes[i];
      switch (groupPos) {
        case 0:
          base64 += encTable[b >> 2];
          p = (b & 3) << 4;
          groupPos = 1;
          break;
        case 1:
          base64 += encTable[p | b >> 4];
          p = (b & 15) << 2;
          groupPos = 2;
          break;
        case 2:
          base64 += encTable[p | b >> 6];
          base64 += encTable[b & 63];
          groupPos = 0;
          break;
      }
    }
    if (groupPos) {
      base64 += encTable[p];
      base64 += "=";
      if (groupPos == 1)
        base64 += "=";
    }
    return base64;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/binary-format-contract.js
  var UnknownFieldHandler;
  (function(UnknownFieldHandler2) {
    UnknownFieldHandler2.symbol = /* @__PURE__ */ Symbol.for("protobuf-ts/unknown");
    UnknownFieldHandler2.onRead = (typeName, message, fieldNo, wireType, data) => {
      let container = is(message) ? message[UnknownFieldHandler2.symbol] : message[UnknownFieldHandler2.symbol] = [];
      container.push({ no: fieldNo, wireType, data });
    };
    UnknownFieldHandler2.onWrite = (typeName, message, writer) => {
      for (let { no, wireType, data } of UnknownFieldHandler2.list(message))
        writer.tag(no, wireType).raw(data);
    };
    UnknownFieldHandler2.list = (message, fieldNo) => {
      if (is(message)) {
        let all = message[UnknownFieldHandler2.symbol];
        return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
      }
      return [];
    };
    UnknownFieldHandler2.last = (message, fieldNo) => UnknownFieldHandler2.list(message, fieldNo).slice(-1)[0];
    const is = (message) => message && Array.isArray(message[UnknownFieldHandler2.symbol]);
  })(UnknownFieldHandler || (UnknownFieldHandler = {}));
  var WireType;
  (function(WireType2) {
    WireType2[WireType2["Varint"] = 0] = "Varint";
    WireType2[WireType2["Bit64"] = 1] = "Bit64";
    WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
    WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
    WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
    WireType2[WireType2["Bit32"] = 5] = "Bit32";
  })(WireType || (WireType = {}));

  // node_modules/@protobuf-ts/runtime/build/es2015/goog-varint.js
  function varint64read() {
    let lowBits = 0;
    let highBits = 0;
    for (let shift = 0; shift < 28; shift += 7) {
      let b = this.buf[this.pos++];
      lowBits |= (b & 127) << shift;
      if ((b & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
    }
    let middleByte = this.buf[this.pos++];
    lowBits |= (middleByte & 15) << 28;
    highBits = (middleByte & 112) >> 4;
    if ((middleByte & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
    for (let shift = 3; shift <= 31; shift += 7) {
      let b = this.buf[this.pos++];
      highBits |= (b & 127) << shift;
      if ((b & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
    }
    throw new Error("invalid varint");
  }
  function varint64write(lo, hi, bytes) {
    for (let i = 0; i < 28; i = i + 7) {
      const shift = lo >>> i;
      const hasNext = !(shift >>> 7 == 0 && hi == 0);
      const byte = (hasNext ? shift | 128 : shift) & 255;
      bytes.push(byte);
      if (!hasNext) {
        return;
      }
    }
    const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
    const hasMoreBits = !(hi >> 3 == 0);
    bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
    if (!hasMoreBits) {
      return;
    }
    for (let i = 3; i < 31; i = i + 7) {
      const shift = hi >>> i;
      const hasNext = !(shift >>> 7 == 0);
      const byte = (hasNext ? shift | 128 : shift) & 255;
      bytes.push(byte);
      if (!hasNext) {
        return;
      }
    }
    bytes.push(hi >>> 31 & 1);
  }
  var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
  function int64fromString(dec) {
    let minus = dec[0] == "-";
    if (minus)
      dec = dec.slice(1);
    const base = 1e6;
    let lowBits = 0;
    let highBits = 0;
    function add1e6digit(begin, end) {
      const digit1e6 = Number(dec.slice(begin, end));
      highBits *= base;
      lowBits = lowBits * base + digit1e6;
      if (lowBits >= TWO_PWR_32_DBL) {
        highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
        lowBits = lowBits % TWO_PWR_32_DBL;
      }
    }
    add1e6digit(-24, -18);
    add1e6digit(-18, -12);
    add1e6digit(-12, -6);
    add1e6digit(-6);
    return [minus, lowBits, highBits];
  }
  function int64toString(bitsLow, bitsHigh) {
    if (bitsHigh >>> 0 <= 2097151) {
      return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
    }
    let low = bitsLow & 16777215;
    let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
    let high = bitsHigh >> 16 & 65535;
    let digitA = low + mid * 6777216 + high * 6710656;
    let digitB = mid + high * 8147497;
    let digitC = high * 2;
    let base = 1e7;
    if (digitA >= base) {
      digitB += Math.floor(digitA / base);
      digitA %= base;
    }
    if (digitB >= base) {
      digitC += Math.floor(digitB / base);
      digitB %= base;
    }
    function decimalFrom1e7(digit1e7, needLeadingZeros) {
      let partial = digit1e7 ? String(digit1e7) : "";
      if (needLeadingZeros) {
        return "0000000".slice(partial.length) + partial;
      }
      return partial;
    }
    return decimalFrom1e7(
      digitC,
      /*needLeadingZeros=*/
      0
    ) + decimalFrom1e7(
      digitB,
      /*needLeadingZeros=*/
      digitC
    ) + // If the final 1e7 digit didn't need leading zeros, we would have
    // returned via the trivial code path at the top.
    decimalFrom1e7(
      digitA,
      /*needLeadingZeros=*/
      1
    );
  }
  function varint32write(value, bytes) {
    if (value >= 0) {
      while (value > 127) {
        bytes.push(value & 127 | 128);
        value = value >>> 7;
      }
      bytes.push(value);
    } else {
      for (let i = 0; i < 9; i++) {
        bytes.push(value & 127 | 128);
        value = value >> 7;
      }
      bytes.push(1);
    }
  }
  function varint32read() {
    let b = this.buf[this.pos++];
    let result = b & 127;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 7;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 14;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 127) << 21;
    if ((b & 128) == 0) {
      this.assertBounds();
      return result;
    }
    b = this.buf[this.pos++];
    result |= (b & 15) << 28;
    for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
      b = this.buf[this.pos++];
    if ((b & 128) != 0)
      throw new Error("invalid varint");
    this.assertBounds();
    return result >>> 0;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/pb-long.js
  var BI;
  function detectBi() {
    const dv = new DataView(new ArrayBuffer(8));
    const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
    BI = ok ? {
      MIN: BigInt("-9223372036854775808"),
      MAX: BigInt("9223372036854775807"),
      UMIN: BigInt("0"),
      UMAX: BigInt("18446744073709551615"),
      C: BigInt,
      V: dv
    } : void 0;
  }
  detectBi();
  function assertBi(bi) {
    if (!bi)
      throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
  }
  var RE_DECIMAL_STR = /^-?[0-9]+$/;
  var TWO_PWR_32_DBL2 = 4294967296;
  var HALF_2_PWR_32 = 2147483648;
  var SharedPbLong = class {
    /**
     * Create a new instance with the given bits.
     */
    constructor(lo, hi) {
      this.lo = lo | 0;
      this.hi = hi | 0;
    }
    /**
     * Is this instance equal to 0?
     */
    isZero() {
      return this.lo == 0 && this.hi == 0;
    }
    /**
     * Convert to a native number.
     */
    toNumber() {
      let result = this.hi * TWO_PWR_32_DBL2 + (this.lo >>> 0);
      if (!Number.isSafeInteger(result))
        throw new Error("cannot convert to safe number");
      return result;
    }
  };
  var PbULong = class _PbULong extends SharedPbLong {
    /**
     * Create instance from a `string`, `number` or `bigint`.
     */
    static from(value) {
      if (BI)
        switch (typeof value) {
          case "string":
            if (value == "0")
              return this.ZERO;
            if (value == "")
              throw new Error("string is no integer");
            value = BI.C(value);
          case "number":
            if (value === 0)
              return this.ZERO;
            value = BI.C(value);
          case "bigint":
            if (!value)
              return this.ZERO;
            if (value < BI.UMIN)
              throw new Error("signed value for ulong");
            if (value > BI.UMAX)
              throw new Error("ulong too large");
            BI.V.setBigUint64(0, value, true);
            return new _PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
        }
      else
        switch (typeof value) {
          case "string":
            if (value == "0")
              return this.ZERO;
            value = value.trim();
            if (!RE_DECIMAL_STR.test(value))
              throw new Error("string is no integer");
            let [minus, lo, hi] = int64fromString(value);
            if (minus)
              throw new Error("signed value for ulong");
            return new _PbULong(lo, hi);
          case "number":
            if (value == 0)
              return this.ZERO;
            if (!Number.isSafeInteger(value))
              throw new Error("number is no integer");
            if (value < 0)
              throw new Error("signed value for ulong");
            return new _PbULong(value, value / TWO_PWR_32_DBL2);
        }
      throw new Error("unknown value " + typeof value);
    }
    /**
     * Convert to decimal string.
     */
    toString() {
      return BI ? this.toBigInt().toString() : int64toString(this.lo, this.hi);
    }
    /**
     * Convert to native bigint.
     */
    toBigInt() {
      assertBi(BI);
      BI.V.setInt32(0, this.lo, true);
      BI.V.setInt32(4, this.hi, true);
      return BI.V.getBigUint64(0, true);
    }
  };
  PbULong.ZERO = new PbULong(0, 0);
  var PbLong = class _PbLong extends SharedPbLong {
    /**
     * Create instance from a `string`, `number` or `bigint`.
     */
    static from(value) {
      if (BI)
        switch (typeof value) {
          case "string":
            if (value == "0")
              return this.ZERO;
            if (value == "")
              throw new Error("string is no integer");
            value = BI.C(value);
          case "number":
            if (value === 0)
              return this.ZERO;
            value = BI.C(value);
          case "bigint":
            if (!value)
              return this.ZERO;
            if (value < BI.MIN)
              throw new Error("signed long too small");
            if (value > BI.MAX)
              throw new Error("signed long too large");
            BI.V.setBigInt64(0, value, true);
            return new _PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
        }
      else
        switch (typeof value) {
          case "string":
            if (value == "0")
              return this.ZERO;
            value = value.trim();
            if (!RE_DECIMAL_STR.test(value))
              throw new Error("string is no integer");
            let [minus, lo, hi] = int64fromString(value);
            if (minus) {
              if (hi > HALF_2_PWR_32 || hi == HALF_2_PWR_32 && lo != 0)
                throw new Error("signed long too small");
            } else if (hi >= HALF_2_PWR_32)
              throw new Error("signed long too large");
            let pbl = new _PbLong(lo, hi);
            return minus ? pbl.negate() : pbl;
          case "number":
            if (value == 0)
              return this.ZERO;
            if (!Number.isSafeInteger(value))
              throw new Error("number is no integer");
            return value > 0 ? new _PbLong(value, value / TWO_PWR_32_DBL2) : new _PbLong(-value, -value / TWO_PWR_32_DBL2).negate();
        }
      throw new Error("unknown value " + typeof value);
    }
    /**
     * Do we have a minus sign?
     */
    isNegative() {
      return (this.hi & HALF_2_PWR_32) !== 0;
    }
    /**
     * Negate two's complement.
     * Invert all the bits and add one to the result.
     */
    negate() {
      let hi = ~this.hi, lo = this.lo;
      if (lo)
        lo = ~lo + 1;
      else
        hi += 1;
      return new _PbLong(lo, hi);
    }
    /**
     * Convert to decimal string.
     */
    toString() {
      if (BI)
        return this.toBigInt().toString();
      if (this.isNegative()) {
        let n = this.negate();
        return "-" + int64toString(n.lo, n.hi);
      }
      return int64toString(this.lo, this.hi);
    }
    /**
     * Convert to native bigint.
     */
    toBigInt() {
      assertBi(BI);
      BI.V.setInt32(0, this.lo, true);
      BI.V.setInt32(4, this.hi, true);
      return BI.V.getBigInt64(0, true);
    }
  };
  PbLong.ZERO = new PbLong(0, 0);

  // node_modules/@protobuf-ts/runtime/build/es2015/binary-reader.js
  var defaultsRead = {
    readUnknownField: true,
    readerFactory: (bytes) => new BinaryReader(bytes)
  };
  function binaryReadOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
  }
  var BinaryReader = class {
    constructor(buf, textDecoder) {
      this.varint64 = varint64read;
      this.uint32 = varint32read;
      this.buf = buf;
      this.len = buf.length;
      this.pos = 0;
      this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
        fatal: true,
        ignoreBOM: true
      });
    }
    /**
     * Reads a tag - field number and wire type.
     */
    tag() {
      let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
      if (fieldNo <= 0 || wireType < 0 || wireType > 5)
        throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
      return [fieldNo, wireType];
    }
    /**
     * Skip one element on the wire and return the skipped data.
     * Supports WireType.StartGroup since v2.0.0-alpha.23.
     */
    skip(wireType) {
      let start = this.pos;
      switch (wireType) {
        case WireType.Varint:
          while (this.buf[this.pos++] & 128) {
          }
          break;
        case WireType.Bit64:
          this.pos += 4;
        case WireType.Bit32:
          this.pos += 4;
          break;
        case WireType.LengthDelimited:
          let len = this.uint32();
          this.pos += len;
          break;
        case WireType.StartGroup:
          let t;
          while ((t = this.tag()[1]) !== WireType.EndGroup) {
            this.skip(t);
          }
          break;
        default:
          throw new Error("cant skip wire type " + wireType);
      }
      this.assertBounds();
      return this.buf.subarray(start, this.pos);
    }
    /**
     * Throws error if position in byte array is out of range.
     */
    assertBounds() {
      if (this.pos > this.len)
        throw new RangeError("premature EOF");
    }
    /**
     * Read a `int32` field, a signed 32 bit varint.
     */
    int32() {
      return this.uint32() | 0;
    }
    /**
     * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
     */
    sint32() {
      let zze = this.uint32();
      return zze >>> 1 ^ -(zze & 1);
    }
    /**
     * Read a `int64` field, a signed 64-bit varint.
     */
    int64() {
      return new PbLong(...this.varint64());
    }
    /**
     * Read a `uint64` field, an unsigned 64-bit varint.
     */
    uint64() {
      return new PbULong(...this.varint64());
    }
    /**
     * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64() {
      let [lo, hi] = this.varint64();
      let s = -(lo & 1);
      lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
      hi = hi >>> 1 ^ s;
      return new PbLong(lo, hi);
    }
    /**
     * Read a `bool` field, a variant.
     */
    bool() {
      let [lo, hi] = this.varint64();
      return lo !== 0 || hi !== 0;
    }
    /**
     * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
     */
    fixed32() {
      return this.view.getUint32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
     */
    sfixed32() {
      return this.view.getInt32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
     */
    fixed64() {
      return new PbULong(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
     */
    sfixed64() {
      return new PbLong(this.sfixed32(), this.sfixed32());
    }
    /**
     * Read a `float` field, 32-bit floating point number.
     */
    float() {
      return this.view.getFloat32((this.pos += 4) - 4, true);
    }
    /**
     * Read a `double` field, a 64-bit floating point number.
     */
    double() {
      return this.view.getFloat64((this.pos += 8) - 8, true);
    }
    /**
     * Read a `bytes` field, length-delimited arbitrary data.
     */
    bytes() {
      let len = this.uint32();
      let start = this.pos;
      this.pos += len;
      this.assertBounds();
      return this.buf.subarray(start, start + len);
    }
    /**
     * Read a `string` field, length-delimited data converted to UTF-8 text.
     */
    string() {
      return this.textDecoder.decode(this.bytes());
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/assert.js
  function assert(condition, msg) {
    if (!condition) {
      throw new Error(msg);
    }
  }
  var FLOAT32_MAX = 34028234663852886e22;
  var FLOAT32_MIN = -34028234663852886e22;
  var UINT32_MAX = 4294967295;
  var INT32_MAX = 2147483647;
  var INT32_MIN = -2147483648;
  function assertInt32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid int 32: " + typeof arg);
    if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
      throw new Error("invalid int 32: " + arg);
  }
  function assertUInt32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid uint 32: " + typeof arg);
    if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
      throw new Error("invalid uint 32: " + arg);
  }
  function assertFloat32(arg) {
    if (typeof arg !== "number")
      throw new Error("invalid float 32: " + typeof arg);
    if (!Number.isFinite(arg))
      return;
    if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
      throw new Error("invalid float 32: " + arg);
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/binary-writer.js
  var defaultsWrite = {
    writeUnknownFields: true,
    writerFactory: () => new BinaryWriter()
  };
  function binaryWriteOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
  }
  var BinaryWriter = class {
    constructor(textEncoder) {
      this.stack = [];
      this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
      this.chunks = [];
      this.buf = [];
    }
    /**
     * Return all bytes written and reset this writer.
     */
    finish() {
      this.chunks.push(new Uint8Array(this.buf));
      let len = 0;
      for (let i = 0; i < this.chunks.length; i++)
        len += this.chunks[i].length;
      let bytes = new Uint8Array(len);
      let offset = 0;
      for (let i = 0; i < this.chunks.length; i++) {
        bytes.set(this.chunks[i], offset);
        offset += this.chunks[i].length;
      }
      this.chunks = [];
      return bytes;
    }
    /**
     * Start a new fork for length-delimited data like a message
     * or a packed repeated field.
     *
     * Must be joined later with `join()`.
     */
    fork() {
      this.stack.push({ chunks: this.chunks, buf: this.buf });
      this.chunks = [];
      this.buf = [];
      return this;
    }
    /**
     * Join the last fork. Write its length and bytes, then
     * return to the previous state.
     */
    join() {
      let chunk = this.finish();
      let prev = this.stack.pop();
      if (!prev)
        throw new Error("invalid state, fork stack empty");
      this.chunks = prev.chunks;
      this.buf = prev.buf;
      this.uint32(chunk.byteLength);
      return this.raw(chunk);
    }
    /**
     * Writes a tag (field number and wire type).
     *
     * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
     *
     * Generated code should compute the tag ahead of time and call `uint32()`.
     */
    tag(fieldNo, type) {
      return this.uint32((fieldNo << 3 | type) >>> 0);
    }
    /**
     * Write a chunk of raw bytes.
     */
    raw(chunk) {
      if (this.buf.length) {
        this.chunks.push(new Uint8Array(this.buf));
        this.buf = [];
      }
      this.chunks.push(chunk);
      return this;
    }
    /**
     * Write a `uint32` value, an unsigned 32 bit varint.
     */
    uint32(value) {
      assertUInt32(value);
      while (value > 127) {
        this.buf.push(value & 127 | 128);
        value = value >>> 7;
      }
      this.buf.push(value);
      return this;
    }
    /**
     * Write a `int32` value, a signed 32 bit varint.
     */
    int32(value) {
      assertInt32(value);
      varint32write(value, this.buf);
      return this;
    }
    /**
     * Write a `bool` value, a variant.
     */
    bool(value) {
      this.buf.push(value ? 1 : 0);
      return this;
    }
    /**
     * Write a `bytes` value, length-delimited arbitrary data.
     */
    bytes(value) {
      this.uint32(value.byteLength);
      return this.raw(value);
    }
    /**
     * Write a `string` value, length-delimited data converted to UTF-8 text.
     */
    string(value) {
      let chunk = this.textEncoder.encode(value);
      this.uint32(chunk.byteLength);
      return this.raw(chunk);
    }
    /**
     * Write a `float` value, 32-bit floating point number.
     */
    float(value) {
      assertFloat32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setFloat32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `double` value, a 64-bit floating point number.
     */
    double(value) {
      let chunk = new Uint8Array(8);
      new DataView(chunk.buffer).setFloat64(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
     */
    fixed32(value) {
      assertUInt32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setUint32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
     */
    sfixed32(value) {
      assertInt32(value);
      let chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setInt32(0, value, true);
      return this.raw(chunk);
    }
    /**
     * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
     */
    sint32(value) {
      assertInt32(value);
      value = (value << 1 ^ value >> 31) >>> 0;
      varint32write(value, this.buf);
      return this;
    }
    /**
     * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
     */
    sfixed64(value) {
      let chunk = new Uint8Array(8);
      let view = new DataView(chunk.buffer);
      let long = PbLong.from(value);
      view.setInt32(0, long.lo, true);
      view.setInt32(4, long.hi, true);
      return this.raw(chunk);
    }
    /**
     * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
     */
    fixed64(value) {
      let chunk = new Uint8Array(8);
      let view = new DataView(chunk.buffer);
      let long = PbULong.from(value);
      view.setInt32(0, long.lo, true);
      view.setInt32(4, long.hi, true);
      return this.raw(chunk);
    }
    /**
     * Write a `int64` value, a signed 64-bit varint.
     */
    int64(value) {
      let long = PbLong.from(value);
      varint64write(long.lo, long.hi, this.buf);
      return this;
    }
    /**
     * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
     */
    sint64(value) {
      let long = PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
      varint64write(lo, hi, this.buf);
      return this;
    }
    /**
     * Write a `uint64` value, an unsigned 64-bit varint.
     */
    uint64(value) {
      let long = PbULong.from(value);
      varint64write(long.lo, long.hi, this.buf);
      return this;
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/json-format-contract.js
  var defaultsWrite2 = {
    emitDefaultValues: false,
    enumAsInteger: false,
    useProtoFieldName: false,
    prettySpaces: 0
  };
  var defaultsRead2 = {
    ignoreUnknownFields: false
  };
  function jsonReadOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsRead2), options) : defaultsRead2;
  }
  function jsonWriteOptions(options) {
    return options ? Object.assign(Object.assign({}, defaultsWrite2), options) : defaultsWrite2;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/message-type-contract.js
  var MESSAGE_TYPE = /* @__PURE__ */ Symbol.for("protobuf-ts/message-type");

  // node_modules/@protobuf-ts/runtime/build/es2015/lower-camel-case.js
  function lowerCamelCase(snakeCase) {
    let capNext = false;
    const sb = [];
    for (let i = 0; i < snakeCase.length; i++) {
      let next = snakeCase.charAt(i);
      if (next == "_") {
        capNext = true;
      } else if (/\d/.test(next)) {
        sb.push(next);
        capNext = true;
      } else if (capNext) {
        sb.push(next.toUpperCase());
        capNext = false;
      } else if (i == 0) {
        sb.push(next.toLowerCase());
      } else {
        sb.push(next);
      }
    }
    return sb.join("");
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-info.js
  var ScalarType;
  (function(ScalarType2) {
    ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
    ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
    ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
    ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
    ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
    ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
    ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
    ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
    ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
    ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
    ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
    ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
    ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
    ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
    ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
  })(ScalarType || (ScalarType = {}));
  var LongType;
  (function(LongType2) {
    LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
    LongType2[LongType2["STRING"] = 1] = "STRING";
    LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
  })(LongType || (LongType = {}));
  var RepeatType;
  (function(RepeatType2) {
    RepeatType2[RepeatType2["NO"] = 0] = "NO";
    RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
    RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
  })(RepeatType || (RepeatType = {}));
  function normalizeFieldInfo(field) {
    var _a, _b, _c, _d;
    field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lowerCamelCase(field.name);
    field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lowerCamelCase(field.name);
    field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
    field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
    return field;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/oneof.js
  function isOneofGroup(any) {
    if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
      return false;
    }
    switch (typeof any.oneofKind) {
      case "string":
        if (any[any.oneofKind] === void 0)
          return false;
        return Object.keys(any).length == 2;
      case "undefined":
        return Object.keys(any).length == 1;
      default:
        return false;
    }
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-type-check.js
  var ReflectionTypeCheck = class {
    constructor(info) {
      var _a;
      this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
    }
    prepare() {
      if (this.data)
        return;
      const req = [], known = [], oneofs = [];
      for (let field of this.fields) {
        if (field.oneof) {
          if (!oneofs.includes(field.oneof)) {
            oneofs.push(field.oneof);
            req.push(field.oneof);
            known.push(field.oneof);
          }
        } else {
          known.push(field.localName);
          switch (field.kind) {
            case "scalar":
            case "enum":
              if (!field.opt || field.repeat)
                req.push(field.localName);
              break;
            case "message":
              if (field.repeat)
                req.push(field.localName);
              break;
            case "map":
              req.push(field.localName);
              break;
          }
        }
      }
      this.data = { req, known, oneofs: Object.values(oneofs) };
    }
    /**
     * Is the argument a valid message as specified by the
     * reflection information?
     *
     * Checks all field types recursively. The `depth`
     * specifies how deep into the structure the check will be.
     *
     * With a depth of 0, only the presence of fields
     * is checked.
     *
     * With a depth of 1 or more, the field types are checked.
     *
     * With a depth of 2 or more, the members of map, repeated
     * and message fields are checked.
     *
     * Message fields will be checked recursively with depth - 1.
     *
     * The number of map entries / repeated values being checked
     * is < depth.
     */
    is(message, depth, allowExcessProperties = false) {
      if (depth < 0)
        return true;
      if (message === null || message === void 0 || typeof message != "object")
        return false;
      this.prepare();
      let keys = Object.keys(message), data = this.data;
      if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n)))
        return false;
      if (!allowExcessProperties) {
        if (keys.some((k) => !data.known.includes(k)))
          return false;
      }
      if (depth < 1) {
        return true;
      }
      for (const name of data.oneofs) {
        const group = message[name];
        if (!isOneofGroup(group))
          return false;
        if (group.oneofKind === void 0)
          continue;
        const field = this.fields.find((f) => f.localName === group.oneofKind);
        if (!field)
          return false;
        if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
          return false;
      }
      for (const field of this.fields) {
        if (field.oneof !== void 0)
          continue;
        if (!this.field(message[field.localName], field, allowExcessProperties, depth))
          return false;
      }
      return true;
    }
    field(arg, field, allowExcessProperties, depth) {
      let repeated = field.repeat;
      switch (field.kind) {
        case "scalar":
          if (arg === void 0)
            return field.opt;
          if (repeated)
            return this.scalars(arg, field.T, depth, field.L);
          return this.scalar(arg, field.T, field.L);
        case "enum":
          if (arg === void 0)
            return field.opt;
          if (repeated)
            return this.scalars(arg, ScalarType.INT32, depth);
          return this.scalar(arg, ScalarType.INT32);
        case "message":
          if (arg === void 0)
            return true;
          if (repeated)
            return this.messages(arg, field.T(), allowExcessProperties, depth);
          return this.message(arg, field.T(), allowExcessProperties, depth);
        case "map":
          if (typeof arg != "object" || arg === null)
            return false;
          if (depth < 2)
            return true;
          if (!this.mapKeys(arg, field.K, depth))
            return false;
          switch (field.V.kind) {
            case "scalar":
              return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
            case "enum":
              return this.scalars(Object.values(arg), ScalarType.INT32, depth);
            case "message":
              return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
          }
          break;
      }
      return true;
    }
    message(arg, type, allowExcessProperties, depth) {
      if (allowExcessProperties) {
        return type.isAssignable(arg, depth);
      }
      return type.is(arg, depth);
    }
    messages(arg, type, allowExcessProperties, depth) {
      if (!Array.isArray(arg))
        return false;
      if (depth < 2)
        return true;
      if (allowExcessProperties) {
        for (let i = 0; i < arg.length && i < depth; i++)
          if (!type.isAssignable(arg[i], depth - 1))
            return false;
      } else {
        for (let i = 0; i < arg.length && i < depth; i++)
          if (!type.is(arg[i], depth - 1))
            return false;
      }
      return true;
    }
    scalar(arg, type, longType) {
      let argType = typeof arg;
      switch (type) {
        case ScalarType.UINT64:
        case ScalarType.FIXED64:
        case ScalarType.INT64:
        case ScalarType.SFIXED64:
        case ScalarType.SINT64:
          switch (longType) {
            case LongType.BIGINT:
              return argType == "bigint";
            case LongType.NUMBER:
              return argType == "number" && !isNaN(arg);
            default:
              return argType == "string";
          }
        case ScalarType.BOOL:
          return argType == "boolean";
        case ScalarType.STRING:
          return argType == "string";
        case ScalarType.BYTES:
          return arg instanceof Uint8Array;
        case ScalarType.DOUBLE:
        case ScalarType.FLOAT:
          return argType == "number" && !isNaN(arg);
        default:
          return argType == "number" && Number.isInteger(arg);
      }
    }
    scalars(arg, type, depth, longType) {
      if (!Array.isArray(arg))
        return false;
      if (depth < 2)
        return true;
      if (Array.isArray(arg)) {
        for (let i = 0; i < arg.length && i < depth; i++)
          if (!this.scalar(arg[i], type, longType))
            return false;
      }
      return true;
    }
    mapKeys(map, type, depth) {
      let keys = Object.keys(map);
      switch (type) {
        case ScalarType.INT32:
        case ScalarType.FIXED32:
        case ScalarType.SFIXED32:
        case ScalarType.SINT32:
        case ScalarType.UINT32:
          return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
        case ScalarType.BOOL:
          return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
        default:
          return this.scalars(keys, type, depth, LongType.STRING);
      }
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-long-convert.js
  function reflectionLongConvert(long, type) {
    switch (type) {
      case LongType.BIGINT:
        return long.toBigInt();
      case LongType.NUMBER:
        return long.toNumber();
      default:
        return long.toString();
    }
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-reader.js
  var ReflectionJsonReader = class {
    constructor(info) {
      this.info = info;
    }
    prepare() {
      var _a;
      if (this.fMap === void 0) {
        this.fMap = {};
        const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
        for (const field of fieldsInput) {
          this.fMap[field.name] = field;
          this.fMap[field.jsonName] = field;
          this.fMap[field.localName] = field;
        }
      }
    }
    // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
    assert(condition, fieldName, jsonValue) {
      if (!condition) {
        let what = typeofJsonValue(jsonValue);
        if (what == "number" || what == "boolean")
          what = jsonValue.toString();
        throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
      }
    }
    /**
     * Reads a message from canonical JSON format into the target message.
     *
     * Repeated fields are appended. Map entries are added, overwriting
     * existing keys.
     *
     * If a message field is already present, it will be merged with the
     * new data.
     */
    read(input, message, options) {
      this.prepare();
      const oneofsHandled = [];
      for (const [jsonKey, jsonValue] of Object.entries(input)) {
        const field = this.fMap[jsonKey];
        if (!field) {
          if (!options.ignoreUnknownFields)
            throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
          continue;
        }
        const localName = field.localName;
        let target;
        if (field.oneof) {
          if (jsonValue === null && (field.kind !== "enum" || field.T()[0] !== "google.protobuf.NullValue")) {
            continue;
          }
          if (oneofsHandled.includes(field.oneof))
            throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
          oneofsHandled.push(field.oneof);
          target = message[field.oneof] = {
            oneofKind: localName
          };
        } else {
          target = message;
        }
        if (field.kind == "map") {
          if (jsonValue === null) {
            continue;
          }
          this.assert(isJsonObject(jsonValue), field.name, jsonValue);
          const fieldObj = target[localName];
          for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
            this.assert(jsonObjValue !== null, field.name + " map value", null);
            let val;
            switch (field.V.kind) {
              case "message":
                val = field.V.T().internalJsonRead(jsonObjValue, options);
                break;
              case "enum":
                val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
                if (val === false)
                  continue;
                break;
              case "scalar":
                val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
                break;
            }
            this.assert(val !== void 0, field.name + " map value", jsonObjValue);
            let key = jsonObjKey;
            if (field.K == ScalarType.BOOL)
              key = key == "true" ? true : key == "false" ? false : key;
            key = this.scalar(key, field.K, LongType.STRING, field.name).toString();
            fieldObj[key] = val;
          }
        } else if (field.repeat) {
          if (jsonValue === null)
            continue;
          this.assert(Array.isArray(jsonValue), field.name, jsonValue);
          const fieldArr = target[localName];
          for (const jsonItem of jsonValue) {
            this.assert(jsonItem !== null, field.name, null);
            let val;
            switch (field.kind) {
              case "message":
                val = field.T().internalJsonRead(jsonItem, options);
                break;
              case "enum":
                val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
                if (val === false)
                  continue;
                break;
              case "scalar":
                val = this.scalar(jsonItem, field.T, field.L, field.name);
                break;
            }
            this.assert(val !== void 0, field.name, jsonValue);
            fieldArr.push(val);
          }
        } else {
          switch (field.kind) {
            case "message":
              if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
                this.assert(field.oneof === void 0, field.name + " (oneof member)", null);
                continue;
              }
              target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
              break;
            case "enum":
              if (jsonValue === null)
                continue;
              let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
              if (val === false)
                continue;
              target[localName] = val;
              break;
            case "scalar":
              if (jsonValue === null)
                continue;
              target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
              break;
          }
        }
      }
    }
    /**
     * Returns `false` for unrecognized string representations.
     *
     * google.protobuf.NullValue accepts only JSON `null` (or the old `"NULL_VALUE"`).
     */
    enum(type, json, fieldName, ignoreUnknownFields) {
      if (type[0] == "google.protobuf.NullValue")
        assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
      if (json === null)
        return 0;
      switch (typeof json) {
        case "number":
          assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
          return json;
        case "string":
          let localEnumName = json;
          if (type[2] && json.substring(0, type[2].length) === type[2])
            localEnumName = json.substring(type[2].length);
          let enumNumber = type[1][localEnumName];
          if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
            return false;
          }
          assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
          return enumNumber;
      }
      assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
    }
    scalar(json, type, longType, fieldName) {
      let e;
      try {
        switch (type) {
          // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
          // Either numbers or strings are accepted. Exponent notation is also accepted.
          case ScalarType.DOUBLE:
          case ScalarType.FLOAT:
            if (json === null)
              return 0;
            if (json === "NaN")
              return Number.NaN;
            if (json === "Infinity")
              return Number.POSITIVE_INFINITY;
            if (json === "-Infinity")
              return Number.NEGATIVE_INFINITY;
            if (json === "") {
              e = "empty string";
              break;
            }
            if (typeof json == "string" && json.trim().length !== json.length) {
              e = "extra whitespace";
              break;
            }
            if (typeof json != "string" && typeof json != "number") {
              break;
            }
            let float = Number(json);
            if (Number.isNaN(float)) {
              e = "not a number";
              break;
            }
            if (!Number.isFinite(float)) {
              e = "too large or small";
              break;
            }
            if (type == ScalarType.FLOAT)
              assertFloat32(float);
            return float;
          // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
          case ScalarType.INT32:
          case ScalarType.FIXED32:
          case ScalarType.SFIXED32:
          case ScalarType.SINT32:
          case ScalarType.UINT32:
            if (json === null)
              return 0;
            let int32;
            if (typeof json == "number")
              int32 = json;
            else if (json === "")
              e = "empty string";
            else if (typeof json == "string") {
              if (json.trim().length !== json.length)
                e = "extra whitespace";
              else
                int32 = Number(json);
            }
            if (int32 === void 0)
              break;
            if (type == ScalarType.UINT32)
              assertUInt32(int32);
            else
              assertInt32(int32);
            return int32;
          // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
          case ScalarType.INT64:
          case ScalarType.SFIXED64:
          case ScalarType.SINT64:
            if (json === null)
              return reflectionLongConvert(PbLong.ZERO, longType);
            if (typeof json != "number" && typeof json != "string")
              break;
            return reflectionLongConvert(PbLong.from(json), longType);
          case ScalarType.FIXED64:
          case ScalarType.UINT64:
            if (json === null)
              return reflectionLongConvert(PbULong.ZERO, longType);
            if (typeof json != "number" && typeof json != "string")
              break;
            return reflectionLongConvert(PbULong.from(json), longType);
          // bool:
          case ScalarType.BOOL:
            if (json === null)
              return false;
            if (typeof json !== "boolean")
              break;
            return json;
          // string:
          case ScalarType.STRING:
            if (json === null)
              return "";
            if (typeof json !== "string") {
              e = "extra whitespace";
              break;
            }
            try {
              encodeURIComponent(json);
            } catch (e2) {
              e2 = "invalid UTF8";
              break;
            }
            return json;
          // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
          // Either standard or URL-safe base64 encoding with/without paddings are accepted.
          case ScalarType.BYTES:
            if (json === null || json === "")
              return new Uint8Array(0);
            if (typeof json !== "string")
              break;
            return base64decode(json);
        }
      } catch (error) {
        e = error.message;
      }
      this.assert(false, fieldName + (e ? " - " + e : ""), json);
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-writer.js
  var ReflectionJsonWriter = class {
    constructor(info) {
      var _a;
      this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Converts the message to a JSON object, based on the field descriptors.
     */
    write(message, options) {
      const json = {}, source = message;
      for (const field of this.fields) {
        if (!field.oneof) {
          let jsonValue2 = this.field(field, source[field.localName], options);
          if (jsonValue2 !== void 0)
            json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
          continue;
        }
        const group = source[field.oneof];
        if (group.oneofKind !== field.localName)
          continue;
        const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
        let jsonValue = this.field(field, group[field.localName], opt);
        assert(jsonValue !== void 0);
        json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
      }
      return json;
    }
    field(field, value, options) {
      let jsonValue = void 0;
      if (field.kind == "map") {
        assert(typeof value == "object" && value !== null);
        const jsonObj = {};
        switch (field.V.kind) {
          case "scalar":
            for (const [entryKey, entryValue] of Object.entries(value)) {
              const val = this.scalar(field.V.T, entryValue, field.name, false, true);
              assert(val !== void 0);
              jsonObj[entryKey.toString()] = val;
            }
            break;
          case "message":
            const messageType = field.V.T();
            for (const [entryKey, entryValue] of Object.entries(value)) {
              const val = this.message(messageType, entryValue, field.name, options);
              assert(val !== void 0);
              jsonObj[entryKey.toString()] = val;
            }
            break;
          case "enum":
            const enumInfo = field.V.T();
            for (const [entryKey, entryValue] of Object.entries(value)) {
              assert(entryValue === void 0 || typeof entryValue == "number");
              const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
              assert(val !== void 0);
              jsonObj[entryKey.toString()] = val;
            }
            break;
        }
        if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
          jsonValue = jsonObj;
      } else if (field.repeat) {
        assert(Array.isArray(value));
        const jsonArr = [];
        switch (field.kind) {
          case "scalar":
            for (let i = 0; i < value.length; i++) {
              const val = this.scalar(field.T, value[i], field.name, field.opt, true);
              assert(val !== void 0);
              jsonArr.push(val);
            }
            break;
          case "enum":
            const enumInfo = field.T();
            for (let i = 0; i < value.length; i++) {
              assert(value[i] === void 0 || typeof value[i] == "number");
              const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
              assert(val !== void 0);
              jsonArr.push(val);
            }
            break;
          case "message":
            const messageType = field.T();
            for (let i = 0; i < value.length; i++) {
              const val = this.message(messageType, value[i], field.name, options);
              assert(val !== void 0);
              jsonArr.push(val);
            }
            break;
        }
        if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
          jsonValue = jsonArr;
      } else {
        switch (field.kind) {
          case "scalar":
            jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
            break;
          case "enum":
            jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
            break;
          case "message":
            jsonValue = this.message(field.T(), value, field.name, options);
            break;
        }
      }
      return jsonValue;
    }
    /**
     * Returns `null` as the default for google.protobuf.NullValue.
     */
    enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
      if (type[0] == "google.protobuf.NullValue")
        return !emitDefaultValues && !optional ? void 0 : null;
      if (value === void 0) {
        assert(optional);
        return void 0;
      }
      if (value === 0 && !emitDefaultValues && !optional)
        return void 0;
      assert(typeof value == "number");
      assert(Number.isInteger(value));
      if (enumAsInteger || !type[1].hasOwnProperty(value))
        return value;
      if (type[2])
        return type[2] + type[1][value];
      return type[1][value];
    }
    message(type, value, fieldName, options) {
      if (value === void 0)
        return options.emitDefaultValues ? null : void 0;
      return type.internalJsonWrite(value, options);
    }
    scalar(type, value, fieldName, optional, emitDefaultValues) {
      if (value === void 0) {
        assert(optional);
        return void 0;
      }
      const ed = emitDefaultValues || optional;
      switch (type) {
        // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
        case ScalarType.INT32:
        case ScalarType.SFIXED32:
        case ScalarType.SINT32:
          if (value === 0)
            return ed ? 0 : void 0;
          assertInt32(value);
          return value;
        case ScalarType.FIXED32:
        case ScalarType.UINT32:
          if (value === 0)
            return ed ? 0 : void 0;
          assertUInt32(value);
          return value;
        // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
        // Either numbers or strings are accepted. Exponent notation is also accepted.
        case ScalarType.FLOAT:
          assertFloat32(value);
        case ScalarType.DOUBLE:
          if (value === 0)
            return ed ? 0 : void 0;
          assert(typeof value == "number");
          if (Number.isNaN(value))
            return "NaN";
          if (value === Number.POSITIVE_INFINITY)
            return "Infinity";
          if (value === Number.NEGATIVE_INFINITY)
            return "-Infinity";
          return value;
        // string:
        case ScalarType.STRING:
          if (value === "")
            return ed ? "" : void 0;
          assert(typeof value == "string");
          return value;
        // bool:
        case ScalarType.BOOL:
          if (value === false)
            return ed ? false : void 0;
          assert(typeof value == "boolean");
          return value;
        // JSON value will be a decimal string. Either numbers or strings are accepted.
        case ScalarType.UINT64:
        case ScalarType.FIXED64:
          assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
          let ulong = PbULong.from(value);
          if (ulong.isZero() && !ed)
            return void 0;
          return ulong.toString();
        // JSON value will be a decimal string. Either numbers or strings are accepted.
        case ScalarType.INT64:
        case ScalarType.SFIXED64:
        case ScalarType.SINT64:
          assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
          let long = PbLong.from(value);
          if (long.isZero() && !ed)
            return void 0;
          return long.toString();
        // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
        // Either standard or URL-safe base64 encoding with/without paddings are accepted.
        case ScalarType.BYTES:
          assert(value instanceof Uint8Array);
          if (!value.byteLength)
            return ed ? "" : void 0;
          return base64encode(value);
      }
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-scalar-default.js
  function reflectionScalarDefault(type, longType = LongType.STRING) {
    switch (type) {
      case ScalarType.BOOL:
        return false;
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
        return reflectionLongConvert(PbULong.ZERO, longType);
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        return reflectionLongConvert(PbLong.ZERO, longType);
      case ScalarType.DOUBLE:
      case ScalarType.FLOAT:
        return 0;
      case ScalarType.BYTES:
        return new Uint8Array(0);
      case ScalarType.STRING:
        return "";
      default:
        return 0;
    }
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-reader.js
  var ReflectionBinaryReader = class {
    constructor(info) {
      this.info = info;
    }
    prepare() {
      var _a;
      if (!this.fieldNoToField) {
        const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
        this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
      }
    }
    /**
     * Reads a message from binary format into the target message.
     *
     * Repeated fields are appended. Map entries are added, overwriting
     * existing keys.
     *
     * If a message field is already present, it will be merged with the
     * new data.
     */
    read(reader, message, options, length) {
      this.prepare();
      const end = length === void 0 ? reader.len : reader.pos + length;
      while (reader.pos < end) {
        const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
        if (!field) {
          let u = options.readUnknownField;
          if (u == "throw")
            throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
          continue;
        }
        let target = message, repeated = field.repeat, localName = field.localName;
        if (field.oneof) {
          target = target[field.oneof];
          if (target.oneofKind !== localName)
            target = message[field.oneof] = {
              oneofKind: localName
            };
        }
        switch (field.kind) {
          case "scalar":
          case "enum":
            let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
            let L = field.kind == "scalar" ? field.L : void 0;
            if (repeated) {
              let arr = target[localName];
              if (wireType == WireType.LengthDelimited && T != ScalarType.STRING && T != ScalarType.BYTES) {
                let e = reader.uint32() + reader.pos;
                while (reader.pos < e)
                  arr.push(this.scalar(reader, T, L));
              } else
                arr.push(this.scalar(reader, T, L));
            } else
              target[localName] = this.scalar(reader, T, L);
            break;
          case "message":
            if (repeated) {
              let arr = target[localName];
              let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
              arr.push(msg);
            } else
              target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
            break;
          case "map":
            let [mapKey, mapVal] = this.mapEntry(field, reader, options);
            target[localName][mapKey] = mapVal;
            break;
        }
      }
    }
    /**
     * Read a map field, expecting key field = 1, value field = 2
     */
    mapEntry(field, reader, options) {
      let length = reader.uint32();
      let end = reader.pos + length;
      let key = void 0;
      let val = void 0;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case 1:
            if (field.K == ScalarType.BOOL)
              key = reader.bool().toString();
            else
              key = this.scalar(reader, field.K, LongType.STRING);
            break;
          case 2:
            switch (field.V.kind) {
              case "scalar":
                val = this.scalar(reader, field.V.T, field.V.L);
                break;
              case "enum":
                val = reader.int32();
                break;
              case "message":
                val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
                break;
            }
            break;
          default:
            throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
        }
      }
      if (key === void 0) {
        let keyRaw = reflectionScalarDefault(field.K);
        key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
      }
      if (val === void 0)
        switch (field.V.kind) {
          case "scalar":
            val = reflectionScalarDefault(field.V.T, field.V.L);
            break;
          case "enum":
            val = 0;
            break;
          case "message":
            val = field.V.T().create();
            break;
        }
      return [key, val];
    }
    scalar(reader, type, longType) {
      switch (type) {
        case ScalarType.INT32:
          return reader.int32();
        case ScalarType.STRING:
          return reader.string();
        case ScalarType.BOOL:
          return reader.bool();
        case ScalarType.DOUBLE:
          return reader.double();
        case ScalarType.FLOAT:
          return reader.float();
        case ScalarType.INT64:
          return reflectionLongConvert(reader.int64(), longType);
        case ScalarType.UINT64:
          return reflectionLongConvert(reader.uint64(), longType);
        case ScalarType.FIXED64:
          return reflectionLongConvert(reader.fixed64(), longType);
        case ScalarType.FIXED32:
          return reader.fixed32();
        case ScalarType.BYTES:
          return reader.bytes();
        case ScalarType.UINT32:
          return reader.uint32();
        case ScalarType.SFIXED32:
          return reader.sfixed32();
        case ScalarType.SFIXED64:
          return reflectionLongConvert(reader.sfixed64(), longType);
        case ScalarType.SINT32:
          return reader.sint32();
        case ScalarType.SINT64:
          return reflectionLongConvert(reader.sint64(), longType);
      }
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-writer.js
  var ReflectionBinaryWriter = class {
    constructor(info) {
      this.info = info;
    }
    prepare() {
      if (!this.fields) {
        const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
        this.fields = fieldsInput.sort((a, b) => a.no - b.no);
      }
    }
    /**
     * Writes the message to binary format.
     */
    write(message, writer, options) {
      this.prepare();
      for (const field of this.fields) {
        let value, emitDefault, repeated = field.repeat, localName = field.localName;
        if (field.oneof) {
          const group = message[field.oneof];
          if (group.oneofKind !== localName)
            continue;
          value = group[localName];
          emitDefault = true;
        } else {
          value = message[localName];
          emitDefault = false;
        }
        switch (field.kind) {
          case "scalar":
          case "enum":
            let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
            if (repeated) {
              assert(Array.isArray(value));
              if (repeated == RepeatType.PACKED)
                this.packed(writer, T, field.no, value);
              else
                for (const item of value)
                  this.scalar(writer, T, field.no, item, true);
            } else if (value === void 0)
              assert(field.opt);
            else
              this.scalar(writer, T, field.no, value, emitDefault || field.opt);
            break;
          case "message":
            if (repeated) {
              assert(Array.isArray(value));
              for (const item of value)
                this.message(writer, options, field.T(), field.no, item);
            } else {
              this.message(writer, options, field.T(), field.no, value);
            }
            break;
          case "map":
            assert(typeof value == "object" && value !== null);
            for (const [key, val] of Object.entries(value))
              this.mapEntry(writer, options, field, key, val);
            break;
        }
      }
      let u = options.writeUnknownFields;
      if (u !== false)
        (u === true ? UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
    }
    mapEntry(writer, options, field, key, value) {
      writer.tag(field.no, WireType.LengthDelimited);
      writer.fork();
      let keyValue = key;
      switch (field.K) {
        case ScalarType.INT32:
        case ScalarType.FIXED32:
        case ScalarType.UINT32:
        case ScalarType.SFIXED32:
        case ScalarType.SINT32:
          keyValue = Number.parseInt(key);
          break;
        case ScalarType.BOOL:
          assert(key == "true" || key == "false");
          keyValue = key == "true";
          break;
      }
      this.scalar(writer, field.K, 1, keyValue, true);
      switch (field.V.kind) {
        case "scalar":
          this.scalar(writer, field.V.T, 2, value, true);
          break;
        case "enum":
          this.scalar(writer, ScalarType.INT32, 2, value, true);
          break;
        case "message":
          this.message(writer, options, field.V.T(), 2, value);
          break;
      }
      writer.join();
    }
    message(writer, options, handler, fieldNo, value) {
      if (value === void 0)
        return;
      handler.internalBinaryWrite(value, writer.tag(fieldNo, WireType.LengthDelimited).fork(), options);
      writer.join();
    }
    /**
     * Write a single scalar value.
     */
    scalar(writer, type, fieldNo, value, emitDefault) {
      let [wireType, method, isDefault] = this.scalarInfo(type, value);
      if (!isDefault || emitDefault) {
        writer.tag(fieldNo, wireType);
        writer[method](value);
      }
    }
    /**
     * Write an array of scalar values in packed format.
     */
    packed(writer, type, fieldNo, value) {
      if (!value.length)
        return;
      assert(type !== ScalarType.BYTES && type !== ScalarType.STRING);
      writer.tag(fieldNo, WireType.LengthDelimited);
      writer.fork();
      let [, method] = this.scalarInfo(type);
      for (let i = 0; i < value.length; i++)
        writer[method](value[i]);
      writer.join();
    }
    /**
     * Get information for writing a scalar value.
     *
     * Returns tuple:
     * [0]: appropriate WireType
     * [1]: name of the appropriate method of IBinaryWriter
     * [2]: whether the given value is a default value
     *
     * If argument `value` is omitted, [2] is always false.
     */
    scalarInfo(type, value) {
      let t = WireType.Varint;
      let m;
      let i = value === void 0;
      let d = value === 0;
      switch (type) {
        case ScalarType.INT32:
          m = "int32";
          break;
        case ScalarType.STRING:
          d = i || !value.length;
          t = WireType.LengthDelimited;
          m = "string";
          break;
        case ScalarType.BOOL:
          d = value === false;
          m = "bool";
          break;
        case ScalarType.UINT32:
          m = "uint32";
          break;
        case ScalarType.DOUBLE:
          t = WireType.Bit64;
          m = "double";
          break;
        case ScalarType.FLOAT:
          t = WireType.Bit32;
          m = "float";
          break;
        case ScalarType.INT64:
          d = i || PbLong.from(value).isZero();
          m = "int64";
          break;
        case ScalarType.UINT64:
          d = i || PbULong.from(value).isZero();
          m = "uint64";
          break;
        case ScalarType.FIXED64:
          d = i || PbULong.from(value).isZero();
          t = WireType.Bit64;
          m = "fixed64";
          break;
        case ScalarType.BYTES:
          d = i || !value.byteLength;
          t = WireType.LengthDelimited;
          m = "bytes";
          break;
        case ScalarType.FIXED32:
          t = WireType.Bit32;
          m = "fixed32";
          break;
        case ScalarType.SFIXED32:
          t = WireType.Bit32;
          m = "sfixed32";
          break;
        case ScalarType.SFIXED64:
          d = i || PbLong.from(value).isZero();
          t = WireType.Bit64;
          m = "sfixed64";
          break;
        case ScalarType.SINT32:
          m = "sint32";
          break;
        case ScalarType.SINT64:
          d = i || PbLong.from(value).isZero();
          m = "sint64";
          break;
      }
      return [t, m, i || d];
    }
  };

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-create.js
  function reflectionCreate(type) {
    const msg = type.messagePrototype ? Object.create(type.messagePrototype) : Object.defineProperty({}, MESSAGE_TYPE, { value: type });
    for (let field of type.fields) {
      let name = field.localName;
      if (field.opt)
        continue;
      if (field.oneof)
        msg[field.oneof] = { oneofKind: void 0 };
      else if (field.repeat)
        msg[name] = [];
      else
        switch (field.kind) {
          case "scalar":
            msg[name] = reflectionScalarDefault(field.T, field.L);
            break;
          case "enum":
            msg[name] = 0;
            break;
          case "map":
            msg[name] = {};
            break;
        }
    }
    return msg;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-merge-partial.js
  function reflectionMergePartial(info, target, source) {
    let fieldValue, input = source, output;
    for (let field of info.fields) {
      let name = field.localName;
      if (field.oneof) {
        const group = input[field.oneof];
        if ((group === null || group === void 0 ? void 0 : group.oneofKind) == void 0) {
          continue;
        }
        fieldValue = group[name];
        output = target[field.oneof];
        output.oneofKind = group.oneofKind;
        if (fieldValue == void 0) {
          delete output[name];
          continue;
        }
      } else {
        fieldValue = input[name];
        output = target;
        if (fieldValue == void 0) {
          continue;
        }
      }
      if (field.repeat)
        output[name].length = fieldValue.length;
      switch (field.kind) {
        case "scalar":
        case "enum":
          if (field.repeat)
            for (let i = 0; i < fieldValue.length; i++)
              output[name][i] = fieldValue[i];
          else
            output[name] = fieldValue;
          break;
        case "message":
          let T = field.T();
          if (field.repeat)
            for (let i = 0; i < fieldValue.length; i++)
              output[name][i] = T.create(fieldValue[i]);
          else if (output[name] === void 0)
            output[name] = T.create(fieldValue);
          else
            T.mergePartial(output[name], fieldValue);
          break;
        case "map":
          switch (field.V.kind) {
            case "scalar":
            case "enum":
              Object.assign(output[name], fieldValue);
              break;
            case "message":
              let T2 = field.V.T();
              for (let k of Object.keys(fieldValue))
                output[name][k] = T2.create(fieldValue[k]);
              break;
          }
          break;
      }
    }
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/reflection-equals.js
  function reflectionEquals(info, a, b) {
    if (a === b)
      return true;
    if (!a || !b)
      return false;
    for (let field of info.fields) {
      let localName = field.localName;
      let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
      let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
      switch (field.kind) {
        case "enum":
        case "scalar":
          let t = field.kind == "enum" ? ScalarType.INT32 : field.T;
          if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b)))
            return false;
          break;
        case "map":
          if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
            return false;
          break;
        case "message":
          let T = field.T();
          if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b)))
            return false;
          break;
      }
    }
    return true;
  }
  var objectValues = Object.values;
  function primitiveEq(type, a, b) {
    if (a === b)
      return true;
    if (type !== ScalarType.BYTES)
      return false;
    let ba = a;
    let bb = b;
    if (ba.length !== bb.length)
      return false;
    for (let i = 0; i < ba.length; i++)
      if (ba[i] != bb[i])
        return false;
    return true;
  }
  function repeatedPrimitiveEq(type, a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!primitiveEq(type, a[i], b[i]))
        return false;
    return true;
  }
  function repeatedMsgEq(type, a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!type.equals(a[i], b[i]))
        return false;
    return true;
  }

  // node_modules/@protobuf-ts/runtime/build/es2015/message-type.js
  var baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
  var messageTypeDescriptor = baseDescriptors[MESSAGE_TYPE] = {};
  var MessageType = class {
    constructor(name, fields, options) {
      this.defaultCheckDepth = 16;
      this.typeName = name;
      this.fields = fields.map(normalizeFieldInfo);
      this.options = options !== null && options !== void 0 ? options : {};
      messageTypeDescriptor.value = this;
      this.messagePrototype = Object.create(null, baseDescriptors);
      this.refTypeCheck = new ReflectionTypeCheck(this);
      this.refJsonReader = new ReflectionJsonReader(this);
      this.refJsonWriter = new ReflectionJsonWriter(this);
      this.refBinReader = new ReflectionBinaryReader(this);
      this.refBinWriter = new ReflectionBinaryWriter(this);
    }
    create(value) {
      let message = reflectionCreate(this);
      if (value !== void 0) {
        reflectionMergePartial(this, message, value);
      }
      return message;
    }
    /**
     * Clone the message.
     *
     * Unknown fields are discarded.
     */
    clone(message) {
      let copy = this.create();
      reflectionMergePartial(this, copy, message);
      return copy;
    }
    /**
     * Determines whether two message of the same type have the same field values.
     * Checks for deep equality, traversing repeated fields, oneof groups, maps
     * and messages recursively.
     * Will also return true if both messages are `undefined`.
     */
    equals(a, b) {
      return reflectionEquals(this, a, b);
    }
    /**
     * Is the given value assignable to our message type
     * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
     */
    is(arg, depth = this.defaultCheckDepth) {
      return this.refTypeCheck.is(arg, depth, false);
    }
    /**
     * Is the given value assignable to our message type,
     * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
     */
    isAssignable(arg, depth = this.defaultCheckDepth) {
      return this.refTypeCheck.is(arg, depth, true);
    }
    /**
     * Copy partial data into the target message.
     */
    mergePartial(target, source) {
      reflectionMergePartial(this, target, source);
    }
    /**
     * Create a new message from binary format.
     */
    fromBinary(data, options) {
      let opt = binaryReadOptions(options);
      return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
    }
    /**
     * Read a new message from a JSON value.
     */
    fromJson(json, options) {
      return this.internalJsonRead(json, jsonReadOptions(options));
    }
    /**
     * Read a new message from a JSON string.
     * This is equivalent to `T.fromJson(JSON.parse(json))`.
     */
    fromJsonString(json, options) {
      let value = JSON.parse(json);
      return this.fromJson(value, options);
    }
    /**
     * Write the message to canonical JSON value.
     */
    toJson(message, options) {
      return this.internalJsonWrite(message, jsonWriteOptions(options));
    }
    /**
     * Convert the message to canonical JSON string.
     * This is equivalent to `JSON.stringify(T.toJson(t))`
     */
    toJsonString(message, options) {
      var _a;
      let value = this.toJson(message, options);
      return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
    }
    /**
     * Write the message to binary format.
     */
    toBinary(message, options) {
      let opt = binaryWriteOptions(options);
      return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
    }
    /**
     * This is an internal method. If you just want to read a message from
     * JSON, use `fromJson()` or `fromJsonString()`.
     *
     * Reads JSON value and merges the fields into the target
     * according to protobuf rules. If the target is omitted,
     * a new instance is created first.
     */
    internalJsonRead(json, options, target) {
      if (json !== null && typeof json == "object" && !Array.isArray(json)) {
        let message = target !== null && target !== void 0 ? target : this.create();
        this.refJsonReader.read(json, message, options);
        return message;
      }
      throw new Error(`Unable to parse message ${this.typeName} from JSON ${typeofJsonValue(json)}.`);
    }
    /**
     * This is an internal method. If you just want to write a message
     * to JSON, use `toJson()` or `toJsonString().
     *
     * Writes JSON value and returns it.
     */
    internalJsonWrite(message, options) {
      return this.refJsonWriter.write(message, options);
    }
    /**
     * This is an internal method. If you just want to write a message
     * in binary format, use `toBinary()`.
     *
     * Serializes the message in binary format and appends it to the given
     * writer. Returns passed writer.
     */
    internalBinaryWrite(message, writer, options) {
      this.refBinWriter.write(message, writer, options);
      return writer;
    }
    /**
     * This is an internal method. If you just want to read a message from
     * binary data, use `fromBinary()`.
     *
     * Reads data from binary format and merges the fields into
     * the target according to protobuf rules. If the target is
     * omitted, a new instance is created first.
     */
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create();
      this.refBinReader.read(reader, message, options, length);
      return message;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Messages/signalling_messages.js
  var base_message$Type = class extends MessageType {
    constructor() {
      super("base_message", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var base_message = new base_message$Type();
  var peerConnectionOptions$Type = class extends MessageType {
    constructor() {
      super("peerConnectionOptions", []);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var peerConnectionOptions = new peerConnectionOptions$Type();
  var config$Type = class extends MessageType {
    constructor() {
      super("config", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        { no: 2, name: "peerConnectionOptions", kind: "message", T: () => peerConnectionOptions },
        {
          no: 3,
          name: "protocolVersion",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* peerConnectionOptions peerConnectionOptions */
          2:
            message.peerConnectionOptions = peerConnectionOptions.internalBinaryRead(reader, reader.uint32(), options, message.peerConnectionOptions);
            break;
          case /* optional string protocolVersion */
          3:
            message.protocolVersion = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.peerConnectionOptions)
        peerConnectionOptions.internalBinaryWrite(message.peerConnectionOptions, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
      if (message.protocolVersion !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.protocolVersion);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var config = new config$Type();
  var identify$Type = class extends MessageType {
    constructor() {
      super("identify", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var identify = new identify$Type();
  var endpointId$Type = class extends MessageType {
    constructor() {
      super("endpointId", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "id",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "protocolVersion",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.id = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string id */
          2:
            message.id = reader.string();
            break;
          case /* optional string protocolVersion */
          3:
            message.protocolVersion = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.id !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.id);
      if (message.protocolVersion !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.protocolVersion);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var endpointId = new endpointId$Type();
  var endpointIdConfirm$Type = class extends MessageType {
    constructor() {
      super("endpointIdConfirm", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "committedId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.committedId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string committedId */
          2:
            message.committedId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.committedId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.committedId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var endpointIdConfirm = new endpointIdConfirm$Type();
  var streamerIdChanged$Type = class extends MessageType {
    constructor() {
      super("streamerIdChanged", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "newID",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.newID = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string newID */
          2:
            message.newID = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.newID !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.newID);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var streamerIdChanged = new streamerIdChanged$Type();
  var listStreamers$Type = class extends MessageType {
    constructor() {
      super("listStreamers", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var listStreamers = new listStreamers$Type();
  var streamerList$Type = class extends MessageType {
    constructor() {
      super("streamerList", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "ids",
          kind: "scalar",
          repeat: 2,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.ids = [];
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* repeated string ids */
          2:
            message.ids.push(reader.string());
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      for (let i = 0; i < message.ids.length; i++)
        writer.tag(2, WireType.LengthDelimited).string(message.ids[i]);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var streamerList = new streamerList$Type();
  var subscribe$Type = class extends MessageType {
    constructor() {
      super("subscribe", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "streamerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.streamerId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string streamerId */
          2:
            message.streamerId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.streamerId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.streamerId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var subscribe = new subscribe$Type();
  var unsubscribe$Type = class extends MessageType {
    constructor() {
      super("unsubscribe", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var unsubscribe = new unsubscribe$Type();
  var subscribeFailed$Type = class extends MessageType {
    constructor() {
      super("subscribeFailed", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "message",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.message = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string message */
          2:
            message.message = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.message !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.message);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var subscribeFailed = new subscribeFailed$Type();
  var playerConnected$Type = class extends MessageType {
    constructor() {
      super("playerConnected", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "dataChannel",
          kind: "scalar",
          T: 8
          /*ScalarType.BOOL*/
        },
        {
          no: 3,
          name: "sfu",
          kind: "scalar",
          T: 8
          /*ScalarType.BOOL*/
        },
        {
          no: 5,
          name: "playerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.dataChannel = false;
      message.sfu = false;
      message.playerId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* bool dataChannel */
          2:
            message.dataChannel = reader.bool();
            break;
          case /* bool sfu */
          3:
            message.sfu = reader.bool();
            break;
          case /* string playerId */
          5:
            message.playerId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.dataChannel !== false)
        writer.tag(2, WireType.Varint).bool(message.dataChannel);
      if (message.sfu !== false)
        writer.tag(3, WireType.Varint).bool(message.sfu);
      if (message.playerId !== "")
        writer.tag(5, WireType.LengthDelimited).string(message.playerId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var playerConnected = new playerConnected$Type();
  var playerDisconnected$Type = class extends MessageType {
    constructor() {
      super("playerDisconnected", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "playerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.playerId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string playerId */
          2:
            message.playerId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.playerId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.playerId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var playerDisconnected = new playerDisconnected$Type();
  var offer$Type = class extends MessageType {
    constructor() {
      super("offer", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "sdp",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "playerId",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 4,
          name: "sfu",
          kind: "scalar",
          opt: true,
          T: 8
          /*ScalarType.BOOL*/
        },
        {
          no: 5,
          name: "multiplex",
          kind: "scalar",
          opt: true,
          T: 8
          /*ScalarType.BOOL*/
        },
        {
          no: 6,
          name: "scalabilityMode",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.sdp = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string sdp */
          2:
            message.sdp = reader.string();
            break;
          case /* optional string playerId */
          3:
            message.playerId = reader.string();
            break;
          case /* optional bool sfu */
          4:
            message.sfu = reader.bool();
            break;
          case /* optional bool multiplex */
          5:
            message.multiplex = reader.bool();
            break;
          case /* optional string scalabilityMode */
          6:
            message.scalabilityMode = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.sdp !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.sdp);
      if (message.playerId !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.playerId);
      if (message.sfu !== void 0)
        writer.tag(4, WireType.Varint).bool(message.sfu);
      if (message.multiplex !== void 0)
        writer.tag(5, WireType.Varint).bool(message.multiplex);
      if (message.scalabilityMode !== void 0)
        writer.tag(6, WireType.LengthDelimited).string(message.scalabilityMode);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var offer = new offer$Type();
  var answer$Type = class extends MessageType {
    constructor() {
      super("answer", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "sdp",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "playerId",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 4,
          name: "minBitrateBps",
          kind: "scalar",
          opt: true,
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 5,
          name: "maxBitrateBps",
          kind: "scalar",
          opt: true,
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.sdp = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string sdp */
          2:
            message.sdp = reader.string();
            break;
          case /* optional string playerId */
          3:
            message.playerId = reader.string();
            break;
          case /* optional int32 minBitrateBps */
          4:
            message.minBitrateBps = reader.int32();
            break;
          case /* optional int32 maxBitrateBps */
          5:
            message.maxBitrateBps = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.sdp !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.sdp);
      if (message.playerId !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.playerId);
      if (message.minBitrateBps !== void 0)
        writer.tag(4, WireType.Varint).int32(message.minBitrateBps);
      if (message.maxBitrateBps !== void 0)
        writer.tag(5, WireType.Varint).int32(message.maxBitrateBps);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var answer = new answer$Type();
  var iceCandidateData$Type = class extends MessageType {
    constructor() {
      super("iceCandidateData", [
        {
          no: 1,
          name: "candidate",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "sdpMid",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "sdpMLineIndex",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 4,
          name: "usernameFragment",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.candidate = "";
      message.sdpMid = "";
      message.sdpMLineIndex = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string candidate */
          1:
            message.candidate = reader.string();
            break;
          case /* string sdpMid */
          2:
            message.sdpMid = reader.string();
            break;
          case /* int32 sdpMLineIndex */
          3:
            message.sdpMLineIndex = reader.int32();
            break;
          case /* optional string usernameFragment */
          4:
            message.usernameFragment = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.candidate !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.candidate);
      if (message.sdpMid !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.sdpMid);
      if (message.sdpMLineIndex !== 0)
        writer.tag(3, WireType.Varint).int32(message.sdpMLineIndex);
      if (message.usernameFragment !== void 0)
        writer.tag(4, WireType.LengthDelimited).string(message.usernameFragment);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var iceCandidateData = new iceCandidateData$Type();
  var iceCandidate$Type = class extends MessageType {
    constructor() {
      super("iceCandidate", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        { no: 2, name: "candidate", kind: "message", T: () => iceCandidateData },
        {
          no: 3,
          name: "playerId",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* iceCandidateData candidate */
          2:
            message.candidate = iceCandidateData.internalBinaryRead(reader, reader.uint32(), options, message.candidate);
            break;
          case /* optional string playerId */
          3:
            message.playerId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.candidate)
        iceCandidateData.internalBinaryWrite(message.candidate, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
      if (message.playerId !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.playerId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var iceCandidate = new iceCandidate$Type();
  var disconnectPlayer$Type = class extends MessageType {
    constructor() {
      super("disconnectPlayer", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "playerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "reason",
          kind: "scalar",
          opt: true,
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.playerId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string playerId */
          2:
            message.playerId = reader.string();
            break;
          case /* optional string reason */
          3:
            message.reason = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.playerId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.playerId);
      if (message.reason !== void 0)
        writer.tag(3, WireType.LengthDelimited).string(message.reason);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var disconnectPlayer = new disconnectPlayer$Type();
  var ping$Type = class extends MessageType {
    constructor() {
      super("ping", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "time",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.time = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* int32 time */
          2:
            message.time = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.time !== 0)
        writer.tag(2, WireType.Varint).int32(message.time);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var ping = new ping$Type();
  var pong$Type = class extends MessageType {
    constructor() {
      super("pong", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "time",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.time = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* int32 time */
          2:
            message.time = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.time !== 0)
        writer.tag(2, WireType.Varint).int32(message.time);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var pong = new pong$Type();
  var streamerDisconnected$Type = class extends MessageType {
    constructor() {
      super("streamerDisconnected", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var streamerDisconnected = new streamerDisconnected$Type();
  var layerPreference$Type = class extends MessageType {
    constructor() {
      super("layerPreference", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "spatialLayer",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 3,
          name: "temporalLayer",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 4,
          name: "playerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.spatialLayer = 0;
      message.temporalLayer = 0;
      message.playerId = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* int32 spatialLayer */
          2:
            message.spatialLayer = reader.int32();
            break;
          case /* int32 temporalLayer */
          3:
            message.temporalLayer = reader.int32();
            break;
          case /* string playerId */
          4:
            message.playerId = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.spatialLayer !== 0)
        writer.tag(2, WireType.Varint).int32(message.spatialLayer);
      if (message.temporalLayer !== 0)
        writer.tag(3, WireType.Varint).int32(message.temporalLayer);
      if (message.playerId !== "")
        writer.tag(4, WireType.LengthDelimited).string(message.playerId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var layerPreference = new layerPreference$Type();
  var dataChannelRequest$Type = class extends MessageType {
    constructor() {
      super("dataChannelRequest", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var dataChannelRequest = new dataChannelRequest$Type();
  var peerDataChannels$Type = class extends MessageType {
    constructor() {
      super("peerDataChannels", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "playerId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "sendStreamId",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 4,
          name: "recvStreamId",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.playerId = "";
      message.sendStreamId = 0;
      message.recvStreamId = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string playerId */
          2:
            message.playerId = reader.string();
            break;
          case /* int32 sendStreamId */
          3:
            message.sendStreamId = reader.int32();
            break;
          case /* int32 recvStreamId */
          4:
            message.recvStreamId = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.playerId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.playerId);
      if (message.sendStreamId !== 0)
        writer.tag(3, WireType.Varint).int32(message.sendStreamId);
      if (message.recvStreamId !== 0)
        writer.tag(4, WireType.Varint).int32(message.recvStreamId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var peerDataChannels = new peerDataChannels$Type();
  var peerDataChannelsReady$Type = class extends MessageType {
    constructor() {
      super("peerDataChannelsReady", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var peerDataChannelsReady = new peerDataChannelsReady$Type();
  var streamerDataChannels$Type = class extends MessageType {
    constructor() {
      super("streamerDataChannels", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "sfuId",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 3,
          name: "sendStreamId",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        },
        {
          no: 4,
          name: "recvStreamId",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.sfuId = "";
      message.sendStreamId = 0;
      message.recvStreamId = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string sfuId */
          2:
            message.sfuId = reader.string();
            break;
          case /* int32 sendStreamId */
          3:
            message.sendStreamId = reader.int32();
            break;
          case /* int32 recvStreamId */
          4:
            message.recvStreamId = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.sfuId !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.sfuId);
      if (message.sendStreamId !== 0)
        writer.tag(3, WireType.Varint).int32(message.sendStreamId);
      if (message.recvStreamId !== 0)
        writer.tag(4, WireType.Varint).int32(message.recvStreamId);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var streamerDataChannels = new streamerDataChannels$Type();
  var startStreaming$Type = class extends MessageType {
    constructor() {
      super("startStreaming", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var startStreaming = new startStreaming$Type();
  var stopStreaming$Type = class extends MessageType {
    constructor() {
      super("stopStreaming", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var stopStreaming = new stopStreaming$Type();
  var playerCount$Type = class extends MessageType {
    constructor() {
      super("playerCount", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "count",
          kind: "scalar",
          T: 5
          /*ScalarType.INT32*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.count = 0;
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* int32 count */
          2:
            message.count = reader.int32();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.count !== 0)
        writer.tag(2, WireType.Varint).int32(message.count);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var playerCount = new playerCount$Type();
  var stats$Type = class extends MessageType {
    constructor() {
      super("stats", [
        {
          no: 1,
          name: "type",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        },
        {
          no: 2,
          name: "data",
          kind: "scalar",
          T: 9
          /*ScalarType.STRING*/
        }
      ]);
    }
    create(value) {
      const message = globalThis.Object.create(this.messagePrototype);
      message.type = "";
      message.data = "";
      if (value !== void 0)
        reflectionMergePartial(this, message, value);
      return message;
    }
    internalBinaryRead(reader, length, options, target) {
      let message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
      while (reader.pos < end) {
        let [fieldNo, wireType] = reader.tag();
        switch (fieldNo) {
          case /* string type */
          1:
            message.type = reader.string();
            break;
          case /* string data */
          2:
            message.data = reader.string();
            break;
          default:
            let u = options.readUnknownField;
            if (u === "throw")
              throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
        }
      }
      return message;
    }
    internalBinaryWrite(message, writer, options) {
      if (message.type !== "")
        writer.tag(1, WireType.LengthDelimited).string(message.type);
      if (message.data !== "")
        writer.tag(2, WireType.LengthDelimited).string(message.data);
      let u = options.writeUnknownFields;
      if (u !== false)
        (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
      return writer;
    }
  };
  var stats = new stats$Type();

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Messages/message_registry.js
  var MessageRegistry = {
    answer,
    config,
    disconnectPlayer,
    endpointId,
    endpointIdConfirm,
    iceCandidate,
    identify,
    listStreamers,
    offer,
    ping,
    playerConnected,
    playerCount,
    playerDisconnected,
    pong,
    stats,
    streamerDisconnected,
    streamerList,
    subscribe,
    unsubscribe,
    layerPreference,
    dataChannelRequest,
    peerDataChannels,
    peerDataChannelsReady,
    streamerDataChannels,
    startStreaming,
    stopStreaming
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Messages/message_helpers.js
  var message_helpers_exports = {};
  __export(message_helpers_exports, {
    createMessage: () => createMessage,
    validateMessage: () => validateMessage
  });
  function createMessage(messageType, params) {
    const message = messageType.create();
    message.type = messageType.typeName;
    if (params) {
      messageType.mergePartial(message, params);
    }
    return message;
  }
  function validateMessage(msg) {
    var _a;
    let valid = true;
    if (!msg.type) {
      Logger.Error(`Parsed message has no type. Rejected. ${JSON.stringify(msg)}`);
      return null;
    }
    const messageType = MessageRegistry[msg.type];
    if (!messageType) {
      Logger.Error(`Message is of an unknown type: "${msg.type}". Rejected.`);
      return null;
    }
    if (messageType.fields) {
      for (const field of messageType.fields) {
        if (!field.opt) {
          if (!Object.prototype.hasOwnProperty.call(msg, field.name)) {
            Logger.Error(`Message "${msg.type}" is missing required field "${field.name}". Rejected.`);
            valid = false;
          }
        }
      }
    }
    for (const fieldName in msg) {
      const found = (_a = messageType.fields) === null || _a === void 0 ? void 0 : _a.find((field) => field.name === fieldName);
      if (!found) {
        Logger.Error(`Message "${msg.type}" contains unknown field "${fieldName}". Rejected.`);
        valid = false;
      }
    }
    return valid ? messageType : null;
  }

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Protocol/KeepaliveMonitor.js
  var KeepaliveMonitor = class {
    /**
     * Gets the Round Trip Time of the current connection in milliseconds.
     */
    get RTT() {
      return this.rtt;
    }
    /**
     * Creates a new monitor and starts the ping timer. If a pong does not come back by the time we want
     * to send a second ping then the connection is considered dead and the onTimeout callback is fired.
     * @param protocol - The connection that we want to monitor.
     * @param timeout - The time in milliseconds between ping messages.
     */
    constructor(protocol, timeout) {
      this.alive = false;
      this.rtt = 0;
      this.protocol = protocol;
      this.timeout = timeout;
      this.onResponse = this.onHeartbeatResponse.bind(this);
      this.protocol.transport.on("close", this.stop.bind(this));
      this.start();
    }
    start() {
      this.alive = true;
      this.protocol.on("pong", this.onResponse);
      this.keepalive = setInterval(this.sendHeartbeat.bind(this), this.timeout);
    }
    stop() {
      clearInterval(this.keepalive);
      this.protocol.off("pong", this.onResponse);
    }
    sendHeartbeat() {
      var _a;
      if (this.alive === false) {
        (_a = this.onTimeout) === null || _a === void 0 ? void 0 : _a.call(this);
        return;
      }
      this.alive = false;
      this.protocol.sendMessage(createMessage(ping, { time: (/* @__PURE__ */ new Date()).getTime() }));
    }
    onHeartbeatResponse(pongMsg) {
      this.rtt = (/* @__PURE__ */ new Date()).getTime() - pongMsg.time;
      this.alive = true;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingcommon-ue5.5/dist/esm/Util/SdpUtils.js
  var SDPUtils = class {
    static addVideoHeaderExtensionToSdp(sdp, uri) {
      const usedIds = sdp.split("\n").filter((line) => line.startsWith("a=extmap:")).map((line) => parseInt(line.split(" ")[0].substring(9), 10)).sort((a, b) => a - b).filter((item, index2, array) => array.indexOf(item) === index2);
      const nextId = usedIds[usedIds.length - 1] + 1;
      const extmapLine = "a=extmap:" + nextId + " " + uri + "\r\n";
      const sections = sdp.split("\nm=").map((part, index2) => {
        return (index2 > 0 ? "m=" + part : part).trim() + "\r\n";
      });
      const sessionPart = sections.shift();
      return sessionPart + sections.map((mediaSection) => mediaSection.startsWith("m=video") ? mediaSection + extmapLine : mediaSection).join("");
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/VideoPlayer/StreamController.js
  var StreamController = class {
    /**
     * @param videoElementProvider Video Player instance
     */
    constructor(videoElementProvider) {
      this.videoElementProvider = videoElementProvider;
      this.audioElement = document.createElement("Audio");
      this.videoElementProvider.setAudioElement(this.audioElement);
    }
    /**
     * Handles when the Peer connection has a track event
     * @param rtcTrackEvent - RTC Track Event
     */
    handleOnTrack(rtcTrackEvent) {
      Logger.Info("handleOnTrack " + JSON.stringify(rtcTrackEvent.streams));
      if (rtcTrackEvent.streams.length < 1 || rtcTrackEvent.streams[0].id === "probator") {
        return;
      }
      const videoElement = this.videoElementProvider.getVideoElement();
      if (rtcTrackEvent.track) {
        Logger.Info("Got track - " + rtcTrackEvent.track.kind + " id=" + rtcTrackEvent.track.id + " readyState=" + rtcTrackEvent.track.readyState);
      }
      if (rtcTrackEvent.track.kind === "audio") {
        this.CreateAudioTrack(rtcTrackEvent.streams[0]);
        return;
      } else if (rtcTrackEvent.track.kind === "video" && videoElement.srcObject !== rtcTrackEvent.streams[0]) {
        videoElement.srcObject = rtcTrackEvent.streams[0];
        Logger.Info("Set video source from video track ontrack.");
        return;
      }
    }
    /**
     * Creates the audio device when receiving an RTCTrackEvent with the kind of "audio"
     * @param audioMediaStream - Audio Media stream track
     */
    CreateAudioTrack(audioMediaStream) {
      const videoElement = this.videoElementProvider.getVideoElement();
      if (videoElement.srcObject == audioMediaStream) {
        return;
      } else if (videoElement.srcObject && videoElement.srcObject !== audioMediaStream) {
        this.audioElement.srcObject = audioMediaStream;
        Logger.Info("Created new audio element to play separate audio stream.");
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/FreezeFrame/FreezeFrame.js
  var FreezeFrame = class {
    /**
     * Construct a freeze frame
     * @param rootDiv the div that a freeze frame element will be injected into
     */
    constructor(rootDiv) {
      this.freezeFrameHeight = 0;
      this.freezeFrameWidth = 0;
      this.rootDiv = rootDiv;
      this.rootElement = document.createElement("div");
      this.rootElement.id = "freezeFrame";
      this.rootElement.style.display = "none";
      this.rootElement.style.pointerEvents = "none";
      this.rootElement.style.position = "absolute";
      this.rootElement.style.zIndex = "20";
      this.imageElement = document.createElement("img");
      this.imageElement.style.position = "absolute";
      this.rootElement.appendChild(this.imageElement);
      this.rootDiv.appendChild(this.rootElement);
    }
    /**
     * Set the freeze frame element for showing
     */
    setElementForShow() {
      this.rootElement.style.display = "block";
    }
    /**
     * Set the freeze frame element for hiding
     */
    setElementForHide() {
      this.rootElement.style.display = "none";
    }
    /**
     * Update the freeze frames image source
     * @param jpeg - the freeze frame image as a byte array data
     */
    updateImageElementSource(jpeg) {
      const base64 = btoa(jpeg.reduce((data, byte) => data + String.fromCharCode(byte), ""));
      this.imageElement.src = "data:image/jpeg;base64," + base64;
    }
    /**
     * Set the dimensions for the freeze frame from the element and resize it
     */
    setDimensionsFromElementAndResize() {
      this.freezeFrameHeight = this.imageElement.naturalHeight;
      this.freezeFrameWidth = this.imageElement.naturalWidth;
      this.resize();
    }
    /**
     * Resize a freeze frame element
     */
    resize() {
      if (this.freezeFrameWidth !== 0 && this.freezeFrameHeight !== 0) {
        let displayWidth = 0;
        let displayHeight = 0;
        let displayTop = 0;
        let displayLeft = 0;
        const parentAspectRatio = this.rootDiv.clientWidth / this.rootDiv.clientHeight;
        const videoAspectRatio = this.freezeFrameWidth / this.freezeFrameHeight;
        if (parentAspectRatio < videoAspectRatio) {
          displayWidth = this.rootDiv.clientWidth;
          displayHeight = Math.floor(this.rootDiv.clientWidth / videoAspectRatio);
          displayTop = Math.floor((this.rootDiv.clientHeight - displayHeight) * 0.5);
          displayLeft = 0;
        } else {
          displayWidth = Math.floor(this.rootDiv.clientHeight * videoAspectRatio);
          displayHeight = this.rootDiv.clientHeight;
          displayTop = 0;
          displayLeft = Math.floor((this.rootDiv.clientWidth - displayWidth) * 0.5);
        }
        this.rootElement.style.width = this.rootDiv.offsetWidth + "px";
        this.rootElement.style.height = this.rootDiv.offsetHeight + "px";
        this.rootElement.style.left = "0px";
        this.rootElement.style.top = "0px";
        this.imageElement.style.width = displayWidth + "px";
        this.imageElement.style.height = displayHeight + "px";
        this.imageElement.style.left = displayLeft + "px";
        this.imageElement.style.top = displayTop + "px";
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/FreezeFrame/FreezeFrameController.js
  var FreezeFrameController = class {
    /**
     * Construct a freeze frame controller
     * @param rootDiv - the div that a freeze frame element will be injected into
     */
    constructor(rootDiv) {
      this.receiving = false;
      this.size = 0;
      this.jpeg = void 0;
      this.valid = false;
      this.freezeFrameDelay = 50;
      this.freezeFrame = new FreezeFrame(rootDiv);
    }
    /**
     * Show the freeze frame if it is valid
     */
    showFreezeFrame() {
      if (this.valid) {
        this.freezeFrame.setElementForShow();
      }
    }
    /**
     * Hide the freeze frame and set the validity to false
     */
    hideFreezeFrame() {
      this.valid = false;
      this.freezeFrame.setElementForHide();
    }
    /**
     * Update the freeze frames image source and load it
     * @param jpeg - the freeze frame image as a byte array data
     * @param onLoadCallBack - a call back for managing if the play overlay needs to be shown or not
     */
    updateFreezeFrameAndShow(jpeg, onLoadCallBack) {
      this.freezeFrame.updateImageElementSource(jpeg);
      this.freezeFrame.imageElement.onload = () => {
        this.freezeFrame.setDimensionsFromElementAndResize();
        onLoadCallBack();
      };
    }
    /**
     * Process the new freeze frame image and update it
     * @param view - the freeze frame image as a byte array data
     * @param onLoadCallBack - a call back for managing if the play overlay needs to be shown or not
     */
    processFreezeFrameMessage(view, onLoadCallBack) {
      if (!this.receiving) {
        this.receiving = true;
        this.valid = false;
        this.size = 0;
        this.jpeg = void 0;
      }
      this.size = new DataView(view.slice(1, 5).buffer).getInt32(0, true);
      const jpegBytes = view.slice(1 + 4);
      if (this.jpeg) {
        const jpeg = new Uint8Array(this.jpeg.length + jpegBytes.length);
        jpeg.set(this.jpeg, 0);
        jpeg.set(jpegBytes, this.jpeg.length);
        this.jpeg = jpeg;
      } else {
        this.jpeg = jpegBytes;
        this.receiving = true;
        Logger.Info(`received first chunk of freeze frame: ${this.jpeg.length}/${this.size}`);
      }
      if (this.jpeg.length === this.size) {
        this.receiving = false;
        this.valid = true;
        Logger.Info(`received complete freeze frame ${this.size}`);
        this.updateFreezeFrameAndShow(this.jpeg, onLoadCallBack);
      } else if (this.jpeg.length > this.size) {
        Logger.Error(`received bigger freeze frame than advertised: ${this.jpeg.length}/${this.size}`);
        this.jpeg = void 0;
        this.receiving = false;
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/SettingBase.js
  var SettingBase = class {
    constructor(id, label, description, defaultSettingValue, defaultOnChangeListener = () => {
    }) {
      this.parseURLParams();
      this.onChange = defaultOnChangeListener;
      this.onChangeEmit = () => {
      };
      this.id = id;
      this.description = description;
      this.label = label;
      this.value = defaultSettingValue;
    }
    /**
     * Set the label text for the setting.
     * @param label setting label.
     */
    set label(inLabel) {
      this._label = inLabel;
      this.onChangeEmit(this._value);
    }
    /**
     * @returns The label text for the setting.
     */
    get label() {
      return this._label;
    }
    /**
     * @return The setting's value.
     */
    get value() {
      return this._value;
    }
    /**
     * Update the setting's stored value.
     * @param inValue The new value for the setting.
     */
    set value(inValue) {
      this._value = inValue;
      this.onChange(this._value, this);
      this.onChangeEmit(this._value);
    }
    /**
     * Persist the setting value in URL.
     */
    updateURLParams() {
      if (this.useUrlParams) {
        const urlParams = new URLSearchParams(window.location.search);
        const valueString = this.getValueAsString();
        let set = false;
        for (const [name, _value] of urlParams) {
          if (name.toLowerCase() == this.id.toLowerCase()) {
            urlParams.set(name, valueString);
            set = true;
            break;
          }
        }
        if (!set) {
          urlParams.set(this.id, valueString);
        }
        window.history.replaceState({}, "", urlParams.toString() !== "" ? `${location.pathname}?${urlParams}` : `${location.pathname}`);
      }
    }
    /**
     * Allows sub types to provide their value for the url search params.
     */
    getValueAsString() {
      return "";
    }
    parseURLParams() {
      this._urlParams = {};
      const params = new URLSearchParams(window.location.search);
      for (const [name, value] of params) {
        this._urlParams[name.toLowerCase()] = value;
      }
    }
    hasURLParam(name) {
      return name.toLowerCase() in this._urlParams;
    }
    getURLParam(name) {
      if (this.hasURLParam(name)) {
        return this._urlParams[name.toLowerCase()];
      }
      return "";
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/SettingFlag.js
  var SettingFlag = class extends SettingBase {
    constructor(id, label, description, defaultFlagValue, useUrlParams, defaultOnChangeListener = () => {
    }) {
      super(id, label, description, defaultFlagValue, defaultOnChangeListener);
      if (!useUrlParams || !this.hasURLParam(this.id)) {
        this.flag = defaultFlagValue;
      } else {
        const urlParamFlag = this.getURLParam(this.id);
        this.flag = urlParamFlag.toLowerCase() != "false";
      }
      this.useUrlParams = useUrlParams;
    }
    getValueAsString() {
      return this.flag ? "true" : "false";
    }
    /**
     * Enables this flag.
     */
    enable() {
      this.flag = true;
    }
    /**
     * @return The setting's value.
     */
    get flag() {
      return !!this.value;
    }
    /**
     * Update the setting's stored value.
     * @param inValue The new value for the setting.
     */
    set flag(inValue) {
      this.value = inValue;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/SettingNumber.js
  var SettingNumber = class extends SettingBase {
    constructor(id, label, description, min, max, defaultNumber, useUrlParams, defaultOnChangeListener = () => {
    }) {
      super(id, label, description, defaultNumber, defaultOnChangeListener);
      this._min = min;
      this._max = max;
      if (!useUrlParams || !this.hasURLParam(this.id)) {
        this.number = defaultNumber;
      } else {
        const parsedValue = Number.parseFloat(this.getURLParam(this.id));
        this.number = Number.isNaN(parsedValue) ? defaultNumber : parsedValue;
      }
      this.useUrlParams = useUrlParams;
    }
    getValueAsString() {
      return this.number.toString();
    }
    /**
     * Set the number value (will be clamped within range).
     */
    set number(newNumber) {
      this.value = this.clamp(newNumber);
    }
    /**
     * @returns The number stored.
     */
    get number() {
      return this.value;
    }
    /**
     * Clamps a number between the min and max values (inclusive).
     * @param inNumber The number to clamp.
     * @returns The clamped number.
     */
    clamp(inNumber) {
      if (this._min == null && this._max == null) {
        return inNumber;
      } else if (this._min == null) {
        return Math.min(this._max, inNumber);
      } else if (this._max == null) {
        return Math.max(this._min, inNumber);
      } else {
        return Math.max(Math.min(this._max, inNumber), this._min);
      }
    }
    /**
     * Returns the minimum value
     * @returns The minimum value
     */
    get min() {
      return this._min;
    }
    /**
     * Returns the maximum value
     * @returns The maximum value
     */
    get max() {
      return this._max;
    }
    /**
     * Add a change listener to the number object.
     */
    addOnChangedListener(onChangedFunc) {
      this.onChange = onChangedFunc;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/SettingText.js
  var SettingText = class extends SettingBase {
    constructor(id, label, description, defaultTextValue, useUrlParams, defaultOnChangeListener = () => {
    }) {
      super(id, label, description, defaultTextValue, defaultOnChangeListener);
      if (!useUrlParams || !this.hasURLParam(this.id)) {
        this.text = defaultTextValue;
      } else {
        this.text = this.getURLParam(this.id);
      }
      this.useUrlParams = useUrlParams;
    }
    getValueAsString() {
      return this.text;
    }
    /**
     * @return The setting's value.
     */
    get text() {
      return this.value;
    }
    /**
     * Update the setting's stored value.
     * @param inValue The new value for the setting.
     */
    set text(inValue) {
      this.value = inValue;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/SettingOption.js
  var SettingOption = class extends SettingBase {
    constructor(id, label, description, defaultTextValue, options, useUrlParams, defaultUrlParamResolver = function(value) {
      return value;
    }, defaultOnChangeListener = () => {
    }) {
      super(id, label, description, defaultTextValue, defaultOnChangeListener);
      this._urlParamResolver = defaultUrlParamResolver;
      const stringToMatch = this.hasURLParam(this.id) ? this._urlParamResolver(this.getURLParam(this.id)) : defaultTextValue;
      this.options = options !== null && options !== void 0 ? options : [stringToMatch];
      this.selected = stringToMatch;
      this.useUrlParams = useUrlParams;
    }
    getValueAsString() {
      return this.selected;
    }
    /**
     * Add a change listener to the select element.
     */
    addOnChangedListener(onChangedFunc) {
      this.onChange = onChangedFunc;
    }
    /**
     * @returns All available options as an array
     */
    get options() {
      return this._options;
    }
    /**
     * Set options
     * @param values Array of options
     */
    set options(values) {
      this._options = values;
      this.onChangeEmit(this.selected);
    }
    /**
     * @returns Selected option as a string
     */
    get selected() {
      return this.value;
    }
    /**
     * Set selected option if it matches one of the available options
     * @param value Selected option
     */
    set selected(value) {
      if (value === void 0) {
        return;
      }
      if (this.options.includes(value)) {
        this.value = value;
      } else {
        Logger.Error(`Could not set "${value}" as the selected option for ${this.id} because it wasn't one of the options.`);
      }
    }
    /**
     * Set the url parameter resolver to do some transformation to the string value
     * that is extracted from the url parameters.
     * @param urlParam A function that transforms the extracted url parameter string for this setting to something else.
     */
    set urlParamResolver(value) {
      this._urlParamResolver = value;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/EventEmitter.js
  var AfkWarningActivateEvent = class extends Event {
    constructor(data) {
      super("afkWarningActivate");
      this.data = data;
    }
  };
  var AfkWarningUpdateEvent = class extends Event {
    constructor(data) {
      super("afkWarningUpdate");
      this.data = data;
    }
  };
  var AfkWarningDeactivateEvent = class extends Event {
    constructor() {
      super("afkWarningDeactivate");
    }
  };
  var AfkTimedOutEvent = class extends Event {
    constructor() {
      super("afkTimedOut");
    }
  };
  var VideoEncoderAvgQPEvent = class extends Event {
    constructor(data) {
      super("videoEncoderAvgQP");
      this.data = data;
    }
  };
  var WebRtcSdpEvent = class extends Event {
    constructor() {
      super("webRtcSdp");
    }
  };
  var WebRtcSdpAnswerEvent = class extends Event {
    constructor(data) {
      super("webRtcSdpAnswer");
      this.data = data;
    }
  };
  var WebRtcSdpOfferEvent = class extends Event {
    constructor(data) {
      super("webRtcSdpOffer");
      this.data = data;
    }
  };
  var WebRtcAutoConnectEvent = class extends Event {
    constructor() {
      super("webRtcAutoConnect");
    }
  };
  var WebRtcConnectingEvent = class extends Event {
    constructor() {
      super("webRtcConnecting");
    }
  };
  var WebRtcConnectedEvent = class extends Event {
    constructor() {
      super("webRtcConnected");
    }
  };
  var WebRtcFailedEvent = class extends Event {
    constructor() {
      super("webRtcFailed");
    }
  };
  var WebRtcDisconnectedEvent = class extends Event {
    constructor(data) {
      super("webRtcDisconnected");
      this.data = data;
    }
  };
  var DataChannelOpenEvent = class extends Event {
    constructor(data) {
      super("dataChannelOpen");
      this.data = data;
    }
  };
  var DataChannelCloseEvent = class extends Event {
    constructor(data) {
      super("dataChannelClose");
      this.data = data;
    }
  };
  var DataChannelErrorEvent = class extends Event {
    constructor(data) {
      super("dataChannelError");
      this.data = data;
    }
  };
  var VideoInitializedEvent = class extends Event {
    constructor() {
      super("videoInitialized");
    }
  };
  var StreamLoadingEvent = class extends Event {
    constructor() {
      super("streamLoading");
    }
  };
  var StreamPreConnectEvent = class extends Event {
    constructor() {
      super("streamConnect");
    }
  };
  var StreamPreDisconnectEvent = class extends Event {
    constructor() {
      super("streamDisconnect");
    }
  };
  var StreamReconnectEvent = class extends Event {
    constructor() {
      super("streamReconnect");
    }
  };
  var PlayStreamErrorEvent = class extends Event {
    constructor(data) {
      super("playStreamError");
      this.data = data;
    }
  };
  var PlayStreamEvent = class extends Event {
    constructor() {
      super("playStream");
    }
  };
  var PlayStreamRejectedEvent = class extends Event {
    constructor(data) {
      super("playStreamRejected");
      this.data = data;
    }
  };
  var LoadFreezeFrameEvent = class extends Event {
    constructor(data) {
      super("loadFreezeFrame");
      this.data = data;
    }
  };
  var HideFreezeFrameEvent = class extends Event {
    constructor() {
      super("hideFreezeFrame");
    }
  };
  var StatsReceivedEvent = class extends Event {
    constructor(data) {
      super("statsReceived");
      this.data = data;
    }
  };
  var StreamerListMessageEvent = class extends Event {
    constructor(data) {
      super("streamerListMessage");
      this.data = data;
    }
  };
  var StreamerIDChangedMessageEvent = class extends Event {
    constructor(data) {
      super("StreamerIDChangedMessage");
      this.data = data;
    }
  };
  var LatencyTestResultEvent = class extends Event {
    constructor(data) {
      super("latencyTestResult");
      this.data = data;
    }
  };
  var LatencyCalculatedEvent = class extends Event {
    constructor(data) {
      super("latencyCalculated");
      this.data = data;
    }
  };
  var ShowOnScreenKeyboardEvent = class extends Event {
    constructor(data) {
      super("showOnScreenKeyboard");
      this.data = data;
    }
  };
  var DataChannelLatencyTestResponseEvent = class extends Event {
    constructor(data) {
      super("dataChannelLatencyTestResponse");
      this.data = data;
    }
  };
  var DataChannelLatencyTestResultEvent = class extends Event {
    constructor(data) {
      super("dataChannelLatencyTestResult");
      this.data = data;
    }
  };
  var SubscribeFailedEvent = class extends Event {
    constructor(data) {
      super("subscribeFailed");
      this.data = data;
    }
  };
  var InitialSettingsEvent = class extends Event {
    constructor(data) {
      super("initialSettings");
      this.data = data;
    }
  };
  var SettingsChangedEvent = class extends Event {
    constructor(data) {
      super("settingsChanged");
      this.data = data;
    }
  };
  var XrFrameEvent = class extends Event {
    constructor(data) {
      super("xrFrame");
      this.data = data;
    }
  };
  var PlayerCountEvent = class extends Event {
    constructor(data) {
      super("playerCount");
      this.data = data;
    }
  };
  var WebRtcTCPRelayDetectedEvent = class extends Event {
    constructor() {
      super("webRtcTCPRelayDetected");
    }
  };
  var PixelStreamingEventEmitter = class extends EventTarget {
    /**
     * Dispatch a new event.
     * @param e event
     * @returns
     */
    dispatchEvent(e) {
      return super.dispatchEvent(e);
    }
    /**
     * Register an event handler.
     * @param type event name
     * @param listener event handler function
     */
    addEventListener(type, listener) {
      super.addEventListener(type, listener);
    }
    /**
     * Remove an event handler.
     * @param type event name
     * @param listener event handler function
     */
    removeEventListener(type, listener) {
      super.removeEventListener(type, listener);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/BrowserUtils.js
  var BrowserUtils = class {
    static getSupportedVideoCodecs() {
      const browserSupportedCodecs = [];
      if (!RTCRtpReceiver.getCapabilities) {
        Logger.Warning("RTCRtpReceiver.getCapabilities API is not available in your browser, defaulting to guess that we support H.264.");
        browserSupportedCodecs.push("H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f");
        return browserSupportedCodecs;
      }
      const matcher = /(VP\d|H26\d|AV1).*/;
      const capabilities = RTCRtpReceiver.getCapabilities("video");
      if (!capabilities) {
        browserSupportedCodecs.push("H264 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f");
        return browserSupportedCodecs;
      }
      capabilities.codecs.forEach((codec) => {
        const str = codec.mimeType.split("/")[1] + " " + (codec.sdpFmtpLine || "");
        const match = matcher.exec(str);
        if (match !== null) {
          browserSupportedCodecs.push(str);
        }
      });
      return browserSupportedCodecs;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Config/Config.js
  var Flags = class {
  };
  Flags.AutoConnect = "AutoConnect";
  Flags.AutoPlayVideo = "AutoPlayVideo";
  Flags.AFKDetection = "TimeoutIfIdle";
  Flags.HoveringMouseMode = "HoveringMouse";
  Flags.ForceMonoAudio = "ForceMonoAudio";
  Flags.ForceTURN = "ForceTURN";
  Flags.FakeMouseWithTouches = "FakeMouseWithTouches";
  Flags.IsQualityController = "ControlsQuality";
  Flags.MatchViewportResolution = "MatchViewportRes";
  Flags.StartVideoMuted = "StartVideoMuted";
  Flags.SuppressBrowserKeys = "SuppressBrowserKeys";
  Flags.UseMic = "UseMic";
  Flags.UseModalForTextInput = "UseModalForTextInput";
  Flags.UseCamera = "UseCamera";
  Flags.KeyboardInput = "KeyboardInput";
  Flags.MouseInput = "MouseInput";
  Flags.MouseDoubleClickAutoRelease = "MouseDoubleClickAutoRelease";
  Flags.TouchInput = "TouchInput";
  Flags.GamepadInput = "GamepadInput";
  Flags.XRControllerInput = "XRControllerInput";
  Flags.AutoEnterVR = "AutoEnterVR";
  Flags.WaitForStreamer = "WaitForStreamer";
  Flags.HideUI = "HideUI";
  Flags.EnableCaptureTimeExt = "EnableCaptureTimeExt";
  var isFlagId = (id) => Object.getOwnPropertyNames(Flags).some((name) => Flags[name] === id);
  var NumericParameters = class {
  };
  NumericParameters.AFKTimeoutSecs = "AFKTimeout";
  NumericParameters.AFKCountdownSecs = "AFKCountdown";
  NumericParameters.MinQP = "MinQP";
  NumericParameters.MaxQP = "MaxQP";
  NumericParameters.MinQuality = "MinQuality";
  NumericParameters.MaxQuality = "MaxQuality";
  NumericParameters.CompatQualityMin = "CompatQualityMin";
  NumericParameters.CompatQualityMax = "CompatQualityMax";
  NumericParameters.WebRTCFPS = "WebRTCFPS";
  NumericParameters.WebRTCMinBitrate = "WebRTCMinBitrate";
  NumericParameters.WebRTCMaxBitrate = "WebRTCMaxBitrate";
  NumericParameters.MaxReconnectAttempts = "MaxReconnectAttempts";
  NumericParameters.StreamerAutoJoinInterval = "StreamerAutoJoinInterval";
  NumericParameters.KeepaliveDelay = "KeepaliveDelay";
  NumericParameters.ViewportResScale = "ViewportResScale";
  var isNumericId = (id) => Object.getOwnPropertyNames(NumericParameters).some((name) => NumericParameters[name] === id);
  var TextParameters = class {
  };
  TextParameters.SignallingServerUrl = "ss";
  var isTextId = (id) => Object.getOwnPropertyNames(TextParameters).some((name) => TextParameters[name] === id);
  var OptionParameters = class {
  };
  OptionParameters.PreferredCodec = "PreferredCodec";
  OptionParameters.StreamerId = "StreamerId";
  OptionParameters.PreferredQuality = "PreferredQuality";
  var isOptionId = (id) => Object.getOwnPropertyNames(OptionParameters).some((name) => OptionParameters[name] === id);
  var Config = class {
    // ------------ Settings -----------------
    constructor(config2 = {}) {
      this.flags = /* @__PURE__ */ new Map();
      this.numericParameters = /* @__PURE__ */ new Map();
      this.textParameters = /* @__PURE__ */ new Map();
      this.optionParameters = /* @__PURE__ */ new Map();
      const { initialSettings, useUrlParams, webSocketProtocols } = config2;
      this._useUrlParams = !!useUrlParams;
      this._webSocketProtocols = webSocketProtocols;
      this.populateDefaultSettings(this._useUrlParams, initialSettings);
    }
    /**
     * True if reading configuration initial values from URL parameters, and
     * persisting changes in URL when changed.
     */
    get useUrlParams() {
      return this._useUrlParams;
    }
    /**
     * Gets a protocol or list of protocols to pass to the websocket if set.
     */
    get webSocketProtocols() {
      return this._webSocketProtocols;
    }
    /**
     * Populate the default settings for a Pixel Streaming application
     */
    populateDefaultSettings(useUrlParams, settings) {
      this.textParameters.set(TextParameters.SignallingServerUrl, new SettingText(TextParameters.SignallingServerUrl, "Signalling url", "Url of the signalling server", settings && Object.prototype.hasOwnProperty.call(settings, TextParameters.SignallingServerUrl) ? settings[TextParameters.SignallingServerUrl] : (location.protocol === "https:" ? "wss://" : "ws://") + window.location.hostname + // for readability, we omit the port if it's 80
      (window.location.port === "80" || window.location.port === "" ? "" : `:${window.location.port}`), useUrlParams));
      this.optionParameters.set(OptionParameters.StreamerId, new SettingOption(OptionParameters.StreamerId, "Streamer ID", "The ID of the streamer to stream.", settings && Object.prototype.hasOwnProperty.call(settings, OptionParameters.StreamerId) ? settings[OptionParameters.StreamerId] : "", settings && Object.prototype.hasOwnProperty.call(settings, OptionParameters.StreamerId) ? [settings[OptionParameters.StreamerId]] : void 0, useUrlParams));
      const getDefaultVideoCodec = function() {
        const videoCodecs = BrowserUtils.getSupportedVideoCodecs();
        if (videoCodecs.length == 1) {
          return videoCodecs[0];
        } else if (videoCodecs.length > 0) {
          const defaultCodec = videoCodecs[0];
          for (const codec of videoCodecs) {
            if (codec.startsWith("H264")) {
              return codec;
            }
          }
          return defaultCodec;
        }
        Logger.Error("Could not find any reasonable video codec to assign as a default.");
        return "";
      };
      const matchSpecifiedCodecToClosestSupported = function(specifiedCodec) {
        const browserSupportedCodecs = BrowserUtils.getSupportedVideoCodecs();
        if (browserSupportedCodecs.includes(specifiedCodec)) {
          return specifiedCodec;
        }
        for (const browserCodec of browserSupportedCodecs) {
          if (browserCodec.startsWith(specifiedCodec)) {
            return browserCodec;
          }
        }
        return specifiedCodec;
      };
      this.optionParameters.set(OptionParameters.PreferredCodec, new SettingOption(OptionParameters.PreferredCodec, "Preferred Codec", "The preferred codec to be used during codec negotiation", settings && Object.prototype.hasOwnProperty.call(settings, OptionParameters.PreferredCodec) ? matchSpecifiedCodecToClosestSupported(settings[OptionParameters.PreferredCodec]) : getDefaultVideoCodec(), BrowserUtils.getSupportedVideoCodecs(), useUrlParams, matchSpecifiedCodecToClosestSupported));
      this.optionParameters.set(OptionParameters.PreferredQuality, new SettingOption(OptionParameters.PreferredQuality, "Preferred Quality", "The preferred quality of the stream (only applicable when using the SFU)", settings && Object.prototype.hasOwnProperty.call(settings, OptionParameters.PreferredQuality) ? settings[OptionParameters.PreferredQuality] : "Default", ["Default"], useUrlParams));
      this.flags.set(Flags.AutoConnect, new SettingFlag(Flags.AutoConnect, "Auto connect to stream", "Whether we should attempt to auto connect to the signalling server or show a click to start prompt.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.AutoConnect) ? settings[Flags.AutoConnect] : false, useUrlParams));
      this.flags.set(Flags.AutoPlayVideo, new SettingFlag(Flags.AutoPlayVideo, "Auto play video", "When video is ready automatically start playing it as opposed to showing a play button.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.AutoPlayVideo) ? settings[Flags.AutoPlayVideo] : true, useUrlParams));
      this.flags.set(Flags.UseMic, new SettingFlag(Flags.UseMic, "Use microphone", "Make browser request microphone access and open an input audio track.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.UseMic) ? settings[Flags.UseMic] : false, useUrlParams));
      this.flags.set(Flags.UseModalForTextInput, new SettingFlag(Flags.UseModalForTextInput, "Use modal for text input", "When entering input into a streamed UE text widget, use an input modal.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.UseModalForTextInput) ? settings[Flags.UseModalForTextInput] : true, useUrlParams));
      this.flags.set(Flags.UseCamera, new SettingFlag(Flags.UseCamera, "Use webcam", "Make browser request webcam access and open a input video track.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.UseCamera) ? settings[Flags.UseCamera] : false, useUrlParams));
      this.flags.set(Flags.StartVideoMuted, new SettingFlag(Flags.StartVideoMuted, "Start video muted", "Video will start muted if true.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.StartVideoMuted) ? settings[Flags.StartVideoMuted] : false, useUrlParams));
      this.flags.set(Flags.SuppressBrowserKeys, new SettingFlag(Flags.SuppressBrowserKeys, "Suppress browser keys", "Suppress certain browser keys that we use in UE, for example F5 to show shader complexity instead of refresh the page.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.SuppressBrowserKeys) ? settings[Flags.SuppressBrowserKeys] : true, useUrlParams));
      this.flags.set(Flags.IsQualityController, new SettingFlag(Flags.IsQualityController, "Is quality controller?", "True if this peer controls stream quality", settings && Object.prototype.hasOwnProperty.call(settings, Flags.IsQualityController) ? settings[Flags.IsQualityController] : true, useUrlParams));
      this.flags.set(Flags.ForceMonoAudio, new SettingFlag(Flags.ForceMonoAudio, "Force mono audio", "Force browser to request mono audio in the SDP", settings && Object.prototype.hasOwnProperty.call(settings, Flags.ForceMonoAudio) ? settings[Flags.ForceMonoAudio] : false, useUrlParams));
      this.flags.set(Flags.ForceTURN, new SettingFlag(Flags.ForceTURN, "Force TURN", "Only generate TURN/Relayed ICE candidates.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.ForceTURN) ? settings[Flags.ForceTURN] : false, useUrlParams));
      this.flags.set(Flags.AFKDetection, new SettingFlag(Flags.AFKDetection, "AFK if idle", "Timeout the experience if user is AFK for a period.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.AFKDetection) ? settings[Flags.AFKDetection] : false, useUrlParams));
      this.flags.set(Flags.MatchViewportResolution, new SettingFlag(Flags.MatchViewportResolution, "Match viewport resolution", "Pixel Streaming will be instructed to dynamically resize the video stream to match the size of the video element.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.MatchViewportResolution) ? settings[Flags.MatchViewportResolution] : false, useUrlParams));
      this.flags.set(Flags.HoveringMouseMode, new SettingFlag(Flags.HoveringMouseMode, "Control Scheme: Locked Mouse", "Either locked mouse, where the pointer is consumed by the video and locked to it, or hovering mouse, where the mouse is not consumed.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.HoveringMouseMode) ? settings[Flags.HoveringMouseMode] : false, useUrlParams, (isHoveringMouse, setting) => {
        setting.label = `Control Scheme: ${isHoveringMouse ? "Hovering" : "Locked"} Mouse`;
      }));
      this.flags.set(Flags.FakeMouseWithTouches, new SettingFlag(Flags.FakeMouseWithTouches, "Fake mouse with touches", "A single finger touch is converted into a mouse event. This allows a non-touch application to be controlled partially via a touch device.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.FakeMouseWithTouches) ? settings[Flags.FakeMouseWithTouches] : false, useUrlParams));
      this.flags.set(Flags.KeyboardInput, new SettingFlag(Flags.KeyboardInput, "Keyboard input", "If enabled, send keyboard events to streamer", settings && Object.prototype.hasOwnProperty.call(settings, Flags.KeyboardInput) ? settings[Flags.KeyboardInput] : true, useUrlParams));
      this.flags.set(Flags.MouseInput, new SettingFlag(Flags.MouseInput, "Mouse input", "If enabled, send mouse events to streamer", settings && Object.prototype.hasOwnProperty.call(settings, Flags.MouseInput) ? settings[Flags.MouseInput] : true, useUrlParams));
      this.flags.set(Flags.MouseDoubleClickAutoRelease, new SettingFlag(Flags.MouseDoubleClickAutoRelease, "Auto release after double-click", "After sending a MouseDouble message, also send a matching MouseUp so the streamer\u2019s pressed-button state stays balanced. Disable to restore pre-fix behaviour if your project handles the doubleclick release itself.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.MouseDoubleClickAutoRelease) ? settings[Flags.MouseDoubleClickAutoRelease] : true, useUrlParams));
      this.flags.set(Flags.TouchInput, new SettingFlag(Flags.TouchInput, "Touch input", "If enabled, send touch events to streamer", settings && Object.prototype.hasOwnProperty.call(settings, Flags.TouchInput) ? settings[Flags.TouchInput] : true, useUrlParams));
      this.flags.set(Flags.GamepadInput, new SettingFlag(Flags.GamepadInput, "Gamepad input", "If enabled, send gamepad events to streamer", settings && Object.prototype.hasOwnProperty.call(settings, Flags.GamepadInput) ? settings[Flags.GamepadInput] : true, useUrlParams));
      this.flags.set(Flags.XRControllerInput, new SettingFlag(Flags.XRControllerInput, "XR controller input", "If enabled, send XR controller events to streamer", settings && Object.prototype.hasOwnProperty.call(settings, Flags.XRControllerInput) ? settings[Flags.XRControllerInput] : true, useUrlParams));
      this.flags.set(Flags.AutoEnterVR, new SettingFlag(Flags.AutoEnterVR, "Auto enter VR", "When the video is ready and an immersive-vr session is supported, request the WebXR session automatically. May fail if the browser requires a user gesture to start a WebXR session.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.AutoEnterVR) ? settings[Flags.AutoEnterVR] : false, useUrlParams));
      this.flags.set(Flags.WaitForStreamer, new SettingFlag(Flags.WaitForStreamer, "Wait for streamer", "Will continue trying to connect to the first streamer available.", settings && Object.prototype.hasOwnProperty.call(settings, Flags.WaitForStreamer) ? settings[Flags.WaitForStreamer] : true, useUrlParams));
      this.flags.set(Flags.HideUI, new SettingFlag(Flags.HideUI, "Hide the UI overlay", "Will hide all UI overlay details", settings && Object.prototype.hasOwnProperty.call(settings, Flags.HideUI) ? settings[Flags.HideUI] : false, useUrlParams));
      this.flags.set(Flags.EnableCaptureTimeExt, new SettingFlag(Flags.EnableCaptureTimeExt, "Enable abs-capture-time", "Enables the abs-capture-time RTP header extension", settings && Object.prototype.hasOwnProperty.call(settings, Flags.EnableCaptureTimeExt) ? settings[Flags.EnableCaptureTimeExt] : false, useUrlParams));
      this.numericParameters.set(NumericParameters.AFKTimeoutSecs, new SettingNumber(NumericParameters.AFKTimeoutSecs, "AFK timeout", "The time (in seconds) it takes for the application to time out if AFK timeout is enabled.", 0, null, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.AFKTimeoutSecs) ? settings[NumericParameters.AFKTimeoutSecs] : 120, useUrlParams));
      this.numericParameters.set(NumericParameters.AFKCountdownSecs, new SettingNumber(NumericParameters.AFKCountdownSecs, "AFK countdown", "The time (in seconds) for a user to respond before the stream is ended after an AFK timeout.", 10, null, 10, useUrlParams));
      this.numericParameters.set(NumericParameters.MaxReconnectAttempts, new SettingNumber(NumericParameters.MaxReconnectAttempts, "Max Reconnects", "Maximum number of reconnects the application will attempt when a streamer disconnects.", 0, 999, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.MaxReconnectAttempts) ? settings[NumericParameters.MaxReconnectAttempts] : 3, useUrlParams));
      this.numericParameters.set(NumericParameters.MinQP, new SettingNumber(NumericParameters.MinQP, "Min QP", "The lower bound for the quantization parameter (QP) of the encoder. 0 = Best quality, 51 = worst quality.", 0, 51, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.MinQP) ? settings[NumericParameters.MinQP] : 0, useUrlParams));
      this.numericParameters.set(NumericParameters.MaxQP, new SettingNumber(NumericParameters.MaxQP, "Max QP", "The upper bound for the quantization parameter (QP) of the encoder. 0 = Best quality, 51 = worst quality.", 0, 51, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.MaxQP) ? settings[NumericParameters.MaxQP] : 51, useUrlParams));
      this.numericParameters.set(NumericParameters.MinQuality, new SettingNumber(NumericParameters.MinQuality, "Min Quality", "The lower bound for the quality factor of the encoder. 0 = Worst quality, 100 = Best quality.", 0, 100, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.MinQuality) ? settings[NumericParameters.MinQuality] : 0, useUrlParams));
      this.numericParameters.set(NumericParameters.MaxQuality, new SettingNumber(NumericParameters.MaxQuality, "Max Quality", "The upper bound for the quality factor of the encoder. 0 = Worst quality, 100 = Best quality.", 0, 100, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.MaxQuality) ? settings[NumericParameters.MaxQuality] : 100, useUrlParams));
      this.numericParameters.set(NumericParameters.CompatQualityMin, new SettingNumber(NumericParameters.CompatQualityMin, "Min Quality", "The lower bound for encoding quality. 0 = Worst, 100 = Best.", 0, 100, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.CompatQualityMin) ? settings[NumericParameters.CompatQualityMin] : 0, useUrlParams));
      this.numericParameters.set(NumericParameters.CompatQualityMax, new SettingNumber(NumericParameters.CompatQualityMax, "Max Quality", "The upper bound for encoding quality. 0 = Worst, 100 = Best.", 0, 100, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.CompatQualityMax) ? settings[NumericParameters.CompatQualityMax] : 100, useUrlParams));
      this.numericParameters.set(NumericParameters.WebRTCFPS, new SettingNumber(NumericParameters.WebRTCFPS, "Max FPS", "The maximum FPS that WebRTC will try to transmit frames at.", 1, 999, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.WebRTCFPS) ? settings[NumericParameters.WebRTCFPS] : 60, useUrlParams));
      this.numericParameters.set(NumericParameters.WebRTCMinBitrate, new SettingNumber(NumericParameters.WebRTCMinBitrate, "Min Bitrate (kbps)", "The minimum bitrate that WebRTC should use.", 0, 5e5, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.WebRTCMinBitrate) ? settings[NumericParameters.WebRTCMinBitrate] : 0, useUrlParams));
      this.numericParameters.set(NumericParameters.WebRTCMaxBitrate, new SettingNumber(NumericParameters.WebRTCMaxBitrate, "Max Bitrate (kbps)", "The maximum bitrate that WebRTC should use.", 0, 5e5, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.WebRTCMaxBitrate) ? settings[NumericParameters.WebRTCMaxBitrate] : 0, useUrlParams));
      this.numericParameters.set(NumericParameters.StreamerAutoJoinInterval, new SettingNumber(NumericParameters.StreamerAutoJoinInterval, "Streamer Auto Join Interval (ms)", "Delay between retries when waiting for an available streamer.", 500, 9e5, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.StreamerAutoJoinInterval) ? settings[NumericParameters.StreamerAutoJoinInterval] : 3e3, useUrlParams));
      this.numericParameters.set(NumericParameters.KeepaliveDelay, new SettingNumber(NumericParameters.KeepaliveDelay, "Connection Keepalive delay", "Delay between keepalive pings to the signalling server.", 0, 9e5, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.KeepaliveDelay) ? settings[NumericParameters.KeepaliveDelay] : 3e4, useUrlParams));
      this.numericParameters.set(NumericParameters.ViewportResScale, new SettingNumber(NumericParameters.ViewportResScale, "Viewport Resolution Scale", "Scale factor for viewport resolution when MatchViewportResolution is enabled. 1.0 = 100%, 0.5 = 50%, 2.0 = 200%.", 0.1, 3, settings && Object.prototype.hasOwnProperty.call(settings, NumericParameters.ViewportResScale) ? settings[NumericParameters.ViewportResScale] : 1, useUrlParams));
    }
    /**
     * Add a callback to fire when the numeric setting is toggled.
     * @param id The id of the flag.
     * @param onChangedListener The callback to fire when the numeric value changes.
     */
    _addOnNumericSettingChangedListener(id, onChangedListener) {
      if (this.numericParameters.has(id)) {
        this.numericParameters.get(id).addOnChangedListener(onChangedListener);
      }
    }
    _addOnOptionSettingChangedListener(id, onChangedListener) {
      if (this.optionParameters.has(id)) {
        this.optionParameters.get(id).addOnChangedListener(onChangedListener);
      }
    }
    /**
     * @param id The id of the numeric setting we are interested in getting a value for.
     * @returns The numeric value stored in the parameter with the passed id.
     */
    getNumericSettingValue(id) {
      if (this.numericParameters.has(id)) {
        return this.numericParameters.get(id).number;
      } else {
        throw new Error(`There is no numeric setting with the id of ${id}`);
      }
    }
    /**
     * @param id The id of the numeric setting to check for.
     * @returns True if the numeric setting is registered in this Config.
     */
    hasNumericSetting(id) {
      return this.numericParameters.has(id);
    }
    /**
     * @param id The id of the text setting we are interested in getting a value for.
     * @returns The text value stored in the parameter with the passed id.
     */
    getTextSettingValue(id) {
      if (this.textParameters.has(id)) {
        return this.textParameters.get(id).value;
      } else {
        throw new Error(`There is no numeric setting with the id of ${id}`);
      }
    }
    /**
     * Set number in the setting.
     * @param id The id of the numeric setting we are interested in.
     * @param value The numeric value to set.
     */
    setNumericSetting(id, value) {
      if (this.numericParameters.has(id)) {
        this.numericParameters.get(id).number = value;
      } else {
        throw new Error(`There is no numeric setting with the id of ${id}`);
      }
    }
    /**
     * Add a callback to fire when the flag is toggled.
     * @param id The id of the flag.
     * @param onChangeListener The callback to fire when the value changes.
     */
    _addOnSettingChangedListener(id, onChangeListener) {
      if (this.flags.has(id)) {
        this.flags.get(id).onChange = onChangeListener;
      }
    }
    /**
     * Add a callback to fire when the text is changed.
     * @param id The id of the flag.
     * @param onChangeListener The callback to fire when the value changes.
     */
    _addOnTextSettingChangedListener(id, onChangeListener) {
      if (this.textParameters.has(id)) {
        this.textParameters.get(id).onChange = onChangeListener;
      }
    }
    /**
     * Get the option which has the given id.
     * @param id The id of the option.
     * @returns The SettingOption object matching id
     */
    getSettingOption(id) {
      return this.optionParameters.get(id);
    }
    /**
     * Get the value of the configuration flag which has the given id.
     * @param id The unique id for the flag.
     * @returns True if the flag is enabled.
     */
    isFlagEnabled(id) {
      return this.flags.get(id).flag;
    }
    /**
     * Set flag to be enabled/disabled.
     * @param id The id of the flag to toggle.
     * @param flagEnabled True if the flag should be enabled.
     */
    setFlagEnabled(id, flagEnabled) {
      if (!this.flags.has(id)) {
        Logger.Warning(`Cannot toggle flag called ${id} - it does not exist in the Config.flags map.`);
      } else {
        this.flags.get(id).flag = flagEnabled;
      }
    }
    /**
     * Set the text setting.
     * @param id The id of the setting
     * @param settingValue The value to set in the setting.
     */
    setTextSetting(id, settingValue) {
      if (!this.textParameters.has(id)) {
        Logger.Warning(`Cannot set text setting called ${id} - it does not exist in the Config.textParameters map.`);
      } else {
        this.textParameters.get(id).text = settingValue;
      }
    }
    /**
     * Set the option setting list of options.
     * @param id The id of the setting
     * @param settingOptions The values the setting could take
     */
    setOptionSettingOptions(id, settingOptions) {
      if (!this.optionParameters.has(id)) {
        Logger.Warning(`Cannot set text setting called ${id} - it does not exist in the Config.optionParameters map.`);
      } else {
        this.optionParameters.get(id).options = settingOptions;
      }
    }
    /**
     * Set option enum settings selected option.
     * @param id The id of the setting
     * @param settingOptions The value to select out of all the options
     */
    setOptionSettingValue(id, settingValue) {
      if (!this.optionParameters.has(id)) {
        Logger.Warning(`Cannot set text setting called ${id} - it does not exist in the Config.enumParameters map.`);
      } else {
        const optionSetting = this.optionParameters.get(id);
        const existingOptions = optionSetting.options;
        if (!existingOptions.includes(settingValue)) {
          existingOptions.push(settingValue);
          optionSetting.options = existingOptions;
        }
        optionSetting.selected = settingValue;
      }
    }
    /**
     * Set the label for the flag.
     * @param id The id of the flag.
     * @param label The new label to use for the flag.
     */
    setFlagLabel(id, label) {
      if (!this.flags.has(id)) {
        Logger.Warning(`Cannot set label for flag called ${id} - it does not exist in the Config.flags map.`);
      } else {
        this.flags.get(id).label = label;
      }
    }
    /**
     * Set a subset of all settings in one function call.
     *
     * @param settings A (partial) list of settings to set
     */
    setSettings(settings) {
      for (const key of Object.keys(settings)) {
        if (isFlagId(key)) {
          this.setFlagEnabled(key, settings[key]);
        } else if (isNumericId(key)) {
          this.setNumericSetting(key, settings[key]);
        } else if (isTextId(key)) {
          this.setTextSetting(key, settings[key]);
        } else if (isOptionId(key)) {
          this.setOptionSettingValue(key, settings[key]);
        }
      }
    }
    /**
     * Get all settings
     * @returns All setting values as an object with setting ids as keys
     */
    getSettings() {
      const settings = {};
      for (const [key, value] of this.flags.entries()) {
        settings[key] = value.flag;
      }
      for (const [key, value] of this.numericParameters.entries()) {
        settings[key] = value.number;
      }
      for (const [key, value] of this.textParameters.entries()) {
        settings[key] = value.text;
      }
      for (const [key, value] of this.optionParameters.entries()) {
        settings[key] = value.selected;
      }
      return settings;
    }
    /**
     * Get all Flag settings as an array.
     * @returns All SettingFlag objects
     */
    getFlags() {
      return Array.from(this.flags.values());
    }
    /**
     * Get all Text settings as an array.
     * @returns All SettingText objects
     */
    getTextSettings() {
      return Array.from(this.textParameters.values());
    }
    /**
     * Get all Number settings as an array.
     * @returns All SettingNumber objects
     */
    getNumericSettings() {
      return Array.from(this.numericParameters.values());
    }
    /**
     * Get all Option settings as an array.
     * @returns All SettingOption objects
     */
    getOptionSettings() {
      return Array.from(this.optionParameters.values());
    }
    /**
     * Emit events when settings change.
     * @param eventEmitter
     */
    _registerOnChangeEvents(eventEmitter) {
      for (const key of this.flags.keys()) {
        const flag = this.flags.get(key);
        if (flag) {
          flag.onChangeEmit = (newValue) => eventEmitter.dispatchEvent(new SettingsChangedEvent({
            id: flag.id,
            type: "flag",
            value: newValue,
            target: flag
          }));
        }
      }
      for (const key of this.numericParameters.keys()) {
        const number = this.numericParameters.get(key);
        if (number) {
          number.onChangeEmit = (newValue) => eventEmitter.dispatchEvent(new SettingsChangedEvent({
            id: number.id,
            type: "number",
            value: newValue,
            target: number
          }));
        }
      }
      for (const key of this.textParameters.keys()) {
        const text = this.textParameters.get(key);
        if (text) {
          text.onChangeEmit = (newValue) => eventEmitter.dispatchEvent(new SettingsChangedEvent({
            id: text.id,
            type: "text",
            value: newValue,
            target: text
          }));
        }
      }
      for (const key of this.optionParameters.keys()) {
        const option = this.optionParameters.get(key);
        if (option) {
          option.onChangeEmit = (newValue) => eventEmitter.dispatchEvent(new SettingsChangedEvent({
            id: option.id,
            type: "option",
            value: newValue,
            target: option
          }));
        }
      }
    }
  };
  var ControlSchemeType;
  (function(ControlSchemeType2) {
    ControlSchemeType2[ControlSchemeType2["LockedMouse"] = 0] = "LockedMouse";
    ControlSchemeType2[ControlSchemeType2["HoveringMouse"] = 1] = "HoveringMouse";
  })(ControlSchemeType || (ControlSchemeType = {}));

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/AFK/AFKController.js
  var AFKController = class {
    constructor(config2, pixelStreaming, onDismissAfk) {
      this.active = false;
      this.countdownActive = false;
      this.warnTimer = void 0;
      this.countDown = 0;
      this.countDownTimer = void 0;
      this.config = config2;
      this.pixelStreaming = pixelStreaming;
      this.onDismissAfk = onDismissAfk;
      this.onAFKTimedOutCallback = () => {
        Logger.Warning("AFK timed out, did you want to override this callback?");
      };
    }
    /**
     * The methods that occur when an afk event listener is clicked
     */
    onAfkClick() {
      clearInterval(this.countDownTimer);
      if (this.active || this.countdownActive) {
        this.startAfkWarningTimer();
        this.pixelStreaming.dispatchEvent(new AfkWarningDeactivateEvent());
      }
    }
    /**
     * Start the warning timer if a timeout is set greater that 0 seconds
     */
    startAfkWarningTimer() {
      if (this.config.getNumericSettingValue(NumericParameters.AFKTimeoutSecs) > 0 && this.config.isFlagEnabled(Flags.AFKDetection)) {
        this.active = true;
      } else {
        this.active = false;
      }
      this.resetAfkWarningTimer();
    }
    /**
     * Stop the afk warning timer
     */
    stopAfkWarningTimer() {
      this.active = false;
      this.countdownActive = false;
      clearTimeout(this.warnTimer);
      clearInterval(this.countDownTimer);
    }
    /**
     * Pause the timer which when elapsed will warn the user they are inactive.
     */
    pauseAfkWarningTimer() {
      this.active = false;
    }
    /**
     * If the user interacts then reset the warning timer.
     */
    resetAfkWarningTimer() {
      if (this.active && this.config.isFlagEnabled(Flags.AFKDetection)) {
        clearTimeout(this.warnTimer);
        this.warnTimer = setTimeout(() => this.activateAfkEvent(), this.config.getNumericSettingValue(NumericParameters.AFKTimeoutSecs) * 1e3);
      }
    }
    /**
     * Show the AFK overlay and begin the countDown
     */
    activateAfkEvent() {
      this.pauseAfkWarningTimer();
      this.pixelStreaming.dispatchEvent(new AfkWarningActivateEvent({
        countDown: this.countDown,
        dismissAfk: this.onDismissAfk
      }));
      this.countDown = this.config.getNumericSettingValue(NumericParameters.AFKCountdownSecs);
      this.countdownActive = true;
      this.pixelStreaming.dispatchEvent(new AfkWarningUpdateEvent({ countDown: this.countDown }));
      if (!this.config.isFlagEnabled(Flags.HoveringMouseMode)) {
        if (document.exitPointerLock) {
          document.exitPointerLock();
        }
      }
      this.countDownTimer = setInterval(() => {
        this.countDown--;
        if (this.countDown === 0) {
          this.pixelStreaming.dispatchEvent(new AfkTimedOutEvent());
          this.onAFKTimedOutCallback();
          Logger.Info("You have been disconnected due to inactivity");
          this.stopAfkWarningTimer();
        } else {
          this.pixelStreaming.dispatchEvent(new AfkWarningUpdateEvent({ countDown: this.countDown }));
        }
      }, 1e3);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/DataChannelController.js
  var DataChannelController = class {
    constructor() {
      this.isReceivingFreezeFrame = false;
    }
    /**
     * return the current state of a datachannel controller instance
     * @returns the current DataChannelController instance
     */
    getDataChannelInstance() {
      return this;
    }
    /**
     * To Create and Set up a Data Channel
     * @param peerConnection - The RTC Peer Connection
     * @param label - Label of the Data Channel
     * @param datachannelOptions - Optional RTC DataChannel options
     */
    createDataChannel(peerConnection, label, datachannelOptions) {
      this.peerConnection = peerConnection;
      this.label = label;
      this.datachannelOptions = datachannelOptions;
      if (datachannelOptions == null) {
        this.datachannelOptions = {};
        this.datachannelOptions.ordered = true;
      }
      this.dataChannel = this.peerConnection.createDataChannel(this.label, this.datachannelOptions);
      this.setupDataChannel();
    }
    setupDataChannel() {
      this.dataChannel.binaryType = "arraybuffer";
      this.dataChannel.onopen = (ev) => this.handleOnOpen(ev);
      this.dataChannel.onclose = (ev) => this.handleOnClose(ev);
      this.dataChannel.onmessage = (ev) => this.handleOnMessage(ev);
      this.dataChannel.onerror = (ev) => this.handleOnError(ev);
    }
    /**
     * Handles when the Data Channel is opened
     */
    handleOnOpen(ev) {
      var _a;
      Logger.Info(`Data Channel (${this.label}) opened.`);
      this.onOpen((_a = this.dataChannel) === null || _a === void 0 ? void 0 : _a.label, ev);
    }
    /**
     * Handles when the Data Channel is closed
     */
    handleOnClose(ev) {
      var _a;
      Logger.Info(`Data Channel (${this.label}) closed.`);
      this.onClose((_a = this.dataChannel) === null || _a === void 0 ? void 0 : _a.label, ev);
    }
    /**
     * Handles when a message is received
     * @param event - Message Event
     */
    handleOnMessage(event) {
      Logger.Info(`Data Channel (${this.label}) message: ${event.type}`);
    }
    /**
     * Handles when an error is thrown
     * @param event - Error Event
     */
    handleOnError(event) {
      var _a;
      Logger.Info(`Data Channel (${this.label}) error: ${event.type}`);
      this.onError((_a = this.dataChannel) === null || _a === void 0 ? void 0 : _a.label, event);
    }
    /**
     * Override to register onOpen handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOpen(label, ev) {
    }
    /**
     * Override to register onClose handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClose(label, ev) {
    }
    /**
     * Override to register onError handler
     * @param label Data channel label ("datachannel", "send-datachannel", "recv-datachannel")
     * @param ev event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError(label, ev) {
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/InboundRTPStats.js
  var InboundAudioStats = class {
  };
  var InboundVideoStats = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/DataChannelStats.js
  var DataChannelStats = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/CandidateStat.js
  var CandidateStat = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/OutBoundRTPStats.js
  var OutboundRTPStats = class {
  };
  var RemoteOutboundRTPStats = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/SessionStats.js
  var SessionStats = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/StreamStats.js
  var StreamStats = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/AggregatedStats.js
  var AggregatedStats = class {
    constructor() {
      this.inboundVideoStats = new InboundVideoStats();
      this.inboundAudioStats = new InboundAudioStats();
      this.datachannelStats = new DataChannelStats();
      this.outboundVideoStats = new OutboundRTPStats();
      this.outboundAudioStats = new OutboundRTPStats();
      this.remoteOutboundAudioStats = new RemoteOutboundRTPStats();
      this.remoteOutboundVideoStats = new RemoteOutboundRTPStats();
      this.sessionStats = new SessionStats();
      this.streamStats = new StreamStats();
      this.codecs = /* @__PURE__ */ new Map();
    }
    /**
     * Gather all the information from the RTC Peer Connection Report
     * @param rtcStatsReport - RTC Stats Report
     */
    processStats(rtcStatsReport) {
      this.localCandidates = new Array();
      this.remoteCandidates = new Array();
      this.candidatePairs = new Array();
      rtcStatsReport.forEach((stat) => {
        const type = stat.type;
        switch (type) {
          case "candidate-pair":
            this.handleCandidatePair(stat);
            break;
          case "certificate":
            break;
          case "codec":
            this.handleCodec(stat);
            break;
          case "data-channel":
            this.handleDataChannel(stat);
            break;
          case "inbound-rtp":
            this.handleInboundRTP(stat);
            break;
          case "local-candidate":
            this.handleLocalCandidate(stat);
            break;
          case "media-source":
            break;
          case "media-playout":
            break;
          case "outbound-rtp":
            this.handleLocalOutbound(stat);
            break;
          case "peer-connection":
            break;
          case "remote-candidate":
            this.handleRemoteCandidate(stat);
            break;
          case "remote-inbound-rtp":
            break;
          case "remote-outbound-rtp":
            this.handleRemoteOutbound(stat);
            break;
          case "track":
            this.handleTrack(stat);
            break;
          case "transport":
            this.handleTransport(stat);
            break;
          case "stream":
            this.handleStream(stat);
            break;
          default:
            Logger.Error("unhandled Stat Type");
            Logger.Info(stat);
            break;
        }
      });
    }
    /**
     * Process stream stats data from webrtc
     *
     * @param stat - the stats coming in from webrtc
     */
    handleStream(stat) {
      this.streamStats = stat;
    }
    /**
     * Process the Ice Candidate Pair Data
     * @param stat - the stats coming in from ice candidates
     */
    handleCandidatePair(stat) {
      this.candidatePairs.push(stat);
    }
    /**
     * Process the Data Channel Data
     * @param stat - the stats coming in from the data channel
     */
    handleDataChannel(stat) {
      this.datachannelStats.bytesReceived = stat.bytesReceived;
      this.datachannelStats.bytesSent = stat.bytesSent;
      this.datachannelStats.dataChannelIdentifier = stat.dataChannelIdentifier;
      this.datachannelStats.id = stat.id;
      this.datachannelStats.label = stat.label;
      this.datachannelStats.messagesReceived = stat.messagesReceived;
      this.datachannelStats.messagesSent = stat.messagesSent;
      this.datachannelStats.protocol = stat.protocol;
      this.datachannelStats.state = stat.state;
      this.datachannelStats.timestamp = stat.timestamp;
    }
    /**
     * Process the Local Ice Candidate Data
     * @param stat - local stats
     */
    handleLocalCandidate(stat) {
      const localCandidate = new CandidateStat();
      localCandidate.label = "local-candidate";
      localCandidate.address = stat.address;
      localCandidate.port = stat.port;
      localCandidate.protocol = stat.protocol;
      localCandidate.candidateType = stat.candidateType;
      localCandidate.id = stat.id;
      localCandidate.relayProtocol = stat.relayProtocol;
      localCandidate.transportId = stat.transportId;
      this.localCandidates.push(localCandidate);
    }
    /**
     * Process the Remote Ice Candidate Data
     * @param stat - ice candidate stats
     */
    handleRemoteCandidate(stat) {
      const remoteCandidate = new CandidateStat();
      remoteCandidate.label = "remote-candidate";
      remoteCandidate.address = stat.address;
      remoteCandidate.port = stat.port;
      remoteCandidate.protocol = stat.protocol;
      remoteCandidate.id = stat.id;
      remoteCandidate.candidateType = stat.candidateType;
      remoteCandidate.relayProtocol = stat.relayProtocol;
      remoteCandidate.transportId = stat.transportId;
      this.remoteCandidates.push(remoteCandidate);
    }
    /**
     * Process the Inbound RTP Audio and Video Data
     * @param stat - inbound rtp stats
     */
    handleInboundRTP(stat) {
      switch (stat.kind) {
        case "video":
          if (stat.bytesReceived > this.inboundVideoStats.bytesReceived && stat.timestamp > this.inboundVideoStats.timestamp) {
            this.inboundVideoStats.bitrate = 8 * (stat.bytesReceived - this.inboundVideoStats.bytesReceived) / (stat.timestamp - this.inboundVideoStats.timestamp);
            this.inboundVideoStats.bitrate = Math.floor(this.inboundVideoStats.bitrate);
          }
          for (const key in stat) {
            this.inboundVideoStats[key] = stat[key];
          }
          break;
        case "audio":
          if (stat.bytesReceived > this.inboundAudioStats.bytesReceived && stat.timestamp > this.inboundAudioStats.timestamp) {
            this.inboundAudioStats.bitrate = 8 * (stat.bytesReceived - this.inboundAudioStats.bytesReceived) / (stat.timestamp - this.inboundAudioStats.timestamp);
            this.inboundAudioStats.bitrate = Math.floor(this.inboundAudioStats.bitrate);
          }
          for (const key in stat) {
            this.inboundAudioStats[key] = stat[key];
          }
          break;
        default:
          Logger.Error(`Kind should be audio or video, we got ${stat.kind} - that's unsupported.`);
          break;
      }
    }
    /**
     * Process the "local" outbound RTP Audio and Video stats.
     * @param stat - local outbound rtp stats
     */
    handleLocalOutbound(stat) {
      const localOutboundStats = stat.kind === "audio" ? this.outboundAudioStats : this.outboundVideoStats;
      localOutboundStats.active = stat.active;
      localOutboundStats.codecId = stat.codecId;
      localOutboundStats.bytesSent = stat.bytesSent;
      localOutboundStats.frameHeight = stat.frameHeight;
      localOutboundStats.frameWidth = stat.frameWidth;
      localOutboundStats.framesEncoded = stat.framesEncoded;
      localOutboundStats.framesPerSecond = stat.framesPerSecond;
      localOutboundStats.headerBytesSent = stat.headerBytesSent;
      localOutboundStats.id = stat.id;
      localOutboundStats.keyFramesEncoded = stat.keyFramesEncoded;
      localOutboundStats.kind = stat.kind;
      localOutboundStats.mediaSourceId = stat.mediaSourceId;
      localOutboundStats.mid = stat.mid;
      localOutboundStats.nackCount = stat.nackCount;
      localOutboundStats.packetsSent = stat.packetsSent;
      localOutboundStats.qpSum = stat.qpSum;
      localOutboundStats.qualityLimitationDurations = stat.qualityLimitationDurations;
      localOutboundStats.qualityLimitationReason = stat.qualityLimitationReason;
      localOutboundStats.remoteId = stat.remoteId;
      localOutboundStats.retransmittedBytesSent = stat.retransmittedBytesSent;
      localOutboundStats.rid = stat.rid;
      localOutboundStats.scalabilityMode = stat.scalabilityMode;
      localOutboundStats.ssrc = stat.ssrc;
      localOutboundStats.targetBitrate = stat.targetBitrate;
      localOutboundStats.timestamp = stat.timestamp;
      localOutboundStats.totalEncodeTime = stat.totalEncodeTime;
      localOutboundStats.totalEncodeBytesTarget = stat.totalEncodeBytesTarget;
      localOutboundStats.totalPacketSendDelay = stat.totalPacketSendDelay;
      localOutboundStats.transportId = stat.transportId;
    }
    /**
     * Process the "remote" outbound RTP Audio and Video stats.
     * @param stat - remote outbound rtp stats
     */
    handleRemoteOutbound(stat) {
      const remoteOutboundStats = stat.kind === "audio" ? this.remoteOutboundAudioStats : this.remoteOutboundVideoStats;
      remoteOutboundStats.bytesSent = stat.bytesSent;
      remoteOutboundStats.codecId = stat.codecId;
      remoteOutboundStats.id = stat.id;
      remoteOutboundStats.kind = stat.kind;
      remoteOutboundStats.localId = stat.localId;
      remoteOutboundStats.packetsSent = stat.packetsSent;
      remoteOutboundStats.remoteTimestamp = stat.remoteTimestamp;
      remoteOutboundStats.reportsSent = stat.reportsSent;
      remoteOutboundStats.roundTripTimeMeasurements = stat.roundTripTimeMeasurements;
      remoteOutboundStats.ssrc = stat.ssrc;
      remoteOutboundStats.timestamp = stat.timestamp;
      remoteOutboundStats.totalRoundTripTime = stat.totalRoundTripTime;
      remoteOutboundStats.transportId = stat.transportId;
    }
    /**
     * Process the Inbound Video Track Data
     * @param stat - video track stats
     */
    handleTrack(stat) {
      if (stat.type === "track" && (stat.trackIdentifier === "video_label" || stat.kind === "video")) {
        this.inboundVideoStats.framesDropped = stat.framesDropped;
        this.inboundVideoStats.framesReceived = stat.framesReceived;
        this.inboundVideoStats.frameHeight = stat.frameHeight;
        this.inboundVideoStats.frameWidth = stat.frameWidth;
      }
    }
    handleTransport(stat) {
      this.transportStats = stat;
    }
    handleCodec(stat) {
      const codecId = stat.id;
      this.codecs.set(codecId, stat);
    }
    handleSessionStatistics(videoStartTime, inputController, videoEncoderAvgQP) {
      const deltaTime = Date.now() - videoStartTime;
      this.sessionStats.runTime = new Date(deltaTime).toISOString().substr(11, 8).toString();
      const controlsStreamInput = inputController === null ? "Not sent yet" : inputController ? "true" : "false";
      this.sessionStats.controlsStreamInput = controlsStreamInput;
      this.sessionStats.videoEncoderAvgQP = videoEncoderAvgQP;
    }
    /**
     * Check if a value coming in from our stats is actually a number
     * @param value - the number to be checked
     */
    isNumber(value) {
      return typeof value === "number" && isFinite(value);
    }
    /**
     * Helper function to return the active candidate pair
     * @returns The candidate pair that is currently receiving data
     */
    getActiveCandidatePair() {
      if (this.candidatePairs === void 0) {
        return null;
      }
      if (this.transportStats) {
        const selectedPair2 = this.candidatePairs.find((candidatePair) => candidatePair.id === this.transportStats.selectedCandidatePairId);
        if (selectedPair2 === void 0) {
          return null;
        } else {
          return selectedPair2;
        }
      }
      const selectedPair = this.candidatePairs.find((candidatePair) => candidatePair.selected);
      if (selectedPair === void 0) {
        return null;
      } else {
        return selectedPair;
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/PeerConnectionController.js
  var import_sdp = __toESM(require_sdp());

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/RTCUtils.js
  var RTCUtils = class {
    static isVideoTransceiver(transceiver) {
      return this.canTransceiverReceiveVideo(transceiver) || this.canTransceiverSendVideo(transceiver);
    }
    static canTransceiverReceiveVideo(transceiver) {
      return !!transceiver && (transceiver.direction === "sendrecv" || transceiver.direction === "recvonly") && transceiver.receiver && transceiver.receiver.track && transceiver.receiver.track.kind === "video";
    }
    static canTransceiverSendVideo(transceiver) {
      return !!transceiver && (transceiver.direction === "sendrecv" || transceiver.direction === "sendonly") && transceiver.sender && transceiver.sender.track && transceiver.sender.track.kind === "video";
    }
    static isAudioTransceiver(transceiver) {
      return this.canTransceiverReceiveAudio(transceiver) || this.canTransceiverSendAudio(transceiver);
    }
    static canTransceiverReceiveAudio(transceiver) {
      return !!transceiver && (transceiver.direction === "sendrecv" || transceiver.direction === "recvonly") && transceiver.receiver && transceiver.receiver.track && transceiver.receiver.track.kind === "audio";
    }
    static canTransceiverSendAudio(transceiver) {
      return !!transceiver && (transceiver.direction === "sendrecv" || transceiver.direction === "sendonly") && transceiver.sender && transceiver.sender.track && transceiver.sender.track.kind === "audio";
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/LatencyCalculator.js
  var RTCRtpCaptureSource = class {
  };
  var FrameTimingInfo = class {
  };
  var LatencyCalculator = class {
    constructor() {
      this.latestSenderRecvClockOffset = null;
    }
    calculate(stats2, receivers) {
      const latencyInfo = new LatencyInfo();
      const rttMS = this.getRTTMs(stats2);
      if (rttMS != null) {
        latencyInfo.rttMs = rttMS;
        const captureSource = this.getCaptureSource(receivers);
        if (captureSource != null) {
          const senderLatencyMs = this.calculateSenderLatency(stats2, captureSource);
          if (senderLatencyMs !== null) {
            latencyInfo.senderLatencyMs = senderLatencyMs;
          }
        }
      }
      if (stats2.inboundVideoStats.totalProcessingDelay !== void 0 && stats2.inboundVideoStats.framesDecoded !== void 0) {
        latencyInfo.averageProcessingDelayMs = stats2.inboundVideoStats.totalProcessingDelay / stats2.inboundVideoStats.framesDecoded * 1e3;
      }
      if (stats2.inboundVideoStats.jitterBufferDelay !== void 0 && stats2.inboundVideoStats.jitterBufferEmittedCount !== void 0) {
        latencyInfo.averageJitterBufferDelayMs = stats2.inboundVideoStats.jitterBufferDelay / stats2.inboundVideoStats.jitterBufferEmittedCount * 1e3;
      }
      if (stats2.inboundVideoStats.framesDecoded !== void 0 && stats2.inboundVideoStats.totalDecodeTime !== void 0) {
        latencyInfo.averageDecodeLatencyMs = stats2.inboundVideoStats.totalDecodeTime / stats2.inboundVideoStats.framesDecoded * 1e3;
      }
      if (stats2.inboundVideoStats.totalAssemblyTime !== void 0 && stats2.inboundVideoStats.framesAssembledFromMultiplePackets !== void 0) {
        latencyInfo.averageAssemblyDelayMs = stats2.inboundVideoStats.totalAssemblyTime / stats2.inboundVideoStats.framesAssembledFromMultiplePackets * 1e3;
      }
      if (stats2.inboundVideoStats.googTimingFrameInfo !== void 0 && stats2.inboundVideoStats.googTimingFrameInfo.length > 0) {
        latencyInfo.frameTiming = this.extractFrameTimingInfo(stats2.inboundVideoStats.googTimingFrameInfo);
      }
      if (latencyInfo.frameTiming !== void 0 && latencyInfo.frameTiming.captureToSendLatencyMs !== void 0 && latencyInfo.averageProcessingDelayMs !== void 0 && latencyInfo.rttMs !== void 0) {
        latencyInfo.averageE2ELatency = latencyInfo.frameTiming.captureToSendLatencyMs + latencyInfo.rttMs * 0.5 + latencyInfo.averageProcessingDelayMs;
      }
      if (latencyInfo.senderLatencyMs != void 0 && latencyInfo.averageProcessingDelayMs !== void 0 && latencyInfo.rttMs !== void 0) {
        latencyInfo.averageE2ELatency = latencyInfo.senderLatencyMs + latencyInfo.rttMs * 0.5 + latencyInfo.averageProcessingDelayMs;
      }
      return latencyInfo;
    }
    extractFrameTimingInfo(googTimingFrameInfo) {
      const timingInfo = new FrameTimingInfo();
      const timingInfoArr = googTimingFrameInfo.split(",");
      if (timingInfoArr.length === 15) {
        timingInfo.rtpTimestamp = Number.parseInt(timingInfoArr[0]);
        timingInfo.captureTimestamp = Number.parseInt(timingInfoArr[1]);
        timingInfo.encodeStartTimestamp = Number.parseInt(timingInfoArr[2]);
        timingInfo.encodeFinishTimestamp = Number.parseInt(timingInfoArr[3]);
        timingInfo.packetizerFinishTimestamp = Number.parseInt(timingInfoArr[4]);
        timingInfo.pacerExitTimestamp = Number.parseInt(timingInfoArr[5]);
        timingInfo.networkTimestamp1 = Number.parseInt(timingInfoArr[6]);
        timingInfo.networkTimestamp2 = Number.parseInt(timingInfoArr[7]);
        timingInfo.receiveStart = Number.parseInt(timingInfoArr[8]);
        timingInfo.receiveFinish = Number.parseInt(timingInfoArr[9]);
        timingInfo.decodeStart = Number.parseInt(timingInfoArr[10]);
        timingInfo.decodeFinish = Number.parseInt(timingInfoArr[11]);
        timingInfo.renderTime = Number.parseInt(timingInfoArr[12]);
        timingInfo.isOutlier = Number.parseInt(timingInfoArr[13]) > 0;
        timingInfo.isTriggeredByTimer = Number.parseInt(timingInfoArr[14]) > 0;
        timingInfo.encoderLatencyMs = timingInfo.encodeFinishTimestamp - timingInfo.encodeStartTimestamp;
        timingInfo.packetizeLatencyMs = timingInfo.packetizerFinishTimestamp - timingInfo.encodeFinishTimestamp;
        timingInfo.pacerLatencyMs = timingInfo.pacerExitTimestamp - timingInfo.packetizerFinishTimestamp;
        timingInfo.captureToSendLatencyMs = timingInfo.pacerExitTimestamp - timingInfo.captureTimestamp;
      }
      return timingInfo;
    }
    calculateSenderLatency(stats2, captureSource) {
      const senderCaptureTimestamp = captureSource.captureTimestamp + captureSource.senderCaptureTimeOffset;
      let sendRecvClockOffset = this.calculateSenderReceiverClockOffset(stats2);
      if (sendRecvClockOffset == null) {
        if (this.latestSenderRecvClockOffset != null) {
          sendRecvClockOffset = this.latestSenderRecvClockOffset;
        } else {
          return null;
        }
      } else {
        this.latestSenderRecvClockOffset = sendRecvClockOffset;
      }
      const recvCaptureTimestampNTP = senderCaptureTimestamp + sendRecvClockOffset;
      const ntp1970 = 22089888e5;
      const recvCaptureTimestamp = recvCaptureTimestampNTP - ntp1970;
      const senderLatency = captureSource.timestamp - recvCaptureTimestamp;
      return senderLatency;
    }
    /**
     * Find the first valid ssrc or csrc that has capture time fields present from abs-capture-time header extension.
     * @param receivers The RTP receviers this peer connection has.
     * @returns A single valid ssrc or csrc that has capture time fields or null if there is none (e.g. in non-chromium browsers it will be null).
     */
    getCaptureSource(receivers) {
      receivers = receivers.filter((receiver) => receiver.track.kind === "video");
      for (const receiver of receivers) {
        const sources = receiver.getSynchronizationSources().concat(receiver.getContributingSources());
        for (const src of sources) {
          if (src.captureTimestamp !== void 0 && src.senderCaptureTimeOffset !== void 0 && src.timestamp !== void 0) {
            const captureSrc = new RTCRtpCaptureSource();
            captureSrc.timestamp = src.timestamp;
            captureSrc.captureTimestamp = src.captureTimestamp;
            captureSrc.senderCaptureTimeOffset = src.senderCaptureTimeOffset;
            return captureSrc;
          }
        }
      }
      return null;
    }
    calculateSenderReceiverClockOffset(stats2) {
      const hasRemoteOutboundVideoStats = stats2.remoteOutboundVideoStats !== void 0 && stats2.remoteOutboundVideoStats.timestamp !== void 0 && stats2.remoteOutboundVideoStats.remoteTimestamp !== void 0;
      if (!hasRemoteOutboundVideoStats) {
        return null;
      }
      const remoteStatsArrivedTimestamp = stats2.remoteOutboundVideoStats.timestamp;
      const remoteStatsSentTimestamp = stats2.remoteOutboundVideoStats.remoteTimestamp;
      const rttMs = this.getRTTMs(stats2);
      if (remoteStatsArrivedTimestamp !== void 0 && remoteStatsSentTimestamp !== void 0 && rttMs !== null) {
        const onewayDelay = rttMs * 0.5;
        return remoteStatsArrivedTimestamp - (remoteStatsSentTimestamp + onewayDelay);
      } else {
        return null;
      }
    }
    getRTTMs(stats2) {
      const activeCandidatePair = stats2.getActiveCandidatePair();
      if (!!activeCandidatePair && activeCandidatePair.currentRoundTripTime !== void 0) {
        const curRTTSeconds = activeCandidatePair.currentRoundTripTime;
        return curRTTSeconds * 1e3;
      }
      if (!!stats2.remoteOutboundVideoStats && stats2.remoteOutboundVideoStats.totalRoundTripTime !== void 0 && stats2.remoteOutboundVideoStats.roundTripTimeMeasurements !== void 0 && stats2.remoteOutboundVideoStats.roundTripTimeMeasurements > 0) {
        const avgRttSeconds = stats2.remoteOutboundVideoStats.totalRoundTripTime / stats2.remoteOutboundVideoStats.roundTripTimeMeasurements;
        return avgRttSeconds * 1e3;
      }
      if (!!stats2.remoteOutboundAudioStats && stats2.remoteOutboundAudioStats.totalRoundTripTime !== void 0 && stats2.remoteOutboundAudioStats.roundTripTimeMeasurements !== void 0 && stats2.remoteOutboundAudioStats.roundTripTimeMeasurements > 0) {
        const avgRttSeconds = stats2.remoteOutboundAudioStats.totalRoundTripTime / stats2.remoteOutboundAudioStats.roundTripTimeMeasurements;
        return avgRttSeconds * 1e3;
      }
      return null;
    }
  };
  var LatencyInfo = class {
    constructor() {
      this.senderLatencyMs = void 0;
      this.senderLatencyAbsCaptureTimeMs = void 0;
      this.rttMs = void 0;
      this.averageProcessingDelayMs = void 0;
      this.averageJitterBufferDelayMs = void 0;
      this.averageDecodeLatencyMs = void 0;
      this.averageAssemblyDelayMs = void 0;
      this.averageE2ELatency = void 0;
      this.frameTiming = void 0;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PeerConnectionController/PeerConnectionController.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var kAbsCaptureTime = "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time";
  var PeerConnectionController = class {
    /**
     * Create a new RTC Peer Connection client
     * @param options - Peer connection Options
     * @param config - The config for our PS experience.
     */
    constructor(options, config2, preferredCodec) {
      this.config = config2;
      this.createPeerConnection(options, preferredCodec);
      this.latencyCalculator = new LatencyCalculator();
    }
    createPeerConnection(options, preferredCodec) {
      if (this.config.isFlagEnabled(Flags.ForceTURN)) {
        options.iceTransportPolicy = "relay";
        Logger.Info("Forcing TURN usage by setting ICE Transport Policy in peer connection config.");
      }
      this.peerConnection = new RTCPeerConnection(options);
      this.peerConnection.onsignalingstatechange = (ev) => this.handleSignalStateChange(ev);
      this.peerConnection.oniceconnectionstatechange = (ev) => this.handleIceConnectionStateChange(ev);
      this.peerConnection.onicegatheringstatechange = (ev) => this.handleIceGatheringStateChange(ev);
      this.peerConnection.ontrack = (ev) => this.handleOnTrack(ev);
      this.peerConnection.onicecandidate = (ev) => this.handleIceCandidate(ev);
      this.peerConnection.ondatachannel = (ev) => this.handleDataChannel(ev);
      this.aggregatedStats = new AggregatedStats();
      this.preferredCodec = preferredCodec;
      this.updateCodecSelection = true;
    }
    /**
     * Create an offer for the Web RTC handshake and send the offer to the signaling server via websocket
     * @param offerOptions - RTC Offer Options
     */
    createOffer(offerOptions, config2) {
      Logger.Info("Create Offer");
      const isLocalhostConnection = location.hostname === "localhost" || location.hostname === "127.0.0.1";
      const isHttpsConnection = location.protocol === "https:";
      let useMic = config2.isFlagEnabled(Flags.UseMic);
      let useCamera = config2.isFlagEnabled(Flags.UseCamera);
      if ((useMic || useCamera) && !(isLocalhostConnection || isHttpsConnection)) {
        useMic = false;
        useCamera = false;
        Logger.Error("Microphone and Webcam access in the browser will not work if you are not on HTTPS or localhost. Disabling mic and webcam access.");
        Logger.Error("For testing you can enable HTTP microphone access Chrome by visiting chrome://flags/ and enabling 'unsafely-treat-insecure-origin-as-secure'");
      }
      void this.setupTransceiversAsync(useMic, useCamera).finally(() => {
        var _a;
        (_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.createOffer(offerOptions).then((offer2) => {
          var _a2;
          this.showTextOverlayConnecting();
          offer2.sdp = this.mungeSDP(offer2.sdp, useMic);
          void ((_a2 = this.peerConnection) === null || _a2 === void 0 ? void 0 : _a2.setLocalDescription(offer2));
          this.onSendWebRTCOffer(offer2);
        }).catch(() => {
          this.showTextOverlaySetupFailure();
        });
      });
    }
    /**
     * Receive offer from UE side and process it as the remote description of this peer connection
     */
    receiveOffer(offer2, config2) {
      var _a;
      Logger.Info("Receive Offer");
      if (this.isFirefox()) {
        offer2.sdp = offer2.sdp.replace(/^a=extmap:\d+ http:\/\/www\.webrtc\.org\/experiments\/rtp-hdrext\/abs-capture-time\r\n/gm, "");
      }
      void ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.setRemoteDescription(offer2).then(() => {
        this.onSetRemoteDescription(offer2);
        const isLocalhostConnection = location.hostname === "localhost" || location.hostname === "127.0.0.1";
        const isHttpsConnection = location.protocol === "https:";
        let useMic = config2.isFlagEnabled(Flags.UseMic);
        let useCamera = config2.isFlagEnabled(Flags.UseCamera);
        if ((useMic || useCamera) && !(isLocalhostConnection || isHttpsConnection)) {
          useMic = false;
          useCamera = false;
          Logger.Error("Microphone and Webcam access in the browser will not work if you are not on HTTPS or localhost. Disabling mic and webcam access.");
          Logger.Error("For testing you can enable HTTP microphone access Chrome by visiting chrome://flags/ and enabling 'unsafely-treat-insecure-origin-as-secure'");
        }
        this.config.setOptionSettingOptions(OptionParameters.PreferredCodec, this.fuzzyIntersectUEAndBrowserCodecs(offer2));
        void this.setupTransceiversAsync(useMic, useCamera).finally(() => {
          var _a2;
          (_a2 = this.peerConnection) === null || _a2 === void 0 ? void 0 : _a2.createAnswer().then((Answer) => {
            var _a3;
            Answer.sdp = this.mungeSDP(Answer.sdp, useMic);
            return (_a3 = this.peerConnection) === null || _a3 === void 0 ? void 0 : _a3.setLocalDescription(Answer);
          }).then(() => {
            var _a3;
            this.onSetLocalDescription((_a3 = this.peerConnection) === null || _a3 === void 0 ? void 0 : _a3.currentLocalDescription);
          }).catch((err) => {
            Logger.Error(`createAnswer() failed - ${err}`);
          });
        });
      }));
    }
    /**
     * Set the Remote Descriptor from the signaling server to the RTC Peer Connection
     * @param answer - RTC Session Descriptor from the Signaling Server
     */
    receiveAnswer(answer2) {
      var _a;
      void ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.setRemoteDescription(answer2));
      this.config.setOptionSettingOptions(OptionParameters.PreferredCodec, this.fuzzyIntersectUEAndBrowserCodecs(answer2));
    }
    /**
     * Generate Aggregated Stats and then fire a onVideo Stats event
     */
    generateStats() {
      var _a;
      void ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.getStats().then((statsData) => {
        this.aggregatedStats.processStats(statsData);
        this.onVideoStats(this.aggregatedStats);
        const latencyInfo = this.latencyCalculator.calculate(this.aggregatedStats, this.peerConnection.getReceivers());
        this.onLatencyCalculated(latencyInfo);
        if (this.updateCodecSelection && !!this.aggregatedStats.inboundVideoStats.codecId) {
          const codecStats = this.aggregatedStats.codecs.get(this.aggregatedStats.inboundVideoStats.codecId);
          if (codecStats === void 0) {
            return;
          }
          const codecShortname = codecStats.mimeType.replace("video/", "");
          let fullCodecName = codecShortname;
          if (codecStats.sdpFmtpLine && codecStats.sdpFmtpLine.trim() !== "") {
            fullCodecName = `${codecShortname} ${codecStats.sdpFmtpLine.trim()}`;
          }
          const allBrowserCodecs = this.config.getSettingOption(OptionParameters.PreferredCodec).options;
          if (allBrowserCodecs.includes(fullCodecName)) {
            this.config.setOptionSettingValue(OptionParameters.PreferredCodec, fullCodecName);
            return;
          }
          const filteredList = allBrowserCodecs.filter((option) => option.indexOf(codecShortname) !== -1);
          if (filteredList.length > 0) {
            this.config.setOptionSettingValue(OptionParameters.PreferredCodec, filteredList[0]);
            return;
          }
        }
      }));
    }
    /**
     * Close The Peer Connection
     */
    close() {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
    }
    /**
     * Modify the Session Descriptor
     * @param sdp - Session Descriptor as a string
     * @param useMic - Is the microphone in use
     * @returns A modified Session Descriptor
     */
    mungeSDP(sdp, useMic) {
      let mungedSDP = sdp.replace(/(a=fmtp:\d+ .*level-asymmetry-allowed=.*)\r\n/gm, "$1;x-google-start-bitrate=10000;x-google-max-bitrate=100000\r\n");
      let audioSDP = "maxaveragebitrate=510000;";
      if (useMic) {
        audioSDP += "sprop-maxcapturerate=48000;";
      }
      audioSDP += this.config.isFlagEnabled(Flags.ForceMonoAudio) ? "stereo=0;" : "stereo=1;";
      audioSDP += "useinbandfec=1";
      mungedSDP = mungedSDP.replace("useinbandfec=1", audioSDP);
      if (this.config.isFlagEnabled(Flags.EnableCaptureTimeExt) && !this.isFirefox()) {
        mungedSDP = SDPUtils.addVideoHeaderExtensionToSdp(mungedSDP, kAbsCaptureTime);
      }
      return mungedSDP;
    }
    isFirefox() {
      return navigator.userAgent.indexOf("Firefox") > 0;
    }
    /**
     * When a Ice Candidate is received add to the RTC Peer Connection
     * @param iceCandidate - RTC Ice Candidate from the Signaling Server
     */
    handleOnIce(iceCandidate2) {
      var _a;
      Logger.Info("peerconnection handleOnIce");
      if (this.config.isFlagEnabled(Flags.ForceTURN)) {
        if (iceCandidate2.candidate.indexOf("relay") < 0) {
          Logger.Info(`Dropping candidate because it was not TURN relay. | Type= ${iceCandidate2.type} | Protocol= ${iceCandidate2.protocol} | Address=${iceCandidate2.address} | Port=${iceCandidate2.port} |`);
          return;
        }
      }
      void ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.addIceCandidate(iceCandidate2));
    }
    /**
     * When the RTC Peer Connection Signaling server state Changes
     * @param state - Signaling Server State Change Event
     */
    handleSignalStateChange(_state) {
      var _a;
      Logger.Info("signaling state change: " + ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.signalingState));
    }
    /**
     * Handle when the Ice Connection State Changes
     * @param state - Ice Connection State
     */
    handleIceConnectionStateChange(state) {
      var _a;
      Logger.Info("ice connection state change: " + ((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.iceConnectionState));
      this.onIceConnectionStateChange(state);
    }
    /**
     * Handle when the Ice Gathering State Changes
     * @param state - Ice Gathering State Change
     */
    handleIceGatheringStateChange(state) {
      Logger.Info("ice gathering state change: " + JSON.stringify(state));
    }
    /**
     * Activates the onTrack method
     * @param event - The webRtc track event
     */
    handleOnTrack(event) {
      if (event.streams.length < 1 || event.streams[0].id === "probator") {
        return;
      }
      if (event.track.kind === "video") {
        this.videoTrack = event.track;
      }
      if (event.track.kind === "audio") {
        this.audioTrack = event.track;
      }
      this.onTrack(event);
    }
    /**
     * Activates the onPeerIceCandidate
     * @param event - The peer ice candidate
     */
    handleIceCandidate(event) {
      this.onPeerIceCandidate(event);
    }
    /**
     * Activates the onDataChannel
     * @param event - The peer's data channel
     */
    handleDataChannel(event) {
      this.onDataChannel(event);
    }
    /**
     * An override method for onTrack for use outside of the PeerConnectionController
     * @param trackEvent - The webRtc track event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTrack(trackEvent) {
    }
    /**
     * An override method for onIceConnectionStateChange for use outside of the PeerConnectionController
     * @param event - The webRtc iceconnectionstatechange event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onIceConnectionStateChange(event) {
    }
    /**
     * An override method for onPeerIceCandidate for use outside of the PeerConnectionController
     * @param peerConnectionIceEvent - The peer ice candidate
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPeerIceCandidate(peerConnectionIceEvent) {
    }
    /**
     * An override method for onDataChannel for use outside of the PeerConnectionController
     * @param datachannelEvent - The peer's data channel
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDataChannel(datachannelEvent) {
    }
    /**
     * Find the intersection between UE and browser codecs, with fuzzy matching if some parameters are mismatched.
     * @param sdp The remote sdp
     * @returns The intersection between browser supported codecs and ue supported codecs.
     */
    fuzzyIntersectUEAndBrowserCodecs(sdp) {
      const allSupportedCodecs = new Array();
      const allUECodecs = this.parseAvailableCodecs(sdp);
      const allBrowserCodecs = this.config.getSettingOption(OptionParameters.PreferredCodec).options;
      for (const ueCodec of allUECodecs) {
        if (allBrowserCodecs.includes(ueCodec)) {
          allSupportedCodecs.push(ueCodec);
          continue;
        } else {
          const ueCodecNameAndParams = ueCodec.split(" ");
          const ueCodecName = ueCodecNameAndParams[0];
          for (const browserCodec of allBrowserCodecs) {
            if (browserCodec.includes(ueCodecName)) {
              allSupportedCodecs.push(browserCodec);
              break;
            }
          }
        }
      }
      return allSupportedCodecs;
    }
    /**
     * Setup tracks on the RTC Peer Connection
     * @param useMic - is mic in use
     * @param useCamera - is webcam in use
     */
    setupTransceiversAsync(useMic, useCamera) {
      return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let hasVideoReceiver = false;
        for (const transceiver of (_b = (_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.getTransceivers()) !== null && _b !== void 0 ? _b : []) {
          if (transceiver && transceiver.receiver && transceiver.receiver.track && transceiver.receiver.track.kind === "video") {
            hasVideoReceiver = true;
            break;
          }
        }
        if (!useCamera) {
          if (!hasVideoReceiver) {
            (_c = this.peerConnection) === null || _c === void 0 ? void 0 : _c.addTransceiver("video", { direction: "recvonly" });
          }
        } else {
          yield this.setupVideoSender(hasVideoReceiver);
        }
        if (RTCRtpReceiver.getCapabilities && this.preferredCodec != "") {
          for (const transceiver of (_e = (_d = this.peerConnection) === null || _d === void 0 ? void 0 : _d.getTransceivers()) !== null && _e !== void 0 ? _e : []) {
            if (transceiver && transceiver.receiver && transceiver.receiver.track && transceiver.receiver.track.kind === "video" && transceiver.setCodecPreferences) {
              const preferredRTPCodec = this.preferredCodec.split(" ");
              const preferredRTCRtpCodecCapability = {
                mimeType: "video/" + preferredRTPCodec[0],
                clockRate: 9e4,
                sdpFmtpLine: preferredRTPCodec[1] ? preferredRTPCodec[1] : ""
              };
              const ourSupportedCodecs = [preferredRTCRtpCodecCapability];
              RTCRtpReceiver.getCapabilities("video").codecs.forEach((browserSupportedCodec) => {
                if (browserSupportedCodec.mimeType != preferredRTCRtpCodecCapability.mimeType) {
                  ourSupportedCodecs.push(browserSupportedCodec);
                } else if ((browserSupportedCodec === null || browserSupportedCodec === void 0 ? void 0 : browserSupportedCodec.sdpFmtpLine) != (preferredRTCRtpCodecCapability === null || preferredRTCRtpCodecCapability === void 0 ? void 0 : preferredRTCRtpCodecCapability.sdpFmtpLine)) {
                  ourSupportedCodecs.push(browserSupportedCodec);
                }
              });
              for (const codec of ourSupportedCodecs) {
                if ((codec === null || codec === void 0 ? void 0 : codec.sdpFmtpLine) === void 0 || codec.sdpFmtpLine === "") {
                  delete codec.sdpFmtpLine;
                }
              }
              transceiver.setCodecPreferences(ourSupportedCodecs);
            }
          }
        }
        let hasAudioReceiver = false;
        for (const transceiver of (_g = (_f = this.peerConnection) === null || _f === void 0 ? void 0 : _f.getTransceivers()) !== null && _g !== void 0 ? _g : []) {
          if (transceiver && transceiver.receiver && transceiver.receiver.track && transceiver.receiver.track.kind === "audio") {
            hasAudioReceiver = true;
            break;
          }
        }
        if (!useMic) {
          if (!hasAudioReceiver) {
            (_h = this.peerConnection) === null || _h === void 0 ? void 0 : _h.addTransceiver("audio", {
              direction: "recvonly"
            });
          }
        } else {
          yield this.setupAudioSender(hasAudioReceiver);
        }
      });
    }
    setupVideoSender(hasVideoReceiver) {
      return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const mediaSendOptions = {
          video: true
        };
        const stream = yield navigator.mediaDevices.getUserMedia(mediaSendOptions);
        if (stream) {
          if (hasVideoReceiver) {
            for (const transceiver of (_b = (_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.getTransceivers()) !== null && _b !== void 0 ? _b : []) {
              if (RTCUtils.canTransceiverReceiveVideo(transceiver)) {
                for (const track of stream.getTracks()) {
                  if (track.kind === "video") {
                    void transceiver.sender.replaceTrack(track);
                    transceiver.direction = "sendrecv";
                  }
                }
              }
            }
          } else {
            for (const track of stream.getTracks()) {
              if (track.kind === "video") {
                (_c = this.peerConnection) === null || _c === void 0 ? void 0 : _c.addTransceiver(track, {
                  direction: "sendrecv"
                });
              }
            }
          }
        } else {
          if (!hasVideoReceiver) {
            (_d = this.peerConnection) === null || _d === void 0 ? void 0 : _d.addTransceiver("video", { direction: "recvonly" });
          }
        }
      });
    }
    setupAudioSender(hasAudioReceiver) {
      return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const audioOptions = {
          autoGainControl: false,
          channelCount: 1,
          echoCancellation: false,
          latency: 0,
          noiseSuppression: false,
          sampleRate: 48e3,
          sampleSize: 16,
          volume: 1
        };
        const mediaSendOptions = {
          video: false,
          audio: audioOptions
        };
        const stream = yield navigator.mediaDevices.getUserMedia(mediaSendOptions);
        if (stream) {
          if (hasAudioReceiver) {
            for (const transceiver of (_b = (_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.getTransceivers()) !== null && _b !== void 0 ? _b : []) {
              if (RTCUtils.canTransceiverReceiveAudio(transceiver)) {
                for (const track of stream.getTracks()) {
                  if (track.kind === "audio") {
                    void transceiver.sender.replaceTrack(track);
                    transceiver.direction = "sendrecv";
                  }
                }
              }
            }
          } else {
            for (const track of stream.getTracks()) {
              if (track.kind === "audio") {
                (_c = this.peerConnection) === null || _c === void 0 ? void 0 : _c.addTransceiver(track, {
                  direction: "sendrecv"
                });
              }
            }
          }
        } else {
          if (!hasAudioReceiver) {
            (_d = this.peerConnection) === null || _d === void 0 ? void 0 : _d.addTransceiver("audio", {
              direction: "recvonly"
            });
          }
        }
      });
    }
    /**
     * And override event for when the video stats are fired
     * @param event - Aggregated Stats
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onVideoStats(event) {
    }
    /**
     * And override event for when latency info is calculated
     * @param latencyInfo - Calculated latency information.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onLatencyCalculated(latencyInfo) {
    }
    /**
     * Event to send the RTC offer to the Signaling server
     * @param offer - RTC Offer
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSendWebRTCOffer(offer2) {
    }
    /**
     * Event fired when remote offer description is set.
     * @param offer - RTC Offer
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSetRemoteDescription(offer2) {
    }
    /**
     * Event fire when local description answer is set.
     * @param answer - RTC Answer
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSetLocalDescription(answer2) {
    }
    /**
     * An override for showing the Peer connection connecting Overlay
     */
    showTextOverlayConnecting() {
    }
    /**
     * An override for showing the Peer connection Failed overlay
     */
    showTextOverlaySetupFailure() {
    }
    parseAvailableCodecs(rtcSessionDescription) {
      if (!RTCRtpReceiver.getCapabilities)
        return ["Only available on Chrome"];
      const ueSupportedCodecs = [];
      const sections = (0, import_sdp.splitSections)(rtcSessionDescription.sdp);
      sections.shift();
      sections.forEach((mediaSection) => {
        const { codecs } = (0, import_sdp.parseRtpParameters)(mediaSection);
        const matcher = /(VP\d|H26\d|AV1).*/;
        codecs.forEach((c) => {
          const str = c.name + " " + Object.keys(c.parameters || {}).map((p) => p + "=" + c.parameters[p]).join(";");
          const match = matcher.exec(str);
          if (match !== null) {
            if (c.name === "VP9") {
              c.parameters = {
                "profile-id": "0"
              };
            }
            const codecStr = c.name + " " + Object.keys(c.parameters || {}).map((p) => p + "=" + c.parameters[p]).join(";");
            ueSupportedCodecs.push(codecStr);
          }
        });
      });
      return ueSupportedCodecs;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/InitialSettings.js
  var InitialSettings = class {
    constructor() {
      this.PixelStreamingSettings = new PixelStreamingSettings();
      this.EncoderSettings = new EncoderSettings();
      this.WebRTCSettings = new WebRTCSettings();
    }
    /**
     * Checks for compatibility with the FPS and MaxFPS stats between 4.27 and 5
     */
    ueCompatible() {
      if (this.WebRTCSettings.MaxFPS != null) {
        this.WebRTCSettings.FPS = this.WebRTCSettings.MaxFPS;
      }
    }
  };
  var PixelStreamingSettings = class {
  };
  var EncoderSettings = class {
  };
  var WebRTCSettings = class {
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/LatencyTestResults.js
  var LatencyTestResults = class {
    constructor() {
      this.ReceiptTimeMs = null;
      this.TransmissionTimeMs = null;
      this.PreCaptureTimeMs = null;
      this.PostCaptureTimeMs = null;
      this.PreEncodeTimeMs = null;
      this.PostEncodeTimeMs = null;
      this.EncodeMs = null;
      this.CaptureToSendMs = null;
      this.testStartTimeMs = 0;
      this.browserReceiptTimeMs = 0;
      this.latencyExcludingDecode = 0;
      this.testDuration = 0;
      this.networkLatency = 0;
      this.browserSendLatency = 0;
      this.frameDisplayDeltaTimeMs = 0;
      this.endToEndLatency = 0;
      this.encodeLatency = 0;
    }
    /**
     * Sets the Delta Time Milliseconds
     * @param DeltaTimeMs - Delta Time Milliseconds
     */
    setFrameDisplayDeltaTime(DeltaTimeMs) {
      if (this.frameDisplayDeltaTimeMs == 0) {
        this.frameDisplayDeltaTimeMs = Math.round(DeltaTimeMs);
      }
    }
    /**
     * Process the encoder times and set them
     */
    processFields() {
      if (this.EncodeMs == null && (this.PreEncodeTimeMs != null || this.PostEncodeTimeMs != null)) {
        Logger.Info(`Setting Encode Ms 
 ${this.PostEncodeTimeMs} 
 ${this.PreEncodeTimeMs}`);
        this.EncodeMs = this.PostEncodeTimeMs - this.PreEncodeTimeMs;
      }
      if (this.CaptureToSendMs == null && (this.PreCaptureTimeMs != null || this.PostCaptureTimeMs != null)) {
        Logger.Info(`Setting CaptureToSendMs Ms 
 ${this.PostCaptureTimeMs} 
 ${this.PreCaptureTimeMs}`);
        this.CaptureToSendMs = this.PostCaptureTimeMs - this.PreCaptureTimeMs;
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/FileUtil.js
  var FileUtil = class {
    /**
     * Processes a files extension when received over data channel
     * @param view - the file extension data
     */
    static setExtensionFromBytes(view, file) {
      if (!file.receiving) {
        file.mimetype = "";
        file.extension = "";
        file.receiving = true;
        file.valid = false;
        file.chunks = 0;
        file.data = [];
        file.timestampStart = (/* @__PURE__ */ new Date()).getTime();
        Logger.Info("Received first chunk of file");
      }
      const extensionAsString = new TextDecoder("utf-16").decode(view.slice(1));
      Logger.Info(extensionAsString);
      file.extension = extensionAsString;
    }
    /**
     * Processes a files mime type when received over data channel
     * @param view - the file mime type data
     */
    static setMimeTypeFromBytes(view, file) {
      if (!file.receiving) {
        file.mimetype = "";
        file.extension = "";
        file.receiving = true;
        file.valid = false;
        file.chunks = 0;
        file.data = [];
        file.timestampStart = (/* @__PURE__ */ new Date()).getTime();
        Logger.Info("Received first chunk of file");
      }
      const mimeAsString = new TextDecoder("utf-16").decode(view.slice(1));
      Logger.Info(mimeAsString);
      file.mimetype = mimeAsString;
    }
    /**
     * Processes a files contents when received over data channel
     * @param view - the file contents data
     */
    static setContentsFromBytes(view, file) {
      if (!file.receiving)
        return;
      const typeSize = 1;
      const intSize = 4;
      const maxMessageSize = 16 * 1024;
      const headerSize = typeSize + intSize;
      const maxPayloadSize = maxMessageSize - headerSize;
      file.chunks = Math.ceil(new DataView(view.slice(typeSize, headerSize).buffer).getInt32(0, true) / maxPayloadSize);
      const fileBytes = view.slice(headerSize);
      file.data.push(fileBytes);
      Logger.Info(`Received file chunk: ${file.data.length}/${file.chunks}`);
      if (file.data.length === file.chunks) {
        file.receiving = false;
        file.valid = true;
        Logger.Info("Received complete file");
        const transferDuration = (/* @__PURE__ */ new Date()).getTime() - file.timestampStart;
        const transferBitrate = Math.round(file.chunks * maxMessageSize / transferDuration);
        Logger.Info(`Average transfer bitrate: ${transferBitrate}kb/s over ${transferDuration / 1e3} seconds`);
      } else if (file.data.length > file.chunks) {
        file.receiving = false;
        Logger.Error(`Received bigger file than advertised: ${file.data.length}/${file.chunks}`);
      }
    }
  };
  var FileTemplate = class {
    constructor() {
      this.mimetype = "";
      this.extension = "";
      this.receiving = false;
      this.chunks = 0;
      this.data = [];
      this.valid = false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/SpecialKeyCodes.js
  var SpecialKeyCodes = class {
  };
  SpecialKeyCodes.backSpace = 8;
  SpecialKeyCodes.shift = 16;
  SpecialKeyCodes.control = 17;
  SpecialKeyCodes.alt = 18;
  SpecialKeyCodes.rightShift = 253;
  SpecialKeyCodes.rightControl = 254;
  SpecialKeyCodes.rightAlt = 255;

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/KeyCodes.js
  var CodeToKeyCode = Object.freeze({
    Escape: 27,
    Digit0: 48,
    Digit1: 49,
    Digit2: 50,
    Digit3: 51,
    Digit4: 52,
    Digit5: 53,
    Digit6: 54,
    Digit7: 55,
    Digit8: 56,
    Digit9: 57,
    Minus: 173,
    Equal: 187,
    Backspace: 8,
    Tab: 9,
    KeyQ: 81,
    KeyW: 87,
    KeyE: 69,
    KeyR: 82,
    KeyT: 84,
    KeyY: 89,
    KeyU: 85,
    KeyI: 73,
    KeyO: 79,
    KeyP: 80,
    BracketLeft: 219,
    BracketRight: 221,
    Enter: 13,
    ControlLeft: 17,
    KeyA: 65,
    KeyS: 83,
    KeyD: 68,
    KeyF: 70,
    KeyG: 71,
    KeyH: 72,
    KeyJ: 74,
    KeyK: 75,
    KeyL: 76,
    Semicolon: 186,
    Quote: 222,
    Backquote: 192,
    ShiftLeft: 16,
    Backslash: 220,
    KeyZ: 90,
    KeyX: 88,
    KeyC: 67,
    KeyV: 86,
    KeyB: 66,
    KeyN: 78,
    KeyM: 77,
    Comma: 188,
    Period: 190,
    Slash: 191,
    ShiftRight: 253,
    AltLeft: 18,
    Space: 32,
    CapsLock: 20,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Pause: 19,
    ScrollLock: 145,
    NumpadDivide: 111,
    NumpadMultiply: 106,
    NumpadSubtract: 109,
    NumpadAdd: 107,
    NumpadDecimal: 110,
    Numpad9: 105,
    Numpad8: 104,
    Numpad7: 103,
    Numpad6: 102,
    Numpad5: 101,
    Numpad4: 100,
    Numpad3: 99,
    Numpad2: 98,
    Numpad1: 97,
    Numpad0: 96,
    NumLock: 144,
    ControlRight: 254,
    AltRight: 255,
    Home: 36,
    End: 35,
    ArrowUp: 38,
    ArrowLeft: 37,
    ArrowRight: 39,
    ArrowDown: 40,
    PageUp: 33,
    PageDown: 34,
    Insert: 45,
    Delete: 46,
    ContextMenu: 93,
    // macOS Command and Windows Meta keys. The UE side maps key codes 91/92
    // to LeftWindowKey/RightWindowKey (currently routed to EKeys::Invalid in
    // stock UE — Epic-internal ticket UE-228795 enables them). Sending the
    // codes from the frontend is harmless when UE has no binding and lets
    // applications that patch UE handle Cmd/Win shortcuts.
    MetaLeft: 91,
    MetaRight: 92,
    // Legacy KeyboardEvent.code values some browsers historically emitted
    // for the same physical keys. Keep them mapped so we don't drop input
    // on older browsers.
    OSLeft: 91,
    OSRight: 92
  });

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/KeyboardController.js
  var KeyboardController = class {
    constructor(streamMessageController, config2, activeKeys) {
      this.streamMessageController = streamMessageController;
      this.config = config2;
      this.activeKeys = activeKeys;
      this.onKeyDownListener = this.handleOnKeyDown.bind(this);
      this.onKeyUpListener = this.handleOnKeyUp.bind(this);
      this.onKeyPressListener = this.handleOnKeyPress.bind(this);
    }
    register() {
      document.addEventListener("keydown", this.onKeyDownListener);
      document.addEventListener("keyup", this.onKeyUpListener);
      document.addEventListener("keypress", this.onKeyPressListener);
    }
    unregister() {
      document.removeEventListener("keydown", this.onKeyDownListener);
      document.removeEventListener("keyup", this.onKeyUpListener);
      document.removeEventListener("keypress", this.onKeyPressListener);
    }
    handleOnKeyDown(keyboardEvent) {
      var _a;
      const keyCode = this.getKeycode(keyboardEvent);
      if (!keyCode || keyCode === 229) {
        return;
      }
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      (_a = toStreamerHandlers.get("KeyDown")) === null || _a === void 0 ? void 0 : _a([this.getKeycode(keyboardEvent), keyboardEvent.repeat ? 1 : 0]);
      const activeKeys = this.activeKeys.getActiveKeys();
      activeKeys.push(keyCode);
      if (keyCode === SpecialKeyCodes.backSpace) {
        this.handleOnKeyPress(new KeyboardEvent("keypress", {
          charCode: SpecialKeyCodes.backSpace,
          keyCode: SpecialKeyCodes.backSpace
        }));
      }
      if (this.config.isFlagEnabled(Flags.SuppressBrowserKeys) && this.isKeyCodeBrowserKey(keyCode)) {
        keyboardEvent.preventDefault();
      }
    }
    handleOnKeyUp(keyboardEvent) {
      var _a;
      const keyCode = this.getKeycode(keyboardEvent);
      if (!keyCode) {
        return;
      }
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      (_a = toStreamerHandlers.get("KeyUp")) === null || _a === void 0 ? void 0 : _a([keyCode]);
      if (this.config.isFlagEnabled(Flags.SuppressBrowserKeys) && this.isKeyCodeBrowserKey(keyCode)) {
        keyboardEvent.preventDefault();
      }
    }
    handleOnKeyPress(keyboardEvent) {
      var _a;
      const keyCode = this.getKeycode(keyboardEvent);
      if (!keyCode) {
        return;
      }
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      (_a = toStreamerHandlers.get("KeyPress")) === null || _a === void 0 ? void 0 : _a([keyCode]);
    }
    /**
     * Gets the Keycode of the Key pressed
     * @param keyboardEvent - Key board Event
     * @returns - the key code of the Key
     */
    getKeycode(keyboardEvent) {
      if (!("keyCode" in keyboardEvent)) {
        const event = keyboardEvent;
        if (event.code in CodeToKeyCode) {
          return CodeToKeyCode[event.code];
        } else {
          Logger.Warning(`Keyboard code of ${event.code} is not supported in our mapping, ignoring this key.`);
          return null;
        }
      }
      if (keyboardEvent.keyCode === SpecialKeyCodes.shift && keyboardEvent.code === "ShiftRight") {
        return SpecialKeyCodes.rightShift;
      } else if (keyboardEvent.keyCode === SpecialKeyCodes.control && keyboardEvent.code === "ControlRight") {
        return SpecialKeyCodes.rightControl;
      } else if (keyboardEvent.keyCode === SpecialKeyCodes.alt && keyboardEvent.code === "AltRight") {
        return SpecialKeyCodes.rightAlt;
      } else if (keyboardEvent.code === "MetaLeft" || keyboardEvent.code === "OSLeft") {
        return CodeToKeyCode["MetaLeft"];
      } else if (keyboardEvent.code === "MetaRight" || keyboardEvent.code === "OSRight") {
        return CodeToKeyCode["MetaRight"];
      } else {
        return keyboardEvent.keyCode;
      }
    }
    /**
     * Browser keys do not have a charCode so we only need to test keyCode.
     * @param keyCode - the browser keycode number
     */
    isKeyCodeBrowserKey(keyCode) {
      return keyCode >= 112 && keyCode <= 123 || keyCode === 9;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/MouseButtons.js
  var MouseButton = class {
  };
  MouseButton.mainButton = 0;
  MouseButton.auxiliaryButton = 1;
  MouseButton.secondaryButton = 2;
  MouseButton.fourthButton = 3;
  MouseButton.fifthButton = 4;
  var MouseButtonsMask = class {
  };
  MouseButtonsMask.primaryButton = 1;
  MouseButtonsMask.secondaryButton = 2;
  MouseButtonsMask.auxiliaryButton = 4;
  MouseButtonsMask.fourthButton = 8;
  MouseButtonsMask.fifthButton = 16;

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/MouseController.js
  var MouseController = class {
    constructor(streamMessageController, videoPlayer, coordinateConverter, activeKeys, config2) {
      this.streamMessageController = streamMessageController;
      this.coordinateConverter = coordinateConverter;
      this.videoPlayer = videoPlayer;
      this.activeKeys = activeKeys;
      this.config = config2;
      this.onEnterListener = this.onMouseEnter.bind(this);
      this.onLeaveListener = this.onMouseLeave.bind(this);
    }
    register() {
      this.registerMouseEnterAndLeaveEvents();
    }
    unregister() {
      this.unregisterMouseEnterAndLeaveEvents();
    }
    registerMouseEnterAndLeaveEvents() {
      const videoElementParent = this.videoPlayer.getVideoParentElement();
      videoElementParent === null || videoElementParent === void 0 ? void 0 : videoElementParent.addEventListener("mouseenter", this.onEnterListener);
      videoElementParent === null || videoElementParent === void 0 ? void 0 : videoElementParent.addEventListener("mouseleave", this.onLeaveListener);
    }
    unregisterMouseEnterAndLeaveEvents() {
      const videoElementParent = this.videoPlayer.getVideoParentElement();
      videoElementParent === null || videoElementParent === void 0 ? void 0 : videoElementParent.removeEventListener("mouseenter", this.onEnterListener);
      videoElementParent === null || videoElementParent === void 0 ? void 0 : videoElementParent.removeEventListener("mouseleave", this.onLeaveListener);
    }
    onMouseEnter(event) {
      var _a;
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      (_a = this.streamMessageController.toStreamerHandlers.get("MouseEnter")) === null || _a === void 0 ? void 0 : _a();
      this.pressMouseButtons(event.buttons, event.x, event.y);
    }
    onMouseLeave(event) {
      var _a;
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      (_a = this.streamMessageController.toStreamerHandlers.get("MouseLeave")) === null || _a === void 0 ? void 0 : _a();
      this.releaseMouseButtons(event.buttons, event.x, event.y);
    }
    releaseMouseButtons(buttons, X, Y) {
      const coord = this.coordinateConverter.translateUnsigned(X, Y);
      if (buttons & MouseButtonsMask.primaryButton) {
        this.sendMouseUp(MouseButton.mainButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.secondaryButton) {
        this.sendMouseUp(MouseButton.secondaryButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.auxiliaryButton) {
        this.sendMouseUp(MouseButton.auxiliaryButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.fourthButton) {
        this.sendMouseUp(MouseButton.fourthButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.fifthButton) {
        this.sendMouseUp(MouseButton.fifthButton, coord.x, coord.y);
      }
    }
    pressMouseButtons(buttons, X, Y) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const coord = this.coordinateConverter.translateUnsigned(X, Y);
      if (buttons & MouseButtonsMask.primaryButton) {
        this.sendMouseDown(MouseButton.mainButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.secondaryButton) {
        this.sendMouseDown(MouseButton.secondaryButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.auxiliaryButton) {
        this.sendMouseDown(MouseButton.auxiliaryButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.fourthButton) {
        this.sendMouseDown(MouseButton.fourthButton, coord.x, coord.y);
      }
      if (buttons & MouseButtonsMask.fifthButton) {
        this.sendMouseDown(MouseButton.fifthButton, coord.x, coord.y);
      }
    }
    sendMouseDown(button, X, Y) {
      var _a;
      (_a = this.streamMessageController.toStreamerHandlers.get("MouseDown")) === null || _a === void 0 ? void 0 : _a([button, X, Y]);
    }
    sendMouseUp(button, X, Y) {
      var _a;
      const coord = this.coordinateConverter.translateUnsigned(X, Y);
      (_a = this.streamMessageController.toStreamerHandlers.get("MouseUp")) === null || _a === void 0 ? void 0 : _a([button, coord.x, coord.y]);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/MouseControllerLocked.js
  var MouseControllerLocked = class extends MouseController {
    constructor(streamMessageController, videoPlayer, coordinateConverter, activeKeys, config2) {
      super(streamMessageController, videoPlayer, coordinateConverter, activeKeys, config2);
      this.videoElementParent = videoPlayer.getVideoParentElement();
      this.x = this.videoElementParent.getBoundingClientRect().width / 2;
      this.y = this.videoElementParent.getBoundingClientRect().height / 2;
      this.normalizedCoord = this.coordinateConverter.translateUnsigned(this.x, this.y);
      this.onRequestLockListener = this.onRequestLock.bind(this);
      this.onLockStateChangeListener = this.onLockStateChange.bind(this);
      this.onMouseUpListener = this.onMouseUp.bind(this);
      this.onMouseDownListener = this.onMouseDown.bind(this);
      this.onMouseDblClickListener = this.onMouseDblClick.bind(this);
      this.onMouseWheelListener = this.onMouseWheel.bind(this);
      this.onMouseMoveListener = this.onMouseMove.bind(this);
    }
    register() {
      super.register();
      this.videoElementParent.requestPointerLock = this.videoElementParent.requestPointerLock || this.videoElementParent.mozRequestPointerLock;
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
      if (this.videoElementParent.requestPointerLock) {
        this.videoElementParent.addEventListener("click", this.onRequestLockListener);
      }
      document.addEventListener("pointerlockchange", this.onLockStateChangeListener);
      document.addEventListener("mozpointerlockchange", this.onLockStateChangeListener);
      this.videoElementParent.addEventListener("mousedown", this.onMouseDownListener);
      this.videoElementParent.addEventListener("mouseup", this.onMouseUpListener);
      this.videoElementParent.addEventListener("wheel", this.onMouseWheelListener);
      this.videoElementParent.addEventListener("dblclick", this.onMouseDblClickListener);
    }
    unregister() {
      const pointerLockElement = document.pointerLockElement || document.mozPointerLockElement;
      if (document.exitPointerLock && pointerLockElement === this.videoElementParent) {
        document.exitPointerLock();
      }
      this.videoElementParent.removeEventListener("click", this.onRequestLockListener);
      document.removeEventListener("pointerlockchange", this.onLockStateChangeListener);
      document.removeEventListener("mozpointerlockchange", this.onLockStateChangeListener);
      document.removeEventListener("mousemove", this.onMouseMoveListener);
      this.videoElementParent.removeEventListener("mousedown", this.onMouseDownListener);
      this.videoElementParent.removeEventListener("mouseup", this.onMouseUpListener);
      this.videoElementParent.removeEventListener("wheel", this.onMouseWheelListener);
      this.videoElementParent.removeEventListener("dblclick", this.onMouseDblClickListener);
      super.unregister();
    }
    onRequestLock() {
      void this.videoElementParent.requestPointerLock();
    }
    onLockStateChange() {
      const pointerLockElement = document.pointerLockElement || document.mozPointerLockElement;
      if (pointerLockElement === this.videoElementParent) {
        Logger.Info("Pointer locked");
        document.addEventListener("mousemove", this.onMouseMoveListener);
      } else {
        Logger.Info("The pointer lock status is now unlocked");
        document.removeEventListener("mousemove", this.onMouseMoveListener);
        const activeKeys = this.activeKeys.getActiveKeys();
        activeKeys.forEach((key) => {
          this.streamMessageController.toStreamerHandlers.get("KeyUp")([key]);
        });
      }
    }
    onMouseDown(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.streamMessageController.toStreamerHandlers.get("MouseDown")([
        event.button,
        // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
        // uses the system cursor location which hasn't moved
        this.normalizedCoord.x,
        this.normalizedCoord.y
      ]);
    }
    onMouseUp(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.streamMessageController.toStreamerHandlers.get("MouseUp")([
        event.button,
        // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
        // uses the system cursor location which hasn't moved
        this.normalizedCoord.x,
        this.normalizedCoord.y
      ]);
    }
    onMouseMove(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const styleWidth = this.videoPlayer.getVideoParentElement().clientWidth;
      const styleHeight = this.videoPlayer.getVideoParentElement().clientHeight;
      this.x += event.movementX;
      this.y += event.movementY;
      while (this.x > styleWidth) {
        this.x -= styleWidth;
      }
      while (this.y > styleHeight) {
        this.y -= styleHeight;
      }
      while (this.x < 0) {
        this.x += styleWidth;
      }
      while (this.y < 0) {
        this.y += styleHeight;
      }
      this.normalizedCoord = this.coordinateConverter.translateUnsigned(this.x, this.y);
      const delta = this.coordinateConverter.translateSigned(event.movementX, event.movementY);
      this.streamMessageController.toStreamerHandlers.get("MouseMove")([
        this.normalizedCoord.x,
        this.normalizedCoord.y,
        delta.x,
        delta.y
      ]);
    }
    onMouseWheel(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.streamMessageController.toStreamerHandlers.get("MouseWheel")([
        event.wheelDelta,
        // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
        // uses the system cursor location which hasn't moved
        this.normalizedCoord.x,
        this.normalizedCoord.y
      ]);
    }
    onMouseDblClick(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.streamMessageController.toStreamerHandlers.get("MouseDouble")([
        event.button,
        // We use the store value of this.coord as opposed to the mouseEvent.x/y as the mouseEvent location
        // uses the system cursor location which hasn't moved
        this.normalizedCoord.x,
        this.normalizedCoord.y
      ]);
      if (this.config.isFlagEnabled(Flags.MouseDoubleClickAutoRelease)) {
        this.streamMessageController.toStreamerHandlers.get("MouseUp")([
          event.button,
          this.normalizedCoord.x,
          this.normalizedCoord.y
        ]);
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/MouseControllerHovering.js
  var MouseControllerHovering = class extends MouseController {
    constructor(streamMessageController, videoPlayer, coordinateConverter, activeKeys, config2) {
      super(streamMessageController, videoPlayer, coordinateConverter, activeKeys, config2);
      this.pressedButtons = /* @__PURE__ */ new Set();
      this.videoElementParent = videoPlayer.getVideoParentElement();
      this.onMouseUpListener = this.onMouseUp.bind(this);
      this.onMouseDownListener = this.onMouseDown.bind(this);
      this.onMouseDblClickListener = this.onMouseDblClick.bind(this);
      this.onMouseWheelListener = this.onMouseWheel.bind(this);
      this.onMouseMoveListener = this.onMouseMove.bind(this);
      this.onContextMenuListener = this.onContextMenu.bind(this);
    }
    register() {
      super.register();
      this.videoElementParent.addEventListener("mousemove", this.onMouseMoveListener);
      this.videoElementParent.addEventListener("mousedown", this.onMouseDownListener);
      this.videoElementParent.addEventListener("mouseup", this.onMouseUpListener);
      this.videoElementParent.addEventListener("contextmenu", this.onContextMenuListener);
      this.videoElementParent.addEventListener("wheel", this.onMouseWheelListener);
      this.videoElementParent.addEventListener("dblclick", this.onMouseDblClickListener);
    }
    unregister() {
      this.videoElementParent.removeEventListener("mousemove", this.onMouseMoveListener);
      this.videoElementParent.removeEventListener("mousedown", this.onMouseDownListener);
      this.videoElementParent.removeEventListener("mouseup", this.onMouseUpListener);
      this.videoElementParent.removeEventListener("contextmenu", this.onContextMenuListener);
      this.videoElementParent.removeEventListener("wheel", this.onMouseWheelListener);
      this.videoElementParent.removeEventListener("dblclick", this.onMouseDblClickListener);
      if (this.pressedButtons.size > 0) {
        window.removeEventListener("mousemove", this.onMouseMoveListener);
        window.removeEventListener("mouseup", this.onMouseUpListener);
        this.pressedButtons.clear();
      }
      super.unregister();
    }
    startCapturing() {
      this.videoElementParent.removeEventListener("mousemove", this.onMouseMoveListener);
      this.videoElementParent.removeEventListener("mouseup", this.onMouseUpListener);
      window.addEventListener("mousemove", this.onMouseMoveListener);
      window.addEventListener("mouseup", this.onMouseUpListener);
    }
    stopCapturing() {
      window.removeEventListener("mousemove", this.onMouseMoveListener);
      window.removeEventListener("mouseup", this.onMouseUpListener);
      this.videoElementParent.addEventListener("mousemove", this.onMouseMoveListener);
      this.videoElementParent.addEventListener("mouseup", this.onMouseUpListener);
    }
    /**
     * Compute (offsetX, offsetY) relative to the video element from a window-
     * level event whose `target` may be any other element on the page.
     */
    offsetFromVideo(event) {
      if (event.currentTarget === this.videoElementParent) {
        return { x: event.offsetX, y: event.offsetY };
      }
      const rect = this.videoElementParent.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    onMouseDown(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const off = this.offsetFromVideo(event);
      const coord = this.coordinateConverter.translateUnsigned(off.x, off.y);
      this.streamMessageController.toStreamerHandlers.get("MouseDown")([event.button, coord.x, coord.y]);
      event.preventDefault();
      if (this.pressedButtons.size === 0) {
        this.startCapturing();
      }
      this.pressedButtons.add(event.button);
    }
    onMouseUp(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const off = this.offsetFromVideo(event);
      const coord = this.coordinateConverter.translateUnsigned(off.x, off.y);
      this.streamMessageController.toStreamerHandlers.get("MouseUp")([event.button, coord.x, coord.y]);
      event.preventDefault();
      this.pressedButtons.delete(event.button);
      if (this.pressedButtons.size === 0) {
        this.stopCapturing();
      }
    }
    onContextMenu(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      event.preventDefault();
    }
    onMouseMove(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const off = this.offsetFromVideo(event);
      const coord = this.coordinateConverter.translateUnsigned(off.x, off.y);
      const delta = this.coordinateConverter.translateSigned(event.movementX, event.movementY);
      this.streamMessageController.toStreamerHandlers.get("MouseMove")([
        coord.x,
        coord.y,
        delta.x,
        delta.y
      ]);
      if (event.currentTarget === this.videoElementParent) {
        event.preventDefault();
      }
    }
    onMouseWheel(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const coord = this.coordinateConverter.translateUnsigned(event.offsetX, event.offsetY);
      this.streamMessageController.toStreamerHandlers.get("MouseWheel")([
        event.wheelDelta,
        coord.x,
        coord.y
      ]);
      event.preventDefault();
    }
    onMouseDblClick(event) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const coord = this.coordinateConverter.translateUnsigned(event.offsetX, event.offsetY);
      this.streamMessageController.toStreamerHandlers.get("MouseDouble")([event.button, coord.x, coord.y]);
      if (this.config.isFlagEnabled(Flags.MouseDoubleClickAutoRelease)) {
        this.streamMessageController.toStreamerHandlers.get("MouseUp")([event.button, coord.x, coord.y]);
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/TouchController.js
  var TouchController = class {
    constructor(streamMessageController, videoPlayer, coordinateConverter) {
      this.fingers = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
      this.fingerIds = /* @__PURE__ */ new Map();
      this.maxByteValue = 255;
      this.streamMessageController = streamMessageController;
      this.videoPlayer = videoPlayer;
      this.coordinateConverter = coordinateConverter;
      this.videoElementParent = videoPlayer.getVideoElement();
      this.onTouchStartListener = this.onTouchStart.bind(this);
      this.onTouchEndListener = this.onTouchEnd.bind(this);
      this.onTouchMoveListener = this.onTouchMove.bind(this);
    }
    register() {
      this.videoElementParent.addEventListener("touchstart", this.onTouchStartListener);
      this.videoElementParent.addEventListener("touchend", this.onTouchEndListener);
      this.videoElementParent.addEventListener("touchmove", this.onTouchMoveListener);
    }
    unregister() {
      this.videoElementParent.removeEventListener("touchstart", this.onTouchStartListener);
      this.videoElementParent.removeEventListener("touchend", this.onTouchEndListener);
      this.videoElementParent.removeEventListener("touchmove", this.onTouchMoveListener);
    }
    rememberTouch(touch) {
      const finger = this.fingers.pop();
      if (finger === void 0) {
        Logger.Info("exhausted touch identifiers");
      }
      this.fingerIds.set(touch.identifier, finger);
    }
    forgetTouch(touch) {
      this.fingers.push(this.fingerIds.get(touch.identifier));
      this.fingers.sort(function(a, b) {
        return b - a;
      });
      this.fingerIds.delete(touch.identifier);
    }
    onTouchStart(touchEvent) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      for (let t = 0; t < touchEvent.changedTouches.length; t++) {
        this.rememberTouch(touchEvent.changedTouches[t]);
      }
      this.emitTouchData("TouchStart", touchEvent.changedTouches);
      touchEvent.preventDefault();
    }
    onTouchEnd(touchEvent) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.emitTouchData("TouchEnd", touchEvent.changedTouches);
      for (let t = 0; t < touchEvent.changedTouches.length; t++) {
        this.forgetTouch(touchEvent.changedTouches[t]);
      }
      touchEvent.preventDefault();
    }
    onTouchMove(touchEvent) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      this.emitTouchData("TouchMove", touchEvent.touches);
      touchEvent.preventDefault();
    }
    emitTouchData(type, touches) {
      if (!this.videoPlayer.isVideoReady()) {
        return;
      }
      const offset = this.videoPlayer.getVideoParentElement().getBoundingClientRect();
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      for (let t = 0; t < touches.length; t++) {
        const numTouches = 1;
        const touch = touches[t];
        const x = touch.clientX - offset.left;
        const y = touch.clientY - offset.top;
        Logger.Info(`F${this.fingerIds.get(touch.identifier)}=(${x}, ${y})`);
        const coord = this.coordinateConverter.translateUnsigned(x, y);
        switch (type) {
          case "TouchStart":
            toStreamerHandlers.get("TouchStart")([
              numTouches,
              coord.x,
              coord.y,
              this.fingerIds.get(touch.identifier),
              this.maxByteValue * (touch.force > 0 ? touch.force : 1),
              coord.inRange ? 1 : 0
            ]);
            break;
          case "TouchEnd":
            toStreamerHandlers.get("TouchEnd")([
              numTouches,
              coord.x,
              coord.y,
              this.fingerIds.get(touch.identifier),
              this.maxByteValue * touch.force,
              coord.inRange ? 1 : 0
            ]);
            break;
          case "TouchMove":
            toStreamerHandlers.get("TouchMove")([
              numTouches,
              coord.x,
              coord.y,
              this.fingerIds.get(touch.identifier),
              this.maxByteValue * (touch.force > 0 ? touch.force : 1),
              coord.inRange ? 1 : 0
            ]);
            break;
        }
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/TouchControllerFake.js
  var TouchControllerFake = class {
    constructor(streamMessageController, videoPlayer, coordinateConverter) {
      this.streamMessageController = streamMessageController;
      this.videoPlayer = videoPlayer;
      this.coordinateConverter = coordinateConverter;
      this.onTouchStartListener = this.onTouchStart.bind(this);
      this.onTouchEndListener = this.onTouchEnd.bind(this);
      this.onTouchMoveListener = this.onTouchMove.bind(this);
      this.videoElementParentClientRect = this.videoPlayer.getVideoParentElement().getBoundingClientRect();
    }
    register() {
      document.addEventListener("touchstart", this.onTouchStartListener);
      document.addEventListener("touchend", this.onTouchEndListener);
      document.addEventListener("touchmove", this.onTouchMoveListener);
    }
    unregister() {
      document.removeEventListener("touchstart", this.onTouchStartListener);
      document.removeEventListener("touchend", this.onTouchEndListener);
      document.removeEventListener("touchmove", this.onTouchMoveListener);
    }
    onTouchStart(touch) {
      if (!this.videoPlayer.isVideoReady() || touch.target !== this.videoPlayer.getVideoElement()) {
        return;
      }
      if (this.fakeTouchFinger == null) {
        const first_touch = touch.changedTouches[0];
        this.fakeTouchFinger = {
          id: first_touch.identifier,
          x: first_touch.clientX - this.videoElementParentClientRect.left,
          y: first_touch.clientY - this.videoElementParentClientRect.top
        };
        const videoElementParent = this.videoPlayer.getVideoParentElement();
        const mouseEvent = new MouseEvent("mouseenter", first_touch);
        videoElementParent.dispatchEvent(mouseEvent);
        const coord = this.coordinateConverter.translateUnsigned(this.fakeTouchFinger.x, this.fakeTouchFinger.y);
        const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
        toStreamerHandlers.get("MouseDown")([MouseButton.mainButton, coord.x, coord.y]);
      }
      touch.preventDefault();
    }
    onTouchEnd(touchEvent) {
      if (!this.videoPlayer.isVideoReady() || this.fakeTouchFinger == null) {
        return;
      }
      const videoElementParent = this.videoPlayer.getVideoParentElement();
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      for (let t = 0; t < touchEvent.changedTouches.length; t++) {
        const touch = touchEvent.changedTouches[t];
        if (touch.identifier === this.fakeTouchFinger.id) {
          const x = touch.clientX - this.videoElementParentClientRect.left;
          const y = touch.clientY - this.videoElementParentClientRect.top;
          const coord = this.coordinateConverter.translateUnsigned(x, y);
          toStreamerHandlers.get("MouseUp")([MouseButton.mainButton, coord.x, coord.y]);
          const mouseEvent = new MouseEvent("mouseleave", touch);
          videoElementParent.dispatchEvent(mouseEvent);
          this.fakeTouchFinger = null;
          break;
        }
      }
      touchEvent.preventDefault();
    }
    onTouchMove(touchEvent) {
      if (!this.videoPlayer.isVideoReady() || this.fakeTouchFinger == null) {
        return;
      }
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      for (let t = 0; t < touchEvent.touches.length; t++) {
        const touch = touchEvent.touches[t];
        if (touch.identifier === this.fakeTouchFinger.id) {
          const x = touch.clientX - this.videoElementParentClientRect.left;
          const y = touch.clientY - this.videoElementParentClientRect.top;
          const coord = this.coordinateConverter.translateUnsigned(x, y);
          const delta = this.coordinateConverter.translateSigned(x - this.fakeTouchFinger.x, y - this.fakeTouchFinger.y);
          toStreamerHandlers.get("MouseMove")([coord.x, coord.y, delta.x, delta.y]);
          this.fakeTouchFinger.x = x;
          this.fakeTouchFinger.y = y;
          break;
        }
      }
      touchEvent.preventDefault();
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/GamepadTypes.js
  function deepCopyGamepad(gamepad) {
    return JSON.parse(JSON.stringify({
      buttons: gamepad.buttons.map((b) => JSON.parse(JSON.stringify({
        pressed: b.pressed,
        touched: b.touched,
        value: b.value
      }))),
      axes: gamepad.axes
    }));
  }

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/GamepadController.js
  var GamepadLayout;
  (function(GamepadLayout2) {
    GamepadLayout2[GamepadLayout2["RightClusterBottomButton"] = 0] = "RightClusterBottomButton";
    GamepadLayout2[GamepadLayout2["RightClusterRightButton"] = 1] = "RightClusterRightButton";
    GamepadLayout2[GamepadLayout2["RightClusterLeftButton"] = 2] = "RightClusterLeftButton";
    GamepadLayout2[GamepadLayout2["RightClusterTopButton"] = 3] = "RightClusterTopButton";
    GamepadLayout2[GamepadLayout2["LeftShoulder"] = 4] = "LeftShoulder";
    GamepadLayout2[GamepadLayout2["RightShoulder"] = 5] = "RightShoulder";
    GamepadLayout2[GamepadLayout2["LeftTrigger"] = 6] = "LeftTrigger";
    GamepadLayout2[GamepadLayout2["RightTrigger"] = 7] = "RightTrigger";
    GamepadLayout2[GamepadLayout2["SelectOrBack"] = 8] = "SelectOrBack";
    GamepadLayout2[GamepadLayout2["StartOrForward"] = 9] = "StartOrForward";
    GamepadLayout2[GamepadLayout2["LeftAnalogPress"] = 10] = "LeftAnalogPress";
    GamepadLayout2[GamepadLayout2["RightAnalogPress"] = 11] = "RightAnalogPress";
    GamepadLayout2[GamepadLayout2["LeftClusterTopButton"] = 12] = "LeftClusterTopButton";
    GamepadLayout2[GamepadLayout2["LeftClusterBottomButton"] = 13] = "LeftClusterBottomButton";
    GamepadLayout2[GamepadLayout2["LeftClusterLeftButton"] = 14] = "LeftClusterLeftButton";
    GamepadLayout2[GamepadLayout2["LeftClusterRightButton"] = 15] = "LeftClusterRightButton";
    GamepadLayout2[GamepadLayout2["CentreButton"] = 16] = "CentreButton";
    GamepadLayout2[GamepadLayout2["LeftStickHorizontal"] = 0] = "LeftStickHorizontal";
    GamepadLayout2[GamepadLayout2["LeftStickVertical"] = 1] = "LeftStickVertical";
    GamepadLayout2[GamepadLayout2["RightStickHorizontal"] = 2] = "RightStickHorizontal";
    GamepadLayout2[GamepadLayout2["RightStickVertical"] = 3] = "RightStickVertical";
  })(GamepadLayout || (GamepadLayout = {}));
  var GamepadController = class {
    constructor(streamMessageController) {
      this.streamMessageController = streamMessageController;
      this.onGamepadConnectedListener = this.onGamepadConnected.bind(this);
      this.onGamepadDisconnectedListener = this.onGamepadDisconnected.bind(this);
      this.beforeUnloadListener = this.onBeforeUnload.bind(this);
      this.requestAnimationFrame = (window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.requestAnimationFrame).bind(window);
    }
    register() {
      window.addEventListener("beforeunload", this.beforeUnloadListener);
      const browserWindow = window;
      if ("GamepadEvent" in browserWindow) {
        window.addEventListener("gamepadconnected", this.onGamepadConnectedListener);
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnectedListener);
      } else if ("WebKitGamepadEvent" in browserWindow) {
        window.addEventListener("webkitgamepadconnected", this.onGamepadConnectedListener);
        window.addEventListener("webkitgamepaddisconnected", this.onGamepadDisconnectedListener);
      }
      this.controllers = [];
      if (navigator.getGamepads) {
        for (const gamepad of navigator.getGamepads()) {
          if (gamepad) {
            this.onGamepadConnected(new GamepadEvent("gamepadconnected", { gamepad }));
          }
        }
      }
    }
    unregister() {
      window.removeEventListener("gamepadconnected", this.onGamepadConnectedListener);
      window.removeEventListener("gamepaddisconnected", this.onGamepadDisconnectedListener);
      window.removeEventListener("webkitgamepadconnected", this.onGamepadConnectedListener);
      window.removeEventListener("webkitgamepaddisconnected", this.onGamepadDisconnectedListener);
      for (const controller of this.controllers) {
        if (controller && controller.id !== void 0) {
          this.streamMessageController.toStreamerHandlers.get("GamepadDisconnected")([controller.id]);
        }
      }
      this.controllers = [];
    }
    onGamepadResponseReceived(gamepadId) {
      for (const controller of this.controllers) {
        if (controller && controller.id === void 0) {
          controller.id = gamepadId;
          break;
        }
      }
    }
    onGamepadConnected(event) {
      const gamepad = event.gamepad;
      const newController = {
        currentState: deepCopyGamepad(gamepad),
        prevState: deepCopyGamepad(gamepad),
        id: void 0
      };
      this.controllers[gamepad.index] = newController;
      window.requestAnimationFrame(() => this.updateStatus());
      this.streamMessageController.toStreamerHandlers.get("GamepadConnected")();
    }
    onGamepadDisconnected(event) {
      const gamepad = event.gamepad;
      const deletedController = this.controllers[gamepad.index];
      this.controllers = this.controllers.filter((_, index2) => index2 !== gamepad.index);
      if (deletedController.id !== void 0) {
        this.streamMessageController.toStreamerHandlers.get("GamepadDisconnected")([
          deletedController.id
        ]);
      }
    }
    scanGamepads() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && this.controllers[gamepads[i].index] !== void 0) {
          this.controllers[gamepads[i].index].currentState = gamepads[i];
        }
      }
    }
    updateStatus() {
      this.scanGamepads();
      const toStreamerHandlers = this.streamMessageController.toStreamerHandlers;
      for (const controller of this.controllers) {
        if (!controller) {
          continue;
        }
        const controllerId = controller.id === void 0 ? this.controllers.indexOf(controller) : controller.id;
        const currentState = controller.currentState;
        for (let i = 0; i < controller.currentState.buttons.length; i++) {
          const currentButton = controller.currentState.buttons[i];
          const previousButton = controller.prevState.buttons[i];
          if (currentButton.pressed) {
            if (i === GamepadLayout.LeftTrigger) {
              toStreamerHandlers.get("GamepadAnalog")([controllerId, 5, currentButton.value]);
            } else if (i === GamepadLayout.RightTrigger) {
              toStreamerHandlers.get("GamepadAnalog")([controllerId, 6, currentButton.value]);
            } else {
              toStreamerHandlers.get("GamepadButtonPressed")([
                controllerId,
                i,
                previousButton.pressed ? 1 : 0
              ]);
            }
          } else if (!currentButton.pressed && previousButton.pressed) {
            if (i === GamepadLayout.LeftTrigger) {
              toStreamerHandlers.get("GamepadAnalog")([controllerId, 5, 0]);
            } else if (i === GamepadLayout.RightTrigger) {
              toStreamerHandlers.get("GamepadAnalog")([controllerId, 6, 0]);
            } else {
              toStreamerHandlers.get("GamepadButtonReleased")([controllerId, i, 0]);
            }
          }
        }
        for (let i = 0; i < currentState.axes.length; i += 2) {
          const x = parseFloat(currentState.axes[i].toFixed(4));
          const y = -parseFloat(currentState.axes[i + 1].toFixed(4));
          toStreamerHandlers.get("GamepadAnalog")([controllerId, i + 1, x]);
          toStreamerHandlers.get("GamepadAnalog")([controllerId, i + 2, y]);
        }
        const controllerIndex = this.controllers.indexOf(controller);
        this.controllers[controllerIndex].prevState = deepCopyGamepad(currentState);
      }
      if (this.controllers.length > 0) {
        this.requestAnimationFrame(() => this.updateStatus());
      }
    }
    onBeforeUnload(_) {
      for (const controller of this.controllers) {
        if (!controller || controller.id === void 0) {
          continue;
        }
        this.streamMessageController.toStreamerHandlers.get("GamepadDisconnected")([controller.id]);
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/InputClassesFactory.js
  var InputClassesFactory = class {
    /**
     * @param toStreamerMessagesProvider - Stream message instance
     * @param videoElementProvider - Video Player instance
     * @param coordinateConverter - A coordinateConverter instance
     */
    constructor(toStreamerMessagesProvider, videoElementProvider, coordinateConverter) {
      this.activeKeys = new ActiveKeys();
      this.toStreamerMessagesProvider = toStreamerMessagesProvider;
      this.videoElementProvider = videoElementProvider;
      this.coordinateConverter = coordinateConverter;
    }
    /**
     * Registers browser key events.
     */
    registerKeyBoard(config2) {
      Logger.Info("Register Keyboard Events");
      const keyboardController = new KeyboardController(this.toStreamerMessagesProvider, config2, this.activeKeys);
      keyboardController.register();
      return keyboardController;
    }
    /**
     * register mouse events based on a control type
     * @param controlScheme - if the mouse is either hovering or locked
     */
    registerMouse(controlScheme, config2) {
      Logger.Info("Register Mouse Events");
      let mouseController;
      if (controlScheme == ControlSchemeType.HoveringMouse) {
        mouseController = new MouseControllerHovering(this.toStreamerMessagesProvider, this.videoElementProvider, this.coordinateConverter, this.activeKeys, config2);
      } else {
        mouseController = new MouseControllerLocked(this.toStreamerMessagesProvider, this.videoElementProvider, this.coordinateConverter, this.activeKeys, config2);
      }
      mouseController.register();
      return mouseController;
    }
    /**
     * register touch events
     * @param fakeMouseTouch - the faked mouse touch event
     */
    registerTouch(fakeMouseTouch) {
      Logger.Info("Registering Touch");
      let touchController;
      if (fakeMouseTouch) {
        touchController = new TouchControllerFake(this.toStreamerMessagesProvider, this.videoElementProvider, this.coordinateConverter);
      } else {
        touchController = new TouchController(this.toStreamerMessagesProvider, this.videoElementProvider, this.coordinateConverter);
      }
      touchController.register();
      return touchController;
    }
    /**
     * registers a gamepad
     */
    registerGamePad() {
      Logger.Info("Register Game Pad");
      const gamepadController = new GamepadController(this.toStreamerMessagesProvider);
      gamepadController.register();
      return gamepadController;
    }
  };
  var ActiveKeys = class {
    constructor() {
      this.activeKeys = [];
      this.activeKeys = [];
    }
    /**
     * Get the current array of active keys
     * @returns - an array of active keys
     */
    getActiveKeys() {
      return this.activeKeys;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/VideoPlayer/VideoPlayer.js
  var VideoPlayer = class _VideoPlayer {
    /**
     * @param videoElementParent the html div the the video player will be injected into
     * @param config the applications configuration. We're interested in the startVideoMuted flag
     */
    constructor(videoElementParent, config2) {
      this.lastTimeResized = (/* @__PURE__ */ new Date()).getTime();
      this.videoElement = document.createElement("video");
      this.config = config2;
      this.videoElement.id = "streamingVideo";
      this.videoElement.disablePictureInPicture = true;
      this.videoElement.playsInline = true;
      this.videoElement.style.width = "100%";
      this.videoElement.style.height = "100%";
      this.videoElement.style.position = "absolute";
      this.videoElement.style.pointerEvents = "all";
      videoElementParent.appendChild(this.videoElement);
      this.onResizePlayerCallback = () => {
        Logger.Warning("Resolution changed, restyling player, did you forget to override this function?");
      };
      this.onMatchViewportResolutionCallback = () => {
        Logger.Warning("Resolution changed and match viewport resolution is turned on, did you forget to override this function?");
      };
      this.videoElement.onclick = () => {
        if (this.audioElement !== void 0 && this.audioElement.paused) {
          void this.audioElement.play();
        }
        if (this.videoElement.paused) {
          void this.videoElement.play();
        }
      };
      this.videoElement.onloadedmetadata = () => {
        this.onVideoInitialized();
      };
      window.addEventListener("resize", () => this.resizePlayerStyle(), true);
      window.addEventListener("orientationchange", () => this.onOrientationChange());
    }
    destroy() {
      this.videoElement.src = "";
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      if (this.audioElement) {
        this.audioElement.src = "";
        this.audioElement.srcObject = null;
        this.audioElement.remove();
      }
    }
    setAudioElement(audioElement) {
      this.audioElement = audioElement;
    }
    /**
     * Sets up the video element with any application config and plays the video element.
     * @returns A promise for if playing the video was successful or not.
     */
    play() {
      this.videoElement.muted = this.config.isFlagEnabled(Flags.StartVideoMuted);
      this.videoElement.autoplay = this.config.isFlagEnabled(Flags.AutoPlayVideo);
      return this.videoElement.play();
    }
    /**
     * @returns True if the video element is paused.
     */
    isPaused() {
      return this.videoElement.paused;
    }
    /**
     * @returns - whether the video element is playing.
     */
    isVideoReady() {
      return this.videoElement.readyState !== void 0 && this.videoElement.readyState > 0;
    }
    /**
     * @returns True if the video element has a valid video source (srcObject).
     */
    hasVideoSource() {
      return this.videoElement.srcObject !== void 0 && this.videoElement.srcObject !== null;
    }
    /**
     * Get the current context of the html video element
     * @returns - the current context of the video element
     */
    getVideoElement() {
      return this.videoElement;
    }
    /**
     * Get the current context of the html video elements parent
     * @returns - the current context of the video elements parent
     */
    getVideoParentElement() {
      var _a;
      return (_a = this.videoElement.parentElement) !== null && _a !== void 0 ? _a : void 0;
    }
    /**
     * Set the Video Elements src object tracks to enable
     * @param enabled - Enable Tracks on the Src Object
     */
    setVideoEnabled(enabled) {
      const videoElement = this.videoElement;
      videoElement.srcObject.getTracks().forEach((track) => track.enabled = enabled);
    }
    /**
     * An override for when the video has been initialized with a srcObject
     */
    onVideoInitialized() {
    }
    /**
     * On the orientation change of a window clear the timeout
     */
    onOrientationChange() {
      clearTimeout(this.orientationChangeTimeout);
      this.orientationChangeTimeout = window.setTimeout(() => {
        this.resizePlayerStyle();
      }, 500);
    }
    /**
     * Resizes the player style based on the window height and width
     * @returns - nil if requirements are satisfied
     */
    resizePlayerStyle() {
      const videoElementParent = this.getVideoParentElement();
      if (!videoElementParent) {
        return;
      }
      this.updateVideoStreamSize();
      if (videoElementParent.classList.contains("fixed-size")) {
        this.onResizePlayerCallback();
        return;
      }
      this.resizePlayerStyleToFillParentElement();
      this.onResizePlayerCallback();
    }
    /**
     * Resizes the player element to fill the parent element
     */
    resizePlayerStyleToFillParentElement() {
      const videoElementParent = this.getVideoParentElement();
      const styleWidth = "100%";
      const styleHeight = "100%";
      const styleTop = 0;
      const styleLeft = 0;
      videoElementParent.setAttribute("style", "top: " + styleTop + "px; left: " + styleLeft + "px; width: " + styleWidth + "; height: " + styleHeight + "; cursor: default;");
    }
    updateVideoStreamSize() {
      if (!this.config.isFlagEnabled(Flags.MatchViewportResolution)) {
        return;
      }
      const now = (/* @__PURE__ */ new Date()).getTime();
      if (now - this.lastTimeResized > 300) {
        const videoElementParent = this.getVideoParentElement();
        if (!videoElementParent) {
          return;
        }
        const viewportResolutionScale = this.config.hasNumericSetting(NumericParameters.ViewportResScale) ? this.config.getNumericSettingValue(NumericParameters.ViewportResScale) : 1;
        const scaledWidth = Math.round(videoElementParent.clientWidth * viewportResolutionScale);
        const scaledHeight = Math.round(videoElementParent.clientHeight * viewportResolutionScale);
        if (scaledWidth > _VideoPlayer.maxEncoderDimension || scaledHeight > _VideoPlayer.maxEncoderDimension) {
          Logger.Warning(`Requested stream resolution (${scaledWidth}x${scaledHeight}) exceeds the common H.264 encoder limit of ${_VideoPlayer.maxEncoderDimension}x${_VideoPlayer.maxEncoderDimension}; encoding may fail. Lower ViewportResScale or disable MatchViewportResolution.`);
        }
        this.onMatchViewportResolutionCallback(scaledWidth, scaledHeight);
        this.lastTimeResized = (/* @__PURE__ */ new Date()).getTime();
      } else {
        Logger.Info("Resizing too often - skipping");
        clearTimeout(this.resizeTimeoutHandle);
        this.resizeTimeoutHandle = window.setTimeout(() => this.updateVideoStreamSize(), 100);
      }
    }
  };
  VideoPlayer.maxEncoderDimension = 4096;

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/UeInstanceMessage/StreamMessageController.js
  var StreamMessageController = class {
    constructor() {
      this.toStreamerHandlers = /* @__PURE__ */ new Map();
      this.fromStreamerHandlers = /* @__PURE__ */ new Map();
      this.toStreamerMessages = /* @__PURE__ */ new Map();
      this.fromStreamerMessages = /* @__PURE__ */ new Map();
    }
    /**
     * Populate the Default message protocol
     */
    populateDefaultProtocol() {
      this.toStreamerMessages.set("IFrameRequest", {
        id: 0,
        structure: []
      });
      this.toStreamerMessages.set("RequestQualityControl", {
        id: 1,
        structure: []
      });
      this.toStreamerMessages.set("FpsRequest", {
        id: 2,
        structure: []
      });
      this.toStreamerMessages.set("AverageBitrateRequest", {
        id: 3,
        structure: []
      });
      this.toStreamerMessages.set("StartStreaming", {
        id: 4,
        structure: []
      });
      this.toStreamerMessages.set("StopStreaming", {
        id: 5,
        structure: []
      });
      this.toStreamerMessages.set("LatencyTest", {
        id: 6,
        structure: ["string"]
      });
      this.toStreamerMessages.set("RequestInitialSettings", {
        id: 7,
        structure: []
      });
      this.toStreamerMessages.set("TestEcho", {
        id: 8,
        structure: []
      });
      this.toStreamerMessages.set("DataChannelLatencyTest", {
        id: 9,
        structure: []
      });
      this.toStreamerMessages.set("UIInteraction", {
        id: 50,
        structure: ["string"]
      });
      this.toStreamerMessages.set("Command", {
        id: 51,
        structure: ["string"]
      });
      this.toStreamerMessages.set("TextboxEntry", {
        id: 52,
        structure: ["string"]
      });
      this.toStreamerMessages.set("KeyDown", {
        id: 60,
        //            keyCode  isRepeat
        structure: ["uint8", "uint8"]
      });
      this.toStreamerMessages.set("KeyUp", {
        id: 61,
        //            keyCode
        structure: ["uint8"]
      });
      this.toStreamerMessages.set("KeyPress", {
        id: 62,
        //            charcode
        structure: ["uint16"]
      });
      this.toStreamerMessages.set("MouseEnter", {
        id: 70,
        structure: []
      });
      this.toStreamerMessages.set("MouseLeave", {
        id: 71,
        structure: []
      });
      this.toStreamerMessages.set("MouseDown", {
        id: 72,
        //              button     x         y
        structure: ["uint8", "uint16", "uint16"]
      });
      this.toStreamerMessages.set("MouseUp", {
        id: 73,
        //              button     x         y
        structure: ["uint8", "uint16", "uint16"]
      });
      this.toStreamerMessages.set("MouseMove", {
        id: 74,
        //              x           y      deltaX    deltaY
        structure: ["uint16", "uint16", "int16", "int16"]
      });
      this.toStreamerMessages.set("MouseWheel", {
        id: 75,
        //              delta       x        y
        structure: ["int16", "uint16", "uint16"]
      });
      this.toStreamerMessages.set("MouseDouble", {
        id: 76,
        //              button     x         y
        structure: ["uint8", "uint16", "uint16"]
      });
      this.toStreamerMessages.set("TouchStart", {
        id: 80,
        //          numtouches(1)   x       y        idx     force     valid
        structure: ["uint8", "uint16", "uint16", "uint8", "uint8", "uint8"]
      });
      this.toStreamerMessages.set("TouchEnd", {
        id: 81,
        //          numtouches(1)   x       y        idx     force     valid
        structure: ["uint8", "uint16", "uint16", "uint8", "uint8", "uint8"]
      });
      this.toStreamerMessages.set("TouchMove", {
        id: 82,
        //          numtouches(1)   x       y       idx      force     valid
        structure: ["uint8", "uint16", "uint16", "uint8", "uint8", "uint8"]
      });
      this.toStreamerMessages.set("GamepadConnected", {
        id: 93,
        structure: []
      });
      this.toStreamerMessages.set("GamepadButtonPressed", {
        id: 90,
        //         ctrlerId   button  isRepeat
        structure: ["uint8", "uint8", "uint8"]
      });
      this.toStreamerMessages.set("GamepadButtonReleased", {
        id: 91,
        //         ctrlerId   button  isRepeat(0)
        structure: ["uint8", "uint8", "uint8"]
      });
      this.toStreamerMessages.set("GamepadAnalog", {
        id: 92,
        //         ctrlerId   button  analogValue
        structure: ["uint8", "uint8", "double"]
      });
      this.toStreamerMessages.set("GamepadDisconnected", {
        id: 94,
        //          ctrlerId
        structure: ["uint8"]
      });
      this.fromStreamerMessages.set(0, "QualityControlOwnership");
      this.fromStreamerMessages.set(1, "Response");
      this.fromStreamerMessages.set(2, "Command");
      this.fromStreamerMessages.set(3, "FreezeFrame");
      this.fromStreamerMessages.set(4, "UnfreezeFrame");
      this.fromStreamerMessages.set(5, "VideoEncoderAvgQP");
      this.fromStreamerMessages.set(6, "LatencyTest");
      this.fromStreamerMessages.set(7, "InitialSettings");
      this.fromStreamerMessages.set(8, "FileExtension");
      this.fromStreamerMessages.set(9, "FileMimeType");
      this.fromStreamerMessages.set(10, "FileContents");
      this.fromStreamerMessages.set(11, "TestEcho");
      this.fromStreamerMessages.set(12, "InputControlOwnership");
      this.fromStreamerMessages.set(13, "GamepadResponse");
      this.fromStreamerMessages.set(14, "DataChannelLatencyTest");
      this.fromStreamerMessages.set(255, "Protocol");
    }
    /**
     * Register a message handler
     * @param messageDirection - the direction of the message; toStreamer or fromStreamer
     * @param messageType - the type of the message
     * @param messageHandler - the function or method to be executed when this handler is called
     */
    registerMessageHandler(messageDirection, messageType, messageHandler) {
      switch (messageDirection) {
        case MessageDirection.ToStreamer:
          this.toStreamerHandlers.set(messageType, messageHandler);
          break;
        case MessageDirection.FromStreamer:
          this.fromStreamerHandlers.set(messageType, messageHandler);
          break;
        default:
          Logger.Info(`Unknown message direction ${messageDirection}`);
      }
    }
  };
  var MessageDirection;
  (function(MessageDirection2) {
    MessageDirection2[MessageDirection2["ToStreamer"] = 0] = "ToStreamer";
    MessageDirection2[MessageDirection2["FromStreamer"] = 1] = "FromStreamer";
  })(MessageDirection || (MessageDirection = {}));

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/UeInstanceMessage/ResponseController.js
  var ResponseController = class {
    constructor() {
      this.responseEventListeners = /* @__PURE__ */ new Map();
    }
    /**
     * Add a response event listener to the response map
     * @param name - The name of the response
     * @param listener - The method to be activated when the response is selected
     */
    addResponseEventListener(name, listener) {
      this.responseEventListeners.set(name, listener);
    }
    /**
     * Remove a response event listener to the response map
     * @param name - The name of the response
     */
    removeResponseEventListener(name) {
      this.responseEventListeners.delete(name);
    }
    /**
     * Handle a response when receiving one form the streamer
     * @param message - Data received from the data channel with the command in question
     */
    onResponse(message) {
      Logger.Info("DataChannelReceiveMessageType.Response");
      const responses = new TextDecoder("utf-16").decode(message.slice(1));
      Logger.Info(responses);
      this.responseEventListeners.forEach((listener) => {
        listener(responses);
      });
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/UeInstanceMessage/SendMessageController.js
  var SendMessageController = class {
    /**
     * @param dataChannelSender - Data channel instance
     * @param toStreamerMessagesMapProvider - Stream Messages instance
     */
    constructor(dataChannelSender, toStreamerMessagesMapProvider) {
      this.dataChannelSender = dataChannelSender;
      this.toStreamerMessagesMapProvider = toStreamerMessagesMapProvider;
    }
    /**
     * Send a message to the streamer through the data channel
     * @param messageType - the type of message we are sending
     * @param messageData - the message data we are sending over the data channel
     * @returns - nil
     */
    sendMessageToStreamer(messageType, messageData) {
      if (messageData === void 0) {
        messageData = [];
      }
      const toStreamerMessages = this.toStreamerMessagesMapProvider.toStreamerMessages;
      const messageFormat = toStreamerMessages.get(messageType);
      if (messageFormat === void 0) {
        Logger.Error(`Attempted to send a message to the streamer with message type: ${messageType}, but the frontend hasn't been configured to send such a message. Check you've added the message type in your cpp`);
        return;
      }
      if (messageFormat.structure && messageData && messageFormat.structure.length !== messageData.length) {
        Logger.Error(`Provided message data doesn't match expected layout. Expected [ ${messageFormat.structure.map((element) => {
          switch (element) {
            case "uint8":
            case "uint16":
            case "int16":
            case "float":
            case "double":
            default:
              return "number";
            case "string":
              return "string";
          }
        }).toString()} ] but received [ ${messageData.map((element) => typeof element).toString()} ]`);
        return;
      }
      let byteLength = 0;
      messageData.forEach((element, idx) => {
        const type = messageFormat.structure[idx];
        switch (type) {
          case "uint8":
            byteLength += 1;
            break;
          case "uint16":
            byteLength += 2;
            break;
          case "int16":
            byteLength += 2;
            break;
          case "float":
            byteLength += 4;
            break;
          case "double":
            byteLength += 8;
            break;
          case "string":
            byteLength += 2;
            byteLength += 2 * element.length;
            break;
        }
      });
      const data = new DataView(new ArrayBuffer(byteLength + 1));
      data.setUint8(0, messageFormat.id);
      let byteOffset = 1;
      messageData.forEach((element, idx) => {
        const type = messageFormat.structure[idx];
        switch (type) {
          case "uint8":
            data.setUint8(byteOffset, element);
            byteOffset += 1;
            break;
          case "uint16":
            data.setUint16(byteOffset, element, true);
            byteOffset += 2;
            break;
          case "int16":
            data.setInt16(byteOffset, element, true);
            byteOffset += 2;
            break;
          case "float":
            data.setFloat32(byteOffset, element, true);
            byteOffset += 4;
            break;
          case "double":
            data.setFloat64(byteOffset, element, true);
            byteOffset += 8;
            break;
          case "string":
            data.setUint16(byteOffset, element.length, true);
            byteOffset += 2;
            for (let i = 0; i < element.length; i++) {
              data.setUint16(byteOffset, element.charCodeAt(i), true);
              byteOffset += 2;
            }
            break;
        }
      });
      if (!this.dataChannelSender.canSend()) {
        Logger.Info(`Data channel cannot send yet, skipping sending message: ${messageType} - ${new Uint8Array(data.buffer)}`);
        return;
      }
      this.dataChannelSender.sendData(data.buffer);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/UeInstanceMessage/ToStreamerMessagesController.js
  var ToStreamerMessagesController = class {
    /**
     * @param sendMessageController - Stream message controller instance
     */
    constructor(sendMessageController) {
      this.sendMessageController = sendMessageController;
    }
    /**
     * Send Request to Take Quality Control to the UE Instance
     */
    SendRequestQualityControl() {
      this.sendMessageController.sendMessageToStreamer("RequestQualityControl");
    }
    /**
     * Send Max FPS Request to the UE Instance
     */
    SendMaxFpsRequest() {
      this.sendMessageController.sendMessageToStreamer("FpsRequest");
    }
    /**
     * Send Average Bitrate Request to the UE Instance
     */
    SendAverageBitrateRequest() {
      this.sendMessageController.sendMessageToStreamer("AverageBitrateRequest");
    }
    /**
     * Send a Start Streaming Message to the UE Instance
     */
    SendStartStreaming() {
      this.sendMessageController.sendMessageToStreamer("StartStreaming");
    }
    /**
     * Send a Stop Streaming Message to the UE Instance
     */
    SendStopStreaming() {
      this.sendMessageController.sendMessageToStreamer("StopStreaming");
    }
    /**
     * Send a Request Initial Settings to the UE Instance
     */
    SendRequestInitialSettings() {
      this.sendMessageController.sendMessageToStreamer("RequestInitialSettings");
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/DataChannelSender.js
  var DataChannelSender = class {
    /**
     * @param dataChannelProvider - Data channel object type
     */
    constructor(dataChannelProvider) {
      this.dataChannelProvider = dataChannelProvider;
    }
    canSend() {
      return this.dataChannelProvider.getDataChannelInstance().dataChannel !== void 0 && this.dataChannelProvider.getDataChannelInstance().dataChannel.readyState === "open";
    }
    /**
     * Send Data over the Data channel to the UE Instance
     * @param data - Message Data Array Buffer
     */
    sendData(data) {
      const dataChannelInstance = this.dataChannelProvider.getDataChannelInstance();
      if (dataChannelInstance.dataChannel.readyState === "open") {
        dataChannelInstance.dataChannel.send(data);
        Logger.Info(`Message Sent: ${new Uint8Array(data)}`);
        this.resetAfkWarningTimerOnDataSend();
      } else {
        Logger.Error(`Message Failed: ${new Uint8Array(data)}`);
      }
    }
    /**
     * An override method for resetting the Afk warning timer when data is sent over the data channel
     */
    resetAfkWarningTimerOnDataSend() {
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/InputCoordTranslator.js
  var InputCoordTranslator = class {
    // we dont use a constructor here because the object is created and passed around to various locations
    // possibly before this method is called.
    reconfigure(playerSize, videoSize) {
      const playerAspectRatio = playerSize.height / playerSize.width;
      const videoAspectRatio = videoSize.height / videoSize.width;
      this.playerIsLarger = playerAspectRatio > videoAspectRatio;
      this.playerSize = playerSize;
      this.ratio = this.playerIsLarger ? playerAspectRatio / videoAspectRatio : videoAspectRatio / playerAspectRatio;
    }
    translateUnsigned(x, y) {
      const normalizedX = this.playerIsLarger ? x / this.playerSize.width : this.ratio * (x / this.playerSize.width - 0.5) + 0.5;
      const normalizedY = this.playerIsLarger ? this.ratio * (y / this.playerSize.height - 0.5) + 0.5 : y / this.playerSize.height;
      if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
        return { inRange: false, x: 65535, y: 65535 };
      } else {
        return { inRange: true, x: normalizedX * 65536, y: normalizedY * 65536 };
      }
    }
    translateSigned(x, y) {
      const normalizedX = this.playerIsLarger ? x / (0.5 * this.playerSize.width) : this.ratio * x / (0.5 * this.playerSize.width);
      const normalizedY = this.playerIsLarger ? this.ratio * y / (0.5 * this.playerSize.height) : y / (0.5 * this.playerSize.height);
      return { x: normalizedX * 32767, y: normalizedY * 32767 };
    }
    untranslateUnsigned(x, y) {
      const normalizedX = this.playerIsLarger ? x / 65536 : (x / 65536 - 0.5) / this.ratio + 0.5;
      const normalizedY = this.playerIsLarger ? (y / 65536 - 0.5) / this.ratio + 0.5 : y / 65536;
      return { x: normalizedX * this.playerSize.width, y: normalizedY * this.playerSize.height };
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Util/IURLSearchParams.js
  var IURLSearchParams = class {
    constructor(search) {
      this._urlParams = {};
      const urlParams = new URLSearchParams(search);
      for (const [name, value] of urlParams) {
        this._urlParams[name.toLowerCase()] = value;
      }
    }
    has(name) {
      return name.toLowerCase() in this._urlParams;
    }
    get(name) {
      if (this.has(name)) {
        return this._urlParams[name.toLowerCase()];
      }
      return null;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/WebRtcPlayer/WebRtcPlayerController.js
  var WebRtcPlayerController = class {
    /**
     *
     * @param config - the frontend config object
     * @param pixelStreaming - the PixelStreaming object
     */
    constructor(config2, pixelStreaming) {
      this.shouldShowPlayOverlay = true;
      this.autoJoinTimer = void 0;
      this.config = config2;
      this.pixelStreaming = pixelStreaming;
      this.responseController = new ResponseController();
      this.file = new FileTemplate();
      this.sdpConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };
      this.afkController = new AFKController(this.config, this.pixelStreaming, this.onAfkTriggered.bind(this));
      this.afkController.onAFKTimedOutCallback = () => {
        this.closeSignalingServer("You have been disconnected due to inactivity.", false);
      };
      this.freezeFrameController = new FreezeFrameController(this.pixelStreaming.videoElementParent);
      this.videoPlayer = new VideoPlayer(this.pixelStreaming.videoElementParent, this.config);
      this.videoPlayer.onVideoInitialized = () => this.handleVideoInitialized();
      this.videoPlayer.onMatchViewportResolutionCallback = (width, height) => {
        const descriptor = {
          "Resolution.Width": width,
          "Resolution.Height": height
        };
        this.streamMessageController.toStreamerHandlers.get("Command")([JSON.stringify(descriptor)]);
      };
      this.videoPlayer.onResizePlayerCallback = () => {
        this.setUpMouseAndFreezeFrame();
      };
      this.streamController = new StreamController(this.videoPlayer);
      this.coordinateConverter = new InputCoordTranslator();
      this.sendrecvDataChannelController = new DataChannelController();
      this.recvDataChannelController = new DataChannelController();
      this.registerDataChannelEventEmitters(this.sendrecvDataChannelController);
      this.registerDataChannelEventEmitters(this.recvDataChannelController);
      this.dataChannelSender = new DataChannelSender(this.sendrecvDataChannelController);
      this.dataChannelSender.resetAfkWarningTimerOnDataSend = () => this.afkController.resetAfkWarningTimer();
      this.streamMessageController = new StreamMessageController();
      this.transport = new WebSocketTransport(config2.webSocketProtocols);
      this.protocol = new SignallingProtocol(this.transport);
      this.protocol.addListener(signalling_messages_exports.config.typeName, (msg) => this.handleOnConfigMessage(msg));
      this.protocol.addListener(signalling_messages_exports.ping.typeName, (msg) => this.handlePingMessage(msg));
      this.protocol.addListener(signalling_messages_exports.streamerList.typeName, (msg) => this.handleStreamerListMessage(msg));
      this.protocol.addListener(signalling_messages_exports.subscribeFailed.typeName, (msg) => this.handleSubscribeFailedMessage(msg));
      this.protocol.addListener(signalling_messages_exports.streamerIdChanged.typeName, (msg) => this.handleStreamerIDChangedMessage(msg));
      this.protocol.addListener(signalling_messages_exports.playerCount.typeName, (msg) => {
        const playerCountMessage = msg;
        this.pixelStreaming._onPlayerCount(playerCountMessage.count);
      });
      this.protocol.addListener(signalling_messages_exports.answer.typeName, (msg) => this.handleWebRtcAnswer(msg));
      this.protocol.addListener(signalling_messages_exports.offer.typeName, (msg) => this.handleWebRtcOffer(msg));
      this.protocol.addListener(signalling_messages_exports.peerDataChannels.typeName, (msg) => this.handleWebRtcSFUPeerDatachannels(msg));
      this.protocol.addListener(signalling_messages_exports.iceCandidate.typeName, (msg) => {
        const iceCandidateMessage = msg;
        this.handleIceCandidate(iceCandidateMessage.candidate);
      });
      this.protocol.transport.addListener("open", () => {
        const message = message_helpers_exports.createMessage(signalling_messages_exports.listStreamers);
        this.protocol.sendMessage(message);
        this.reconnectAttempt = 0;
        this.isReconnecting = false;
      });
      this.protocol.transport.addListener("error", () => {
        Logger.Error(`Got a transport error.`);
      });
      this.protocol.transport.addListener("close", (event) => {
        const CODE_GOING_AWAY = 1001;
        const maxReconnectAttempts = this.config.getNumericSettingValue(NumericParameters.MaxReconnectAttempts);
        const attemptsLeft = this.reconnectAttempt < maxReconnectAttempts;
        const reconnectEnabled = this.forceReconnect || this.enableAutoReconnect && maxReconnectAttempts > 0 && attemptsLeft;
        const willTryReconnect = reconnectEnabled && event.code != CODE_GOING_AWAY;
        const allowClickToReconnect = !willTryReconnect;
        const disconnectMessage = this.disconnectMessage ? this.disconnectMessage : event.reason;
        this.forceReconnect = false;
        this.config.getSettingOption(OptionParameters.PreferredCodec).options = BrowserUtils.getSupportedVideoCodecs();
        this.pixelStreaming._onDisconnect(disconnectMessage, allowClickToReconnect);
        this.afkController.stopAfkWarningTimer();
        if (this.statsTimerHandle) {
          window.clearInterval(this.statsTimerHandle);
        }
        this.setVideoEncoderAvgQP(0);
        this.setTouchInputEnabled(false);
        this.setMouseInputEnabled(false);
        this.setKeyboardInputEnabled(false);
        this.setGamePadInputEnabled(false);
        if (willTryReconnect) {
          setTimeout(() => {
            this.reconnectAttempt++;
            this.doReconnect(event.reason);
          }, 2e3);
        }
      });
      this.sendMessageController = new SendMessageController(this.dataChannelSender, this.streamMessageController);
      this.toStreamerMessagesController = new ToStreamerMessagesController(this.sendMessageController);
      this.registerMessageHandlers();
      this.streamMessageController.populateDefaultProtocol();
      this.inputClassesFactory = new InputClassesFactory(this.streamMessageController, this.videoPlayer, this.coordinateConverter);
      this.isUsingSFU = false;
      this.isUsingSVC = false;
      this.isQualityController = false;
      this.preferredCodec = "";
      this.enableAutoReconnect = true;
      this.forceReconnect = false;
      this.reconnectAttempt = 0;
      this.isReconnecting = false;
      this.config._addOnOptionSettingChangedListener(OptionParameters.StreamerId, (streamerid) => {
        if (streamerid === void 0 || streamerid === "") {
          return;
        }
        this.peerConnectionController.peerConnection.close();
        this.peerConnectionController.createPeerConnection(this.peerConfig, this.preferredCodec);
        this.subscribedStream = streamerid;
        const message = message_helpers_exports.createMessage(signalling_messages_exports.subscribe, { streamerId: streamerid });
        this.protocol.sendMessage(message);
      });
      this.config._addOnOptionSettingChangedListener(OptionParameters.PreferredQuality, (preferredQuality) => {
        if (preferredQuality === void 0 || preferredQuality === "") {
          return;
        }
        let message;
        if (this.isUsingSVC) {
          message = message_helpers_exports.createMessage(signalling_messages_exports.layerPreference, {
            spatialLayer: +preferredQuality[1] - 1,
            temporalLayer: +preferredQuality[3] - 1
          });
        } else {
          const allQualities = this.config.getSettingOption(OptionParameters.PreferredQuality).options;
          const qualityIndex = allQualities.indexOf(preferredQuality);
          message = message_helpers_exports.createMessage(signalling_messages_exports.layerPreference, {
            spatialLayer: qualityIndex,
            temporalLayer: 0
          });
        }
        this.protocol.sendMessage(message);
      });
      this.setVideoEncoderAvgQP(-1);
      this.signallingUrlBuilder = () => {
        const signallingServerUrl = this.config.getTextSettingValue(TextParameters.SignallingServerUrl);
        return signallingServerUrl;
      };
    }
    /**
     * Destroys the video player and makes sure resources are freed. This helps to prevent the issue in chrome
     * where it refuses to make new video players.
     */
    destroyVideoPlayer() {
      this.videoPlayer.destroy();
    }
    /**
     * Handles when a message is received
     * @param event - Message Event
     */
    handleOnMessage(event) {
      const message = new Uint8Array(event.data);
      Logger.Info("Message incoming:" + message);
      const messageType = this.streamMessageController.fromStreamerMessages.get(message[0]);
      this.streamMessageController.fromStreamerHandlers.get(messageType)(event.data);
    }
    /**
     * Register message all handlers
     */
    registerMessageHandlers() {
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "QualityControlOwnership", (data) => this.onQualityControlOwnership(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "Response", (data) => this.responseController.onResponse(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "Command", (data) => {
        this.onCommand(data);
      });
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "FreezeFrame", (data) => this.onFreezeFrameMessage(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "UnfreezeFrame", () => this.invalidateFreezeFrameAndEnableVideo());
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "VideoEncoderAvgQP", (data) => this.handleVideoEncoderAvgQP(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "LatencyTest", (data) => this.handleLatencyTestResult(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "DataChannelLatencyTest", (data) => this.handleDataChannelLatencyTestResponse(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "InitialSettings", (data) => this.handleInitialSettings(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "FileExtension", (data) => this.onFileExtension(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "FileMimeType", (data) => this.onFileMimeType(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "FileContents", (data) => this.onFileContents(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "TestEcho", () => {
      });
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "InputControlOwnership", (data) => this.onInputControlOwnership(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "GamepadResponse", (data) => this.onGamepadResponse(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "Multiplexed", () => {
      });
      this.streamMessageController.registerMessageHandler(MessageDirection.FromStreamer, "Protocol", (data) => this.onProtocolMessage(data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "IFrameRequest", () => this.sendMessageController.sendMessageToStreamer("IFrameRequest"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "RequestQualityControl", () => this.sendMessageController.sendMessageToStreamer("RequestQualityControl"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "FpsRequest", () => this.sendMessageController.sendMessageToStreamer("FpsRequest"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "AverageBitrateRequest", () => this.sendMessageController.sendMessageToStreamer("AverageBitrateRequest"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "StartStreaming", () => this.sendMessageController.sendMessageToStreamer("StartStreaming"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "StopStreaming", () => this.sendMessageController.sendMessageToStreamer("StopStreaming"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "LatencyTest", (data) => this.sendMessageController.sendMessageToStreamer("LatencyTest", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "RequestInitialSettings", () => this.sendMessageController.sendMessageToStreamer("RequestInitialSettings"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "TestEcho", () => {
      });
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "UIInteraction", (data) => this.sendMessageController.sendMessageToStreamer("UIInteraction", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "Command", (data) => this.sendMessageController.sendMessageToStreamer("Command", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "TextboxEntry", (data) => this.sendMessageController.sendMessageToStreamer("TextboxEntry", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "KeyDown", (data) => this.sendMessageController.sendMessageToStreamer("KeyDown", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "KeyUp", (data) => this.sendMessageController.sendMessageToStreamer("KeyUp", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "KeyPress", (data) => this.sendMessageController.sendMessageToStreamer("KeyPress", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseEnter", (data) => this.sendMessageController.sendMessageToStreamer("MouseEnter", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseLeave", (data) => this.sendMessageController.sendMessageToStreamer("MouseLeave", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseDown", (data) => this.sendMessageController.sendMessageToStreamer("MouseDown", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseUp", (data) => this.sendMessageController.sendMessageToStreamer("MouseUp", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseMove", (data) => this.sendMessageController.sendMessageToStreamer("MouseMove", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseWheel", (data) => this.sendMessageController.sendMessageToStreamer("MouseWheel", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "MouseDouble", (data) => this.sendMessageController.sendMessageToStreamer("MouseDouble", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "TouchStart", (data) => this.sendMessageController.sendMessageToStreamer("TouchStart", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "TouchEnd", (data) => this.sendMessageController.sendMessageToStreamer("TouchEnd", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "TouchMove", (data) => this.sendMessageController.sendMessageToStreamer("TouchMove", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "GamepadConnected", () => this.sendMessageController.sendMessageToStreamer("GamepadConnected"));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "GamepadButtonPressed", (data) => this.sendMessageController.sendMessageToStreamer("GamepadButtonPressed", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "GamepadButtonReleased", (data) => this.sendMessageController.sendMessageToStreamer("GamepadButtonReleased", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "GamepadAnalog", (data) => this.sendMessageController.sendMessageToStreamer("GamepadAnalog", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "GamepadDisconnected", (data) => this.sendMessageController.sendMessageToStreamer("GamepadDisconnected", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XREyeViews", (data) => this.sendMessageController.sendMessageToStreamer("XREyeViews", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRHMDTransform", (data) => this.sendMessageController.sendMessageToStreamer("XRHMDTransform", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRControllerTransform", (data) => this.sendMessageController.sendMessageToStreamer("XRControllerTransform", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRSystem", (data) => this.sendMessageController.sendMessageToStreamer("XRSystem", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRButtonTouched", (data) => this.sendMessageController.sendMessageToStreamer("XRButtonTouched", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRButtonTouchReleased", (data) => this.sendMessageController.sendMessageToStreamer("XRButtonTouchReleased", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRButtonPressed", (data) => this.sendMessageController.sendMessageToStreamer("XRButtonPressed", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRButtonReleased", (data) => this.sendMessageController.sendMessageToStreamer("XRButtonReleased", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "XRAnalog", (data) => this.sendMessageController.sendMessageToStreamer("XRAnalog", data));
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "ChannelRelayStatus", () => {
      });
      this.streamMessageController.registerMessageHandler(MessageDirection.ToStreamer, "Multiplexed", () => {
      });
    }
    /**
     * Activate the logic associated with a command from UE
     * @param message
     */
    onCommand(message) {
      Logger.Info("DataChannelReceiveMessageType.Command");
      const commandAsString = new TextDecoder("utf-16").decode(message.slice(1));
      Logger.Info("Data Channel Command: " + commandAsString);
      const command = JSON.parse(commandAsString);
      if (command.command === "onScreenKeyboard") {
        this.handleOnScreenKeyboardCommand(command);
      }
    }
    handleOnScreenKeyboardCommand(command) {
      var _a, _b, _c, _d;
      const data = {
        showOnScreenKeyboard: (_a = command.showOnScreenKeyboard) !== null && _a !== void 0 ? _a : true,
        x: (_b = command.x) !== null && _b !== void 0 ? _b : 0,
        y: (_c = command.y) !== null && _c !== void 0 ? _c : 0,
        contents: (_d = command.contents) !== null && _d !== void 0 ? _d : ""
      };
      this.pixelStreaming.dispatchEvent(new ShowOnScreenKeyboardEvent(data));
    }
    /**
     * Handles a protocol message received from the streamer
     * @param message the message data from the streamer
     */
    onProtocolMessage(message) {
      try {
        const protocolString = new TextDecoder("utf-16").decode(message.slice(1));
        const protocolJSON = JSON.parse(protocolString);
        if (!Object.prototype.hasOwnProperty.call(protocolJSON, "Direction")) {
          Logger.Error("Malformed protocol received. Ensure the protocol message contains a direction");
        }
        const direction = protocolJSON.Direction;
        delete protocolJSON.Direction;
        Logger.Info(`Received new ${direction == MessageDirection.FromStreamer ? "FromStreamer" : "ToStreamer"} protocol. Updating existing protocol...`);
        Object.keys(protocolJSON).forEach((messageType) => {
          const message2 = protocolJSON[messageType];
          switch (direction) {
            case MessageDirection.ToStreamer:
              if (!Object.prototype.hasOwnProperty.call(message2, "id")) {
                Logger.Error(`ToStreamer->${messageType} protocol definition was malformed as it didn't contain at least an id

                                           Definition was: ${JSON.stringify(message2, null, 2)}`);
                return;
              }
              if (messageType === "UIInteraction" || messageType === "Command" || messageType === "LatencyTest") {
                return;
              }
              if (this.streamMessageController.toStreamerHandlers.get(messageType)) {
                this.streamMessageController.toStreamerMessages.set(messageType, message2);
              } else {
                Logger.Error(`There was no registered handler for "${messageType}" - try adding one using registerMessageHandler(MessageDirection.ToStreamer, "${messageType}", myHandler)`);
              }
              break;
            case MessageDirection.FromStreamer:
              if (!Object.prototype.hasOwnProperty.call(message2, "id")) {
                Logger.Error(`FromStreamer->${messageType} protocol definition was malformed as it didn't contain at least an id

                            Definition was: ${JSON.stringify(message2, null, 2)}`);
                return;
              }
              if (this.streamMessageController.fromStreamerHandlers.get(messageType)) {
                this.streamMessageController.fromStreamerMessages.set(message2.id, messageType);
              } else {
                Logger.Error(`There was no registered handler for "${message2}" - try adding one using registerMessageHandler(MessageDirection.FromStreamer, "${messageType}", myHandler)`);
              }
              break;
            default:
              Logger.Error(`Unknown direction: ${direction}`);
          }
        });
        this.toStreamerMessagesController.SendRequestInitialSettings();
        this.toStreamerMessagesController.SendRequestQualityControl();
      } catch (e) {
        Logger.Info(e);
      }
    }
    /**
     * Handles an input control message when it is received from the streamer
     * @param message The input control message
     */
    onInputControlOwnership(message) {
      const view = new Uint8Array(message);
      Logger.Info("DataChannelReceiveMessageType.InputControlOwnership");
      const inputControlOwnership = new Boolean(view[1]).valueOf();
      Logger.Info(`Received input controller message - will your input control the stream: ${inputControlOwnership}`);
      this.pixelStreaming._onInputControlOwnership(inputControlOwnership);
    }
    /**
     *
     * @param message
     */
    onGamepadResponse(message) {
      const responseString = new TextDecoder("utf-16").decode(message.slice(1));
      const responseJSON = JSON.parse(responseString);
      this.gamePadController.onGamepadResponseReceived(responseJSON.controllerId);
    }
    onAfkTriggered() {
      this.afkController.onAfkClick();
      if (this.videoPlayer.isPaused() && this.videoPlayer.hasVideoSource()) {
        this.playStream();
      }
    }
    /**
     * Set whether we should timeout when afk.
     * @param afkEnabled If true we timeout when idle for some given amount of time.
     */
    setAfkEnabled(afkEnabled) {
      if (afkEnabled) {
        this.onAfkTriggered();
      } else {
        this.afkController.stopAfkWarningTimer();
      }
    }
    /**
     * Attempt a reconnection to the signalling server. Manual trigger
     */
    tryReconnect(message) {
      this.forceReconnect = true;
      this.doReconnect(message);
    }
    /**
     * Does the actual reconnect work. Used by the auto reconnect feature to skip the manual flag.
     */
    doReconnect(message) {
      if (!this.protocol) {
        Logger.Info("This player has no protocol connection.");
        return;
      }
      this.isReconnecting = true;
      if (this.protocol.isConnected()) {
        if (!this.forceReconnect) {
          this.disconnectMessage = `${message} Reconnecting.`;
        }
        this.closeSignalingServer(message, true);
      } else {
        this.pixelStreaming._onWebRtcAutoConnect();
        this.connectToSignallingServer();
      }
    }
    /**
     * Loads a freeze frame if it is required otherwise shows the play overlay
     */
    loadFreezeFrameOrShowPlayOverlay() {
      this.pixelStreaming.dispatchEvent(new LoadFreezeFrameEvent({
        shouldShowPlayOverlay: this.shouldShowPlayOverlay,
        isValid: this.freezeFrameController.valid,
        jpegData: this.freezeFrameController.jpeg
      }));
      if (this.shouldShowPlayOverlay === true) {
        Logger.Info("showing play overlay");
        this.resizePlayerStyle();
      } else {
        Logger.Info("showing freeze frame");
        this.freezeFrameController.showFreezeFrame();
      }
      setTimeout(() => {
        this.videoPlayer.setVideoEnabled(false);
      }, this.freezeFrameController.freezeFrameDelay);
    }
    /**
     * Process the freeze frame and load it
     * @param message The freeze frame data in bytes
     */
    onFreezeFrameMessage(message) {
      Logger.Info("DataChannelReceiveMessageType.FreezeFrame");
      const view = new Uint8Array(message);
      this.freezeFrameController.processFreezeFrameMessage(view, () => this.loadFreezeFrameOrShowPlayOverlay());
    }
    /**
     * Enable the video after hiding a freeze frame
     */
    invalidateFreezeFrameAndEnableVideo() {
      Logger.Info("DataChannelReceiveMessageType.FreezeFrame");
      setTimeout(() => {
        this.pixelStreaming.dispatchEvent(new HideFreezeFrameEvent());
        this.freezeFrameController.hideFreezeFrame();
      }, this.freezeFrameController.freezeFrameDelay);
      if (this.videoPlayer.getVideoElement()) {
        this.videoPlayer.setVideoEnabled(true);
      }
    }
    /**
     * Prep datachannel data for processing file extension
     * @param data the file extension data
     */
    onFileExtension(data) {
      const view = new Uint8Array(data);
      FileUtil.setExtensionFromBytes(view, this.file);
    }
    /**
     * Prep datachannel data for processing the file mime type
     * @param data the file mime type data
     */
    onFileMimeType(data) {
      const view = new Uint8Array(data);
      FileUtil.setMimeTypeFromBytes(view, this.file);
    }
    /**
     * Prep datachannel data for processing the file contents
     * @param data the file contents data
     */
    onFileContents(data) {
      const view = new Uint8Array(data);
      FileUtil.setContentsFromBytes(view, this.file);
    }
    /**
     * Plays the stream audio and video source and sets up other pieces while the stream starts
     */
    playStream() {
      if (!this.videoPlayer.getVideoElement()) {
        const message = "Could not play video stream because the video player was not initialized correctly.";
        this.pixelStreaming.dispatchEvent(new PlayStreamErrorEvent({ message }));
        Logger.Error(message);
        this.closeSignalingServer("Stream not initialized correctly", false);
        return;
      }
      if (!this.videoPlayer.hasVideoSource()) {
        Logger.Warning("Cannot play stream, the video element has no srcObject to play.");
        return;
      }
      this.setTouchInputEnabled(this.config.isFlagEnabled(Flags.TouchInput));
      this.pixelStreaming.dispatchEvent(new PlayStreamEvent());
      if (this.streamController.audioElement.srcObject) {
        const startMuted = this.config.isFlagEnabled(Flags.StartVideoMuted);
        this.streamController.audioElement.muted = startMuted;
        if (startMuted) {
          this.playVideo();
        } else {
          this.streamController.audioElement.play().then(() => {
            this.playVideo();
          }).catch((onRejectedReason) => {
            Logger.Info(onRejectedReason);
            Logger.Info("Browser does not support autoplaying video without interaction - to resolve this we are going to show the play button overlay.");
            this.pixelStreaming.dispatchEvent(new PlayStreamRejectedEvent({
              reason: onRejectedReason
            }));
          });
        }
      } else {
        this.playVideo();
      }
      this.shouldShowPlayOverlay = false;
      this.freezeFrameController.showFreezeFrame();
    }
    /**
     * Plays the video stream
     */
    playVideo() {
      this.videoPlayer.play().catch((onRejectedReason) => {
        if (this.streamController.audioElement.srcObject) {
          this.streamController.audioElement.pause();
        }
        Logger.Info(onRejectedReason);
        Logger.Info("Browser does not support autoplaying video without interaction - to resolve this we are going to show the play button overlay.");
        this.pixelStreaming.dispatchEvent(new PlayStreamRejectedEvent({ reason: onRejectedReason }));
      });
    }
    /**
     * Enable the video to play automatically if enableAutoplay is true
     */
    autoPlayVideoOrSetUpPlayOverlay() {
      if (this.config.isFlagEnabled(Flags.AutoPlayVideo)) {
        this.playStream();
      }
      this.resizePlayerStyle();
    }
    /**
     * Connect to the Signaling server
     */
    connectToSignallingServer() {
      this.locallyClosed = false;
      this.enableAutoReconnect = true;
      this.disconnectMessage = null;
      const signallingUrl = this.signallingUrlBuilder();
      this.protocol.connect(signallingUrl);
      const keepaliveDelay = this.config.getNumericSettingValue(NumericParameters.KeepaliveDelay);
      if (keepaliveDelay > 0) {
        this.keepalive = new KeepaliveMonitor(this.protocol, keepaliveDelay);
        this.keepalive.onTimeout = () => {
          Logger.Error(`Protocol timeout`);
          this.protocol.disconnect();
        };
      }
    }
    /**
     * This will start the handshake to the signalling server
     * @param peerConfig  - RTC Configuration Options from the Signaling server
     * @remark RTC Peer Connection on Ice Candidate event have it handled by handle Send Ice Candidate
     */
    startSession(peerConfig) {
      this.peerConfig = peerConfig;
      if (this.config.isFlagEnabled(Flags.ForceTURN)) {
        const hasTurnServer = this.checkTurnServerAvailability(peerConfig);
        if (!hasTurnServer) {
          Logger.Info("No turn server was found in the Peer Connection Options. TURN cannot be forced, closing connection. Please use STUN instead");
          this.closeSignalingServer("TURN cannot be forced, closing connection. Please use STUN instead.", false);
          return;
        }
      }
      this.peerConnectionController = new PeerConnectionController(this.peerConfig, this.config, this.preferredCodec);
      this.peerConnectionController.onVideoStats = (event) => {
        this.handleVideoStats(event);
      };
      this.peerConnectionController.onLatencyCalculated = (latencyInfo) => {
        this.pixelStreaming._onLatencyCalculated(latencyInfo);
      };
      this.peerConnectionController.onSendWebRTCOffer = (offer2) => {
        this.handleSendWebRTCOffer(offer2);
      };
      this.peerConnectionController.onSetLocalDescription = (answer2) => {
        this.handleSendWebRTCAnswer(answer2);
      };
      this.peerConnectionController.onSetRemoteDescription = (offer2) => {
        this.pixelStreaming._onWebRtcSdpOffer(offer2);
      };
      this.peerConnectionController.onPeerIceCandidate = (peerConnectionIceEvent) => this.handleSendIceCandidate(peerConnectionIceEvent);
      this.peerConnectionController.onDataChannel = (datachannelEvent) => this.handleDataChannel(datachannelEvent);
      this.peerConnectionController.showTextOverlayConnecting = () => this.pixelStreaming._onWebRtcConnecting();
      this.peerConnectionController.showTextOverlaySetupFailure = () => this.pixelStreaming._onWebRtcFailed();
      let webRtcConnectedSent = false;
      this.peerConnectionController.onIceConnectionStateChange = () => {
        if (!webRtcConnectedSent && ["connected", "completed"].includes(this.peerConnectionController.peerConnection.iceConnectionState)) {
          this.pixelStreaming._onWebRtcConnected();
          webRtcConnectedSent = true;
        }
      };
      this.peerConnectionController.onTrack = (trackEvent) => this.streamController.handleOnTrack(trackEvent);
    }
    /**
     * Checks the peer connection options for a turn server and returns true or false
     */
    checkTurnServerAvailability(options) {
      if (!options.iceServers) {
        Logger.Info("A turn sever was not found");
        return false;
      }
      for (const iceServer of options.iceServers) {
        for (const url of iceServer.urls) {
          if (url.includes("turn")) {
            Logger.Info(`A turn sever was found at ${url}`);
            return true;
          }
        }
      }
      Logger.Info("A turn sever was not found");
      return false;
    }
    /**
     * Handles when a Config Message is received contains the Peer Connection Options required (STUN and TURN Server Info)
     * @param messageConfig - Config Message received from the signaling server
     */
    handleOnConfigMessage(messageConfig) {
      this.resizePlayerStyle();
      this.startSession(messageConfig.peerConnectionOptions);
    }
    handlePingMessage(pingMessage) {
      this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.pong, { time: pingMessage.time }));
    }
    /**
     * Handles when the signalling server gives us the list of streamer ids.
     */
    handleStreamerListMessage(messageStreamerList) {
      Logger.Info(`Got streamer list ${messageStreamerList.ids}`);
      let wantedStreamerId = "";
      const streamerIDOption = this.config.getSettingOption(OptionParameters.StreamerId);
      const existingSelection = streamerIDOption.selected.toString().trim();
      if (existingSelection) {
        wantedStreamerId = streamerIDOption.selected;
      }
      const settingOptions = [...messageStreamerList.ids];
      settingOptions.unshift("");
      this.config.setOptionSettingOptions(OptionParameters.StreamerId, settingOptions);
      let autoSelectedStreamerId = "";
      const waitForStreamer = this.config.isFlagEnabled(Flags.WaitForStreamer);
      const reconnectLimit = this.config.getNumericSettingValue(NumericParameters.MaxReconnectAttempts);
      const reconnectDelay = this.config.getNumericSettingValue(NumericParameters.StreamerAutoJoinInterval);
      const useUrlParams = this.config.useUrlParams;
      const urlParams = new IURLSearchParams(window.location.search);
      if (useUrlParams && urlParams.has(OptionParameters.StreamerId)) {
        wantedStreamerId = urlParams.get(OptionParameters.StreamerId);
      } else if (this.subscribedStream) {
        wantedStreamerId = this.subscribedStream;
      }
      if (wantedStreamerId && messageStreamerList.ids.includes(wantedStreamerId)) {
        autoSelectedStreamerId = wantedStreamerId;
      } else if ((!wantedStreamerId || !waitForStreamer) && messageStreamerList.ids.length == 1) {
        autoSelectedStreamerId = messageStreamerList.ids[0];
      }
      if (autoSelectedStreamerId) {
        this.reconnectAttempt = 0;
        this.isReconnecting = false;
        this.config.setOptionSettingValue(OptionParameters.StreamerId, autoSelectedStreamerId);
      } else {
        if (waitForStreamer) {
          if (this.reconnectAttempt < reconnectLimit) {
            this.reconnectAttempt++;
            this.isReconnecting = true;
            setTimeout(() => {
              this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.listStreamers));
            }, reconnectDelay);
          } else {
            this.reconnectAttempt = 0;
            this.isReconnecting = false;
            this.enableAutoReconnect = false;
          }
        }
      }
      this.pixelStreaming.dispatchEvent(new StreamerListMessageEvent({
        messageStreamerList,
        autoSelectedStreamerId,
        wantedStreamerId
      }));
    }
    handleSubscribeFailedMessage(subscribeFailedMessage) {
      this.reconnectAttempt = 0;
      this.isReconnecting = false;
      this.enableAutoReconnect = false;
      this.pixelStreaming._onSubscribeFailed(subscribeFailedMessage.message);
    }
    handleStreamerIDChangedMessage(streamerIDChangedMessage) {
      const newID = streamerIDChangedMessage.newID;
      const streamerListOptions = this.config.getSettingOption(OptionParameters.StreamerId);
      const oldOnChange = streamerListOptions.onChange;
      streamerListOptions.onChange = () => {
      };
      const streamerList2 = streamerListOptions.options;
      for (let i = 0; i < streamerList2.length; ++i) {
        if (streamerList2[i] == this.subscribedStream) {
          streamerList2[i] = newID;
          break;
        }
      }
      streamerListOptions.options = streamerList2;
      streamerListOptions.selected = newID;
      streamerListOptions.onChange = oldOnChange;
      this.subscribedStream = streamerIDChangedMessage.newID;
      this.pixelStreaming.dispatchEvent(new StreamerIDChangedMessageEvent({
        newID
      }));
    }
    /**
     * Handle the RTC Answer from the signaling server
     * @param Answer - Answer SDP from the peer.
     */
    handleWebRtcAnswer(Answer) {
      Logger.Info(`Got answer sdp ${Answer.sdp}`);
      const sdpAnswer = {
        sdp: Answer.sdp,
        type: "answer"
      };
      this.peerConnectionController.receiveAnswer(sdpAnswer);
      this.handlePostWebrtcNegotiation();
    }
    /**
     * Handle the RTC offer from a WebRTC peer (received through the signalling server).
     * @param Offer - Offer SDP from the peer.
     */
    handleWebRtcOffer(Offer) {
      Logger.Info(`Got offer sdp ${Offer.sdp}`);
      this.isUsingSFU = Offer.sfu ? Offer.sfu : false;
      this.isUsingSVC = Offer.scalabilityMode ? Offer.scalabilityMode != "L1T1" : false;
      if (this.isUsingSFU || this.isUsingSVC) {
        this.peerConnectionController.preferredCodec = "";
      }
      const scalabilityMode = Offer.scalabilityMode ? Offer.scalabilityMode : "L1T1";
      let availableQualities = ["Default"];
      if (this.isUsingSFU) {
        if (!this.isUsingSVC) {
          availableQualities = ["Low", "Medium", "High"];
        } else {
          availableQualities = [];
          const maxSpatialLayers = +scalabilityMode[1];
          const maxTemporalLayers = +scalabilityMode[3];
          for (let s = 1; s <= maxSpatialLayers; s++) {
            for (let t = 1; t <= maxTemporalLayers; t++) {
              availableQualities.push(`S${s}T${t}`);
            }
          }
        }
      }
      this.config.setOptionSettingOptions(OptionParameters.PreferredQuality, availableQualities);
      this.config.setOptionSettingValue(OptionParameters.PreferredQuality, availableQualities.slice(-1)[0]);
      const sdpOffer = {
        sdp: Offer.sdp,
        type: "offer"
      };
      this.peerConnectionController.receiveOffer(sdpOffer, this.config);
      this.handlePostWebrtcNegotiation();
    }
    /**
     * Handle when the SFU provides the peer with its data channels
     * @param DataChannels - The message from the SFU containing the data channels ids
     */
    handleWebRtcSFUPeerDatachannels(DataChannels) {
      const SendOptions = {
        ordered: true,
        negotiated: true,
        id: DataChannels.sendStreamId
      };
      const unidirectional = DataChannels.sendStreamId != DataChannels.recvStreamId;
      this.sendrecvDataChannelController.createDataChannel(this.peerConnectionController.peerConnection, unidirectional ? "send-datachannel" : "datachannel", SendOptions);
      if (unidirectional) {
        const RecvOptions = {
          ordered: true,
          negotiated: true,
          id: DataChannels.recvStreamId
        };
        this.recvDataChannelController.createDataChannel(this.peerConnectionController.peerConnection, "recv-datachannel", RecvOptions);
        this.recvDataChannelController.handleOnOpen = () => this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.peerDataChannelsReady));
        this.recvDataChannelController.handleOnMessage = (ev) => this.handleOnMessage(ev);
      } else {
        this.sendrecvDataChannelController.handleOnMessage = (ev) => this.handleOnMessage(ev);
      }
    }
    handlePostWebrtcNegotiation() {
      this.afkController.startAfkWarningTimer();
      this.pixelStreaming._onWebRtcSdp();
      if (this.statsTimerHandle && this.statsTimerHandle !== void 0) {
        window.clearInterval(this.statsTimerHandle);
      }
      this.statsTimerHandle = window.setInterval(() => this.getStats(), 1e3);
      this.setMouseInputEnabled(this.config.isFlagEnabled(Flags.MouseInput));
      this.setKeyboardInputEnabled(this.config.isFlagEnabled(Flags.KeyboardInput));
      this.setGamePadInputEnabled(this.config.isFlagEnabled(Flags.GamepadInput));
    }
    /**
     * When an ice Candidate is received from the Signaling server add it to the Peer Connection Client
     * @param iceCandidate - Ice Candidate from Server
     */
    handleIceCandidate(iceCandidate2) {
      Logger.Info("Web RTC Controller: onWebRtcIce");
      const candidate = new RTCIceCandidate(iceCandidate2);
      this.peerConnectionController.handleOnIce(candidate);
    }
    /**
     * Send the ice Candidate to the signaling server via websocket
     * @param iceEvent - RTC Peer ConnectionIceEvent) {
     */
    handleSendIceCandidate(iceEvent) {
      Logger.Info("OnIceCandidate");
      if (iceEvent.candidate && iceEvent.candidate.candidate) {
        this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.iceCandidate, { candidate: iceEvent.candidate }));
      }
    }
    /**
     * Send the ice Candidate to the signaling server via websocket
     * @param iceEvent - RTC Peer ConnectionIceEvent) {
     */
    handleDataChannel(datachannelEvent) {
      Logger.Info("Data channel created for us by browser as we are a receiving peer.");
      this.sendrecvDataChannelController.dataChannel = datachannelEvent.channel;
      this.sendrecvDataChannelController.setupDataChannel();
      this.sendrecvDataChannelController.handleOnMessage = (ev) => this.handleOnMessage(ev);
    }
    /**
     * Send the RTC Offer Session to the Signaling server via websocket
     * @param offer - RTC Session Description
     */
    handleSendWebRTCOffer(offer2) {
      Logger.Info("Sending the offer to the Server");
      const extraParams = {
        sdp: offer2.sdp,
        minBitrateBps: 1e3 * this.config.getNumericSettingValue(NumericParameters.WebRTCMinBitrate),
        maxBitrateBps: 1e3 * this.config.getNumericSettingValue(NumericParameters.WebRTCMaxBitrate)
      };
      this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.offer, extraParams));
    }
    /**
     * Send the RTC Offer Session to the Signaling server via websocket
     * @param answer - RTC Session Description
     */
    handleSendWebRTCAnswer(answer2) {
      Logger.Info("Sending the answer to the Server");
      const extraParams = {
        sdp: answer2.sdp,
        minBitrateBps: 1e3 * this.config.getNumericSettingValue(NumericParameters.WebRTCMinBitrate),
        maxBitrateBps: 1e3 * this.config.getNumericSettingValue(NumericParameters.WebRTCMaxBitrate)
      };
      this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.answer, extraParams));
      if (this.isUsingSFU) {
        this.protocol.sendMessage(message_helpers_exports.createMessage(signalling_messages_exports.dataChannelRequest));
      }
      this.pixelStreaming._onWebRtcSdpAnswer(answer2);
    }
    /**
     * Set the freeze frame overlay to the player div
     */
    setUpMouseAndFreezeFrame() {
      const playerElement = this.videoPlayer.getVideoParentElement();
      const videoElement = this.videoPlayer.getVideoElement();
      this.coordinateConverter.reconfigure({ width: playerElement.clientWidth, height: playerElement.clientHeight }, { width: videoElement.videoWidth, height: videoElement.videoHeight });
      this.freezeFrameController.freezeFrame.resize();
    }
    /**
     * Close the Connection to the signaling server
     */
    closeSignalingServer(message, allowReconnect) {
      var _a;
      this.locallyClosed = true;
      this.enableAutoReconnect = allowReconnect;
      this.disconnectMessage = message;
      (_a = this.protocol) === null || _a === void 0 ? void 0 : _a.disconnect(1e3, message);
    }
    /**
     * Close the peer connection
     */
    closePeerConnection() {
      var _a;
      (_a = this.peerConnectionController) === null || _a === void 0 ? void 0 : _a.close();
    }
    /**
     * Close all connections
     */
    close() {
      this.closeSignalingServer("", false);
      this.closePeerConnection();
    }
    /**
     * Fires a Video Stats Event in the RTC Peer Connection
     */
    getStats() {
      this.peerConnectionController.generateStats();
    }
    /**
     * Send a Latency Test Request to the UE Instance
     */
    sendLatencyTest() {
      this.latencyStartTime = Date.now();
      this.streamMessageController.toStreamerHandlers.get("LatencyTest")([
        JSON.stringify({
          StartTime: this.latencyStartTime
        })
      ]);
    }
    /**
     * Send a Data Channel Latency Test Request to the UE Instance
     */
    sendDataChannelLatencyTest(descriptor) {
      this.streamMessageController.toStreamerHandlers.get("DataChannelLatencyTest")([
        JSON.stringify(descriptor)
      ]);
    }
    /**
     * Send the MinQP encoder setting to the UE Instance.
     * @param minQP - The lower bound for QP when encoding
     * valid values are (1-51) where:
     * 1 = Best quality but highest bitrate.
     * 51 = Worst quality but lowest bitrate.
     * By default the minQP is 1 meaning the encoder is free
     * to aim for the best quality it can on the given network link.
     */
    sendEncoderMinQP(minQP) {
      Logger.Info(`MinQP=${minQP}
`);
      if (minQP != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "Encoder.MinQP": minQP
          })
        ]);
      }
    }
    /**
     * Send the MaxQP encoder setting to the UE Instance.
     * @param maxQP - The upper bound for QP when encoding
     * valid values are (1-51) where:
     * 1 = Best quality but highest bitrate.
     * 51 = Worst quality but lowest bitrate.
     * By default the maxQP is 51 meaning the encoder is free
     * to drop quality as low as needed on the given network link.
     */
    sendEncoderMaxQP(maxQP) {
      Logger.Info(`MaxQP=${maxQP}
`);
      if (maxQP != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "Encoder.MaxQP": maxQP
          })
        ]);
      }
    }
    /**
     * Send the MinQuality encoder setting to the UE Instance.
     * @param minQuality - The lower bound for quality when encoding
     * valid values are (0-100) where:
     * 0 = Worst quality.
     * 100 = Best quality.
     */
    sendEncoderMinQuality(minQuality) {
      Logger.Info(`MinQuality=${minQuality}
`);
      if (minQuality != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "Encoder.MinQuality": minQuality
          })
        ]);
      }
    }
    /**
     * Send the MaxQuality encoder setting to the UE Instance.
     * @param maxQuality - The upper bound for quality when encoding
     * valid values are (0-100) where:
     * 0 = Worst quality.
     * 100 = Best quality.
     */
    sendEncoderMaxQuality(maxQuality) {
      Logger.Info(`MaxQuality=${maxQuality}
`);
      if (maxQuality != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "Encoder.MaxQuality": maxQuality
          })
        ]);
      }
    }
    /**
     * Send the { WebRTC.MinBitrate: SomeNumber }} command to UE to set
     * the minimum bitrate that we allow WebRTC to use
     * (note setting this too high in poor networks can be problematic).
     * @param minBitrate - The minimum bitrate we would like WebRTC to not fall below.
     */
    sendWebRTCMinBitrate(minBitrate) {
      Logger.Info(`WebRTC Min Bitrate=${minBitrate}`);
      if (minBitrate != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "WebRTC.MinBitrate": minBitrate
          })
        ]);
      }
    }
    /**
     * Send the { WebRTC.MaxBitrate: SomeNumber }} command to UE to set
     * the minimum bitrate that we allow WebRTC to use
     * (note setting this too low could result in blocky video).
     * @param minBitrate - The minimum bitrate we would like WebRTC to not fall below.
     */
    sendWebRTCMaxBitrate(maxBitrate) {
      Logger.Info(`WebRTC Max Bitrate=${maxBitrate}`);
      if (maxBitrate != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({
            "WebRTC.MaxBitrate": maxBitrate
          })
        ]);
      }
    }
    /**
     * Send the { WebRTC.Fps: SomeNumber }} UE 5.0+
     * and { WebRTC.MaxFps } UE 4.27 command to set
     * the maximum fps we would like WebRTC to stream at.
     * @param fps - The maximum stream fps.
     */
    sendWebRTCFps(fps) {
      Logger.Info(`WebRTC FPS=${fps}`);
      if (fps != null) {
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({ "WebRTC.Fps": fps })
        ]);
        this.streamMessageController.toStreamerHandlers.get("Command")([
          JSON.stringify({ "WebRTC.MaxFps": fps })
        ]);
      }
    }
    /**
     * Sends the UI Descriptor `stat fps` to the UE Instance
     */
    sendShowFps() {
      Logger.Info("----   Sending show stat to UE   ----");
      this.streamMessageController.toStreamerHandlers.get("Command")([JSON.stringify({ "stat.fps": "" })]);
    }
    /**
     * Send an Iframe request to the streamer
     */
    sendIframeRequest() {
      Logger.Info("----   Sending Request for an IFrame  ----");
      this.streamMessageController.toStreamerHandlers.get("IFrameRequest")();
    }
    /**
     * Send a UIInteraction message
     */
    emitUIInteraction(descriptor) {
      Logger.Info("----   Sending custom UIInteraction message   ----");
      this.streamMessageController.toStreamerHandlers.get("UIInteraction")([JSON.stringify(descriptor)]);
    }
    /**
     * Send a Command message
     */
    emitCommand(descriptor) {
      Logger.Info("----   Sending custom Command message   ----");
      this.streamMessageController.toStreamerHandlers.get("Command")([JSON.stringify(descriptor)]);
    }
    /**
     * Send a console command message
     */
    emitConsoleCommand(command) {
      Logger.Info("----   Sending custom Command:ConsoleCommand message   ----");
      this.streamMessageController.toStreamerHandlers.get("Command")([
        JSON.stringify({
          ConsoleCommand: command
        })
      ]);
    }
    /**
     * Sends a request to the UE Instance to have ownership of Quality
     */
    sendRequestQualityControlOwnership() {
      Logger.Info("----   Sending Request to Control Quality  ----");
      this.toStreamerMessagesController.SendRequestQualityControl();
    }
    /**
     * Send a `TextBoxEntry` message back to UE.
     * @param contents The new contents of the UE side text box.
     */
    sendTextboxEntry(contents) {
      var _a;
      Logger.Info("----   Sending TextboxEntry message  ----");
      (_a = this.streamMessageController.toStreamerHandlers.get("TextboxEntry")) === null || _a === void 0 ? void 0 : _a([contents]);
    }
    /**
     * Handles when a Latency Test Result are received from the UE Instance
     * @param message - Latency Test Timings
     */
    handleLatencyTestResult(message) {
      Logger.Info("DataChannelReceiveMessageType.latencyTest");
      const latencyAsString = new TextDecoder("utf-16").decode(message.slice(1));
      const latencyTestResults = new LatencyTestResults();
      Object.assign(latencyTestResults, JSON.parse(latencyAsString));
      latencyTestResults.processFields();
      latencyTestResults.testStartTimeMs = this.latencyStartTime;
      latencyTestResults.browserReceiptTimeMs = Date.now();
      latencyTestResults.latencyExcludingDecode = ~~(latencyTestResults.browserReceiptTimeMs - latencyTestResults.testStartTimeMs);
      latencyTestResults.testDuration = ~~(latencyTestResults.TransmissionTimeMs - latencyTestResults.ReceiptTimeMs);
      latencyTestResults.networkLatency = ~~(latencyTestResults.latencyExcludingDecode - latencyTestResults.testDuration);
      if (latencyTestResults.frameDisplayDeltaTimeMs && latencyTestResults.browserReceiptTimeMs) {
        latencyTestResults.endToEndLatency = ~~(latencyTestResults.frameDisplayDeltaTimeMs + latencyTestResults.networkLatency, +latencyTestResults.CaptureToSendMs);
      }
      this.pixelStreaming._onLatencyTestResult(latencyTestResults);
    }
    /**
     * Handles when a Data Channel Latency Test Response is received from the UE Instance
     * @param message - Data Channel Latency Test Response
     */
    handleDataChannelLatencyTestResponse(message) {
      Logger.Info("DataChannelReceiveMessageType.dataChannelLatencyResponse");
      const responseAsString = new TextDecoder("utf-16").decode(message.slice(1));
      const latencyTestResponse = JSON.parse(responseAsString);
      this.pixelStreaming._onDataChannelLatencyTestResponse(latencyTestResponse);
    }
    /**
     * Handles when the Encoder and Web RTC Settings are received from the UE Instance
     * @param message - Initial Encoder and Web RTC Settings
     */
    handleInitialSettings(message) {
      Logger.Info("DataChannelReceiveMessageType.InitialSettings");
      const payloadAsString = new TextDecoder("utf-16").decode(message.slice(1));
      const parsedInitialSettings = JSON.parse(payloadAsString);
      const initialSettings = new InitialSettings();
      if (parsedInitialSettings.Encoder) {
        initialSettings.EncoderSettings = parsedInitialSettings.Encoder;
      }
      if (parsedInitialSettings.WebRTC) {
        initialSettings.WebRTCSettings = parsedInitialSettings.WebRTC;
      }
      if (parsedInitialSettings.PixelStreaming) {
        initialSettings.PixelStreamingSettings = parsedInitialSettings.PixelStreaming;
      }
      if (parsedInitialSettings.ConfigOptions && parsedInitialSettings.ConfigOptions.DefaultToHover !== void 0) {
        this.config.setFlagEnabled(Flags.HoveringMouseMode, !!parsedInitialSettings.ConfigOptions.DefaultToHover);
      }
      initialSettings.ueCompatible();
      Logger.Info(payloadAsString);
      this.pixelStreaming._onInitialSettings(initialSettings);
    }
    /**
     * Handles when the Quantization Parameter are received from the UE Instance
     * @param message - Encoders Quantization Parameter
     */
    handleVideoEncoderAvgQP(message) {
      Logger.Info("DataChannelReceiveMessageType.VideoEncoderAvgQP");
      const AvgQP = Number(new TextDecoder("utf-16").decode(message.slice(1)));
      this.setVideoEncoderAvgQP(AvgQP);
    }
    /**
     * Handles when the video element has been loaded with a srcObject
     */
    handleVideoInitialized() {
      this.pixelStreaming._onVideoInitialized();
      this.autoPlayVideoOrSetUpPlayOverlay();
      this.resizePlayerStyle();
      this.videoPlayer.updateVideoStreamSize();
    }
    /**
     * Flag set if the user has Quality Ownership
     * @param message - Does the current client have Quality Ownership
     */
    onQualityControlOwnership(message) {
      const view = new Uint8Array(message);
      Logger.Info("DataChannelReceiveMessageType.QualityControlOwnership");
      this.isQualityController = new Boolean(view[1]).valueOf();
      Logger.Info(`Received quality controller message, will control quality: ${this.isQualityController}`);
      this.pixelStreaming._onQualityControlOwnership(this.isQualityController);
    }
    /**
     * Handles when the Aggregated stats are Collected
     * @param stats - Aggregated Stats
     */
    handleVideoStats(stats2) {
      this.pixelStreaming._onVideoStats(stats2);
    }
    /**
     * To Resize the Video Player element
     */
    resizePlayerStyle() {
      this.videoPlayer.resizePlayerStyle();
    }
    setPreferredCodec(codec) {
      this.preferredCodec = codec;
      if (this.peerConnectionController) {
        this.peerConnectionController.preferredCodec = codec;
        this.peerConnectionController.updateCodecSelection = false;
      }
    }
    setVideoEncoderAvgQP(avgQP) {
      this.videoAvgQp = avgQP;
      this.pixelStreaming._onVideoEncoderAvgQP(this.videoAvgQp);
    }
    /**
     * enables/disables keyboard event listeners
     */
    setKeyboardInputEnabled(isEnabled) {
      var _a;
      (_a = this.keyboardController) === null || _a === void 0 ? void 0 : _a.unregister();
      if (isEnabled) {
        this.keyboardController = this.inputClassesFactory.registerKeyBoard(this.config);
      }
    }
    /**
     * enables/disables mouse event listeners
     */
    setMouseInputEnabled(isEnabled) {
      var _a;
      (_a = this.mouseController) === null || _a === void 0 ? void 0 : _a.unregister();
      if (isEnabled) {
        const mouseMode = this.config.isFlagEnabled(Flags.HoveringMouseMode) ? ControlSchemeType.HoveringMouse : ControlSchemeType.LockedMouse;
        this.mouseController = this.inputClassesFactory.registerMouse(mouseMode, this.config);
      }
    }
    /**
     * enables/disables touch event listeners
     */
    setTouchInputEnabled(isEnabled) {
      var _a;
      (_a = this.touchController) === null || _a === void 0 ? void 0 : _a.unregister();
      if (isEnabled) {
        this.touchController = this.inputClassesFactory.registerTouch(this.config.isFlagEnabled(Flags.FakeMouseWithTouches));
      }
    }
    /**
     * enables/disables game pad event listeners
     */
    setGamePadInputEnabled(isEnabled) {
      var _a;
      (_a = this.gamePadController) === null || _a === void 0 ? void 0 : _a.unregister();
      if (isEnabled) {
        this.gamePadController = this.inputClassesFactory.registerGamePad();
      }
    }
    registerDataChannelEventEmitters(dataChannel) {
      dataChannel.onOpen = (label, event) => this.pixelStreaming.dispatchEvent(new DataChannelOpenEvent({ label, event }));
      dataChannel.onClose = (label, event) => this.pixelStreaming.dispatchEvent(new DataChannelCloseEvent({ label, event }));
      dataChannel.onError = (label, event) => this.pixelStreaming.dispatchEvent(new DataChannelErrorEvent({ label, event }));
    }
    registerMessageHandler(name, direction, handler) {
      if (direction === MessageDirection.FromStreamer && typeof handler === "undefined") {
        Logger.Warning(`Unable to register handler for ${name} as no handler was passed`);
      }
      this.streamMessageController.registerMessageHandler(direction, name, (data) => typeof handler === "undefined" && direction === MessageDirection.ToStreamer ? this.sendMessageController.sendMessageToStreamer(name, data) : handler(data));
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/Inputs/XRGamepadController.js
  var XRGamepadController = class {
    /**
     * @param toStreamerMessagesProvider - Stream message instance
     */
    constructor(toStreamerMessagesProvider) {
      this.toStreamerMessagesProvider = toStreamerMessagesProvider;
      this.controllers = [];
    }
    updateStatus(source, frame, refSpace) {
      if (source.gamepad) {
        const gamepadPose = frame.getPose(source.gripSpace, refSpace);
        if (!gamepadPose) {
          return;
        }
        let system = 0;
        if (source.profiles.includes("htc-vive")) {
          system = 1;
        } else if (source.profiles.includes("oculus-touch")) {
          system = 2;
        }
        this.toStreamerMessagesProvider.toStreamerHandlers.get("XRSystem")([system]);
        let handedness = 2;
        switch (source.handedness) {
          case "left":
            handedness = 0;
            break;
          case "right":
            handedness = 1;
            break;
        }
        const matrix = gamepadPose.transform.matrix;
        const mat = [];
        for (let i = 0; i < 16; i++) {
          mat[i] = new Float32Array([matrix[i]])[0];
        }
        this.toStreamerMessagesProvider.toStreamerHandlers.get("XRControllerTransform")([
          mat[0],
          mat[4],
          mat[8],
          mat[12],
          mat[1],
          mat[5],
          mat[9],
          mat[13],
          mat[2],
          mat[6],
          mat[10],
          mat[14],
          mat[3],
          mat[7],
          mat[11],
          mat[15],
          handedness
        ]);
        if (this.controllers[handedness] === void 0) {
          this.controllers[handedness] = {
            prevState: void 0,
            currentState: void 0,
            id: void 0
          };
          this.controllers[handedness].prevState = deepCopyGamepad(source.gamepad);
        }
        this.controllers[handedness].currentState = deepCopyGamepad(source.gamepad);
        const controller = this.controllers[handedness];
        const currState = controller.currentState;
        const prevState = controller.prevState;
        for (let i = 0; i < currState.buttons.length; i++) {
          const currButton = currState.buttons[i];
          const prevButton = prevState.buttons[i];
          if (currButton.pressed) {
            const isRepeat = prevButton.pressed ? 1 : 0;
            this.toStreamerMessagesProvider.toStreamerHandlers.get("XRButtonPressed")([
              handedness,
              i,
              isRepeat,
              currButton.value
            ]);
          } else if (prevButton.pressed) {
            this.toStreamerMessagesProvider.toStreamerHandlers.get("XRButtonReleased")([
              handedness,
              i,
              0
            ]);
          }
          if (currButton.touched) {
            const isRepeat = prevButton.touched ? 1 : 0;
            this.toStreamerMessagesProvider.toStreamerHandlers.get("XRButtonTouched")([
              handedness,
              i,
              isRepeat
            ]);
          } else if (prevButton.touched) {
            this.toStreamerMessagesProvider.toStreamerHandlers.get("XRButtonTouchReleased")([
              handedness,
              i,
              0
            ]);
          }
        }
        for (let i = 0; i < currState.axes.length; i++) {
          const curAxisValue = currState.axes[i];
          const prevAxisValue = prevState.axes[i];
          if (curAxisValue != prevAxisValue) {
            this.toStreamerMessagesProvider.toStreamerHandlers.get("XRAnalog")([
              handedness,
              i,
              curAxisValue
            ]);
          }
        }
        this.controllers[handedness].prevState = currState;
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/WebXR/WebXRController.js
  var WebXRController = class {
    constructor(webRtcPlayerController) {
      this.xrViewerPose = null;
      this.EPSILON = 1e-7;
      this.videoTexture = null;
      this.prevVideoWidth = 0;
      this.prevVideoHeight = 0;
      this.leftView = null;
      this.rightView = null;
      this.lastSentLeftEyeProj = null;
      this.lastSentRightEyeProj = null;
      this.lastSentRelativeLeftEyePos = null;
      this.lastSentRelativeRightEyePos = null;
      this.xrSession = null;
      this.webRtcController = webRtcPlayerController;
      this.xrGamepadController = new XRGamepadController(this.webRtcController.streamMessageController);
      this.onSessionEnded = new EventTarget();
      this.onSessionStarted = new EventTarget();
      this.onFrame = new EventTarget();
    }
    xrClicked() {
      if (!this.xrSession) {
        if (!navigator.xr) {
          Logger.Error("This browser does not support XR.");
          return;
        }
        void navigator.xr.requestSession("immersive-vr", { optionalFeatures: [] }).then((session) => {
          this.onXrSessionStarted(session);
        });
      } else {
        void this.xrSession.end();
      }
    }
    onXrSessionEnded() {
      Logger.Info("XR Session ended");
      this.xrSession = null;
      this.onSessionEnded.dispatchEvent(new Event("xrSessionEnded"));
    }
    initGL() {
      if (this.gl) {
        return;
      }
      const canvas = document.createElement("canvas");
      this.gl = canvas.getContext("webgl2", {
        xrCompatible: true
      });
      this.gl.clearColor(0, 0, 0, 1);
    }
    initShaders() {
      const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        // varyings
        varying vec2 v_texCoord;

        void main() {
           gl_Position = vec4(a_position.x, a_position.y, 0, 1);
           // pass the texCoord to the fragment shader
           // The GPU will interpolate this value between points.
           v_texCoord = a_texCoord;
        }
        `;
      const fragmentShaderSource = `
        precision mediump float;

        // our texture
        uniform sampler2D u_image;

        // the texCoords passed in from the vertex shader.
        varying vec2 v_texCoord;

        void main() {
           gl_FragColor = texture2D(u_image, v_texCoord);
        }
        `;
      const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vertexShader, vertexShaderSource);
      this.gl.compileShader(vertexShader);
      const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fragmentShader, fragmentShaderSource);
      this.gl.compileShader(fragmentShader);
      const shaderProgram = this.gl.createProgram();
      this.gl.attachShader(shaderProgram, vertexShader);
      this.gl.attachShader(shaderProgram, fragmentShader);
      this.gl.linkProgram(shaderProgram);
      this.gl.useProgram(shaderProgram);
      this.positionLocation = this.gl.getAttribLocation(shaderProgram, "a_position");
      this.texcoordLocation = this.gl.getAttribLocation(shaderProgram, "a_texCoord");
    }
    updateVideoTexture() {
      if (!this.videoTexture) {
        this.videoTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      }
      const videoHeight = this.webRtcController.videoPlayer.getVideoElement().videoHeight;
      const videoWidth = this.webRtcController.videoPlayer.getVideoElement().videoWidth;
      if (this.prevVideoHeight != videoHeight || this.prevVideoWidth != videoWidth) {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, videoWidth, videoHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.webRtcController.videoPlayer.getVideoElement());
      } else {
        this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, videoWidth, videoHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.webRtcController.videoPlayer.getVideoElement());
      }
      this.prevVideoHeight = videoHeight;
      this.prevVideoWidth = videoWidth;
    }
    initBuffers() {
      {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
          -1,
          1,
          1,
          1,
          -1,
          -1,
          -1,
          -1,
          1,
          1,
          1,
          -1
        ]), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
          this.positionLocation,
          2,
          this.gl.FLOAT,
          false,
          0,
          0
          /*offset*/
        );
      }
      {
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(
          this.texcoordLocation,
          2,
          this.gl.FLOAT,
          false,
          0,
          0
          /*offset*/
        );
      }
    }
    onXrSessionStarted(session) {
      Logger.Info("XR Session started");
      this.xrSession = session;
      this.xrSession.addEventListener("end", () => {
        this.onXrSessionEnded();
      });
      this.initGL();
      this.initShaders();
      this.initBuffers();
      void session.requestReferenceSpace("local").then((refSpace) => {
        this.xrRefSpace = refSpace;
        void this.xrSession.updateRenderState({
          baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
        });
        if (this.xrSession.supportedFrameRates) {
          for (const frameRate of this.xrSession.supportedFrameRates) {
            if (frameRate == 90) {
              void session.updateTargetFrameRate(90);
            }
          }
        }
        this.xrSession.requestAnimationFrame(this.onXrFrame.bind(this));
      });
      this.onSessionStarted.dispatchEvent(new Event("xrSessionStarted"));
    }
    areArraysEqual(a, b) {
      return a.length === b.length && a.every((element, index2) => Math.abs(element - b[index2]) <= this.EPSILON);
    }
    arePointsEqual(a, b) {
      return Math.abs(a.x - b.x) >= this.EPSILON && Math.abs(a.y - b.y) >= this.EPSILON && Math.abs(a.z - b.z) >= this.EPSILON;
    }
    sendXRDataToUE() {
      if (this.leftView == null || this.rightView == null) {
        return;
      }
      let shouldSendEyeViews = this.lastSentLeftEyeProj == null || this.lastSentRightEyeProj == null || this.lastSentRelativeLeftEyePos == null || this.lastSentRelativeRightEyePos == null;
      const leftEyeTrans = this.leftView.transform.matrix;
      const leftEyeProj = this.leftView.projectionMatrix;
      const rightEyeTrans = this.rightView.transform.matrix;
      const rightEyeProj = this.rightView.projectionMatrix;
      const hmdTrans = this.xrViewerPose.transform.matrix;
      if (!shouldSendEyeViews && this.lastSentLeftEyeProj != null && this.lastSentRightEyeProj != null) {
        const leftEyeProjUnchanged = this.areArraysEqual(leftEyeProj, this.lastSentLeftEyeProj);
        const rightEyeProjUnchanged = this.areArraysEqual(rightEyeProj, this.lastSentRightEyeProj);
        shouldSendEyeViews = leftEyeProjUnchanged == false || rightEyeProjUnchanged == false;
      }
      const leftEyeRelativePos = new DOMPointReadOnly(this.leftView.transform.position.x - this.xrViewerPose.transform.position.x, this.leftView.transform.position.y - this.xrViewerPose.transform.position.y, this.leftView.transform.position.z - this.xrViewerPose.transform.position.z, 1);
      const rightEyeRelativePos = new DOMPointReadOnly(this.leftView.transform.position.x - this.xrViewerPose.transform.position.x, this.leftView.transform.position.y - this.xrViewerPose.transform.position.y, this.leftView.transform.position.z - this.xrViewerPose.transform.position.z, 1);
      if (!shouldSendEyeViews && this.lastSentRelativeLeftEyePos != null && this.lastSentRelativeRightEyePos != null) {
        const leftEyePosUnchanged = this.arePointsEqual(leftEyeRelativePos, this.lastSentRelativeLeftEyePos);
        const rightEyePosUnchanged = this.arePointsEqual(rightEyeRelativePos, this.lastSentRelativeRightEyePos);
        shouldSendEyeViews = leftEyePosUnchanged == false || rightEyePosUnchanged == false;
      }
      if (shouldSendEyeViews) {
        this.webRtcController.streamMessageController.toStreamerHandlers.get("XREyeViews")([
          // Left eye 4x4 transform matrix
          leftEyeTrans[0],
          leftEyeTrans[4],
          leftEyeTrans[8],
          leftEyeTrans[12],
          leftEyeTrans[1],
          leftEyeTrans[5],
          leftEyeTrans[9],
          leftEyeTrans[13],
          leftEyeTrans[2],
          leftEyeTrans[6],
          leftEyeTrans[10],
          leftEyeTrans[14],
          leftEyeTrans[3],
          leftEyeTrans[7],
          leftEyeTrans[11],
          leftEyeTrans[15],
          // Left eye 4x4 projection matrix
          leftEyeProj[0],
          leftEyeProj[4],
          leftEyeProj[8],
          leftEyeProj[12],
          leftEyeProj[1],
          leftEyeProj[5],
          leftEyeProj[9],
          leftEyeProj[13],
          leftEyeProj[2],
          leftEyeProj[6],
          leftEyeProj[10],
          leftEyeProj[14],
          leftEyeProj[3],
          leftEyeProj[7],
          leftEyeProj[11],
          leftEyeProj[15],
          // Right eye 4x4 transform matrix
          rightEyeTrans[0],
          rightEyeTrans[4],
          rightEyeTrans[8],
          rightEyeTrans[12],
          rightEyeTrans[1],
          rightEyeTrans[5],
          rightEyeTrans[9],
          rightEyeTrans[13],
          rightEyeTrans[2],
          rightEyeTrans[6],
          rightEyeTrans[10],
          rightEyeTrans[14],
          rightEyeTrans[3],
          rightEyeTrans[7],
          rightEyeTrans[11],
          rightEyeTrans[15],
          // right eye 4x4 projection matrix
          rightEyeProj[0],
          rightEyeProj[4],
          rightEyeProj[8],
          rightEyeProj[12],
          rightEyeProj[1],
          rightEyeProj[5],
          rightEyeProj[9],
          rightEyeProj[13],
          rightEyeProj[2],
          rightEyeProj[6],
          rightEyeProj[10],
          rightEyeProj[14],
          rightEyeProj[3],
          rightEyeProj[7],
          rightEyeProj[11],
          rightEyeProj[15],
          // HMD 4x4 transform
          hmdTrans[0],
          hmdTrans[4],
          hmdTrans[8],
          hmdTrans[12],
          hmdTrans[1],
          hmdTrans[5],
          hmdTrans[9],
          hmdTrans[13],
          hmdTrans[2],
          hmdTrans[6],
          hmdTrans[10],
          hmdTrans[14],
          hmdTrans[3],
          hmdTrans[7],
          hmdTrans[11],
          hmdTrans[15]
        ]);
        this.lastSentLeftEyeProj = leftEyeProj;
        this.lastSentRightEyeProj = rightEyeProj;
        this.lastSentRelativeLeftEyePos = leftEyeRelativePos;
        this.lastSentRelativeRightEyePos = rightEyeRelativePos;
      } else {
        this.webRtcController.streamMessageController.toStreamerHandlers.get("XRHMDTransform")([
          // HMD 4x4 transform
          hmdTrans[0],
          hmdTrans[4],
          hmdTrans[8],
          hmdTrans[12],
          hmdTrans[1],
          hmdTrans[5],
          hmdTrans[9],
          hmdTrans[13],
          hmdTrans[2],
          hmdTrans[6],
          hmdTrans[10],
          hmdTrans[14],
          hmdTrans[3],
          hmdTrans[7],
          hmdTrans[11],
          hmdTrans[15]
        ]);
      }
    }
    onXrFrame(time, frame) {
      this.xrViewerPose = frame.getViewerPose(this.xrRefSpace);
      if (this.xrViewerPose) {
        this.updateViews();
        if (this.leftView == null || this.rightView == null) {
          return;
        }
        this.sendXRDataToUE();
        this.updateVideoTexture();
        this.render();
      }
      if (this.webRtcController.config.isFlagEnabled(Flags.XRControllerInput)) {
        this.xrSession.inputSources.forEach((source, _index, _array) => {
          this.xrGamepadController.updateStatus(source, frame, this.xrRefSpace);
        }, this);
      }
      this.xrSession.requestAnimationFrame((time2, frame2) => this.onXrFrame(time2, frame2));
      this.onFrame.dispatchEvent(new XrFrameEvent({ time, frame }));
    }
    updateViews() {
      if (!this.xrViewerPose) {
        return;
      }
      for (const view of this.xrViewerPose.views) {
        if (view.eye === "left") {
          this.leftView = view;
        } else if (view.eye === "right") {
          this.rightView = view;
        }
      }
    }
    render() {
      if (!this.gl) {
        return;
      }
      const glLayer = this.xrSession.renderState.baseLayer;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, glLayer.framebuffer);
      this.gl.viewport(0, 0, glLayer.framebufferWidth, glLayer.framebufferHeight);
      this.gl.drawArrays(
        this.gl.TRIANGLES,
        0,
        6
        /*count*/
      );
    }
    static isSessionSupported(mode) {
      if (location.protocol !== "https:") {
        Logger.Info("WebXR requires https, if you want WebXR use https.");
      }
      try {
        if (navigator.xr) {
          return navigator.xr.isSessionSupported(mode);
        }
      } catch (_a) {
        return Promise.resolve(false);
      }
      return Promise.resolve(false);
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/DataChannelLatencyTestResults.js
  var DataChannelLatencyTestRecord = class {
    constructor(request) {
      this.seq = request.Seq;
      this.playerSentTimestamp = Date.now();
      this.requestFillerSize = request.Filler ? request.Filler.length : 0;
    }
    update(response) {
      this.playerReceivedTimestamp = Date.now();
      this.streamerReceivedTimestamp = response.ReceivedTimestamp;
      this.streamerSentTimestamp = response.SentTimestamp;
      this.responseFillerSize = response.Filler ? response.Filler.length : 0;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/DataChannel/DataChannelLatencyTestController.js
  var DataChannelLatencyTestController = class {
    constructor(sink, callback) {
      this.intervalHandle = void 0;
      this.sink = sink;
      this.callback = callback;
      this.records = /* @__PURE__ */ new Map();
      this.seq = 0;
    }
    start(config2) {
      if (this.isRunning()) {
        return false;
      }
      this.startTime = Date.now();
      this.records.clear();
      this.intervalHandle = window.setInterval((() => {
        if (Date.now() - this.startTime >= config2.duration) {
          this.stop();
        } else {
          this.sendRequest(config2.requestSize, config2.responseSize);
        }
      }).bind(this), Math.floor(1e3 / config2.rps));
      return true;
    }
    stop() {
      if (this.intervalHandle) {
        window.clearInterval(this.intervalHandle);
        this.intervalHandle = void 0;
        this.callback(this.produceResult());
      }
    }
    produceResult() {
      const resultRecords = new Map(this.records);
      return {
        records: resultRecords,
        dataChannelRtt: Math.ceil(Array.from(this.records.values()).reduce((acc, next) => {
          return acc + (next.playerReceivedTimestamp - next.playerSentTimestamp);
        }, 0) / this.records.size),
        playerToStreamerTime: Math.ceil(Array.from(this.records.values()).reduce((acc, next) => {
          return acc + (next.streamerReceivedTimestamp - next.playerSentTimestamp);
        }, 0) / this.records.size),
        streamerToPlayerTime: Math.ceil(Array.from(this.records.values()).reduce((acc, next) => {
          return acc + (next.playerReceivedTimestamp - next.streamerSentTimestamp);
        }, 0) / this.records.size),
        exportLatencyAsCSV: () => {
          let csv = "Timestamp;RTT;PlayerToStreamer;StreamerToPlayer;\n";
          resultRecords.forEach((record) => {
            csv += record.playerSentTimestamp + ";";
            csv += record.playerReceivedTimestamp - record.playerSentTimestamp + ";";
            csv += record.streamerReceivedTimestamp - record.playerSentTimestamp + ";";
            csv += record.playerReceivedTimestamp - record.streamerSentTimestamp + ";";
            csv += "\n";
          });
          return csv;
        }
      };
    }
    isRunning() {
      return !!this.intervalHandle;
    }
    receive(response) {
      if (!this.isRunning()) {
        return;
      }
      if (!response) {
        Logger.Error("Undefined response from server");
        return;
      }
      const record = this.records.get(response.Seq);
      if (record) {
        record.update(response);
      }
    }
    sendRequest(requestSize, responseSize) {
      const request = this.createRequest(requestSize, responseSize);
      const record = new DataChannelLatencyTestRecord(request);
      this.records.set(record.seq, record);
      this.sink(request);
    }
    createRequest(requestSize, responseSize) {
      return {
        Seq: this.seq++,
        FillResponseSize: responseSize,
        Filler: requestSize ? "A".repeat(requestSize) : ""
      };
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ue5.5/dist/esm/PixelStreaming/PixelStreaming.js
  var PixelStreaming = class {
    /**
     * @param config - A newly instantiated config object
     * @param overrides - Parameters to override default behaviour
     * returns the base Pixel streaming object
     */
    constructor(config2, overrides) {
      this.allowConsoleCommands = false;
      this.config = config2;
      if (overrides === null || overrides === void 0 ? void 0 : overrides.videoElementParent) {
        this._videoElementParent = overrides.videoElementParent;
      }
      this._eventEmitter = new PixelStreamingEventEmitter();
      this.configureSettings();
      this.setWebRtcPlayerController(new WebRtcPlayerController(this.config, this));
      this._webXrController = new WebXRController(this._webRtcController);
      this._setupWebRtcTCPRelayDetection = this._setupWebRtcTCPRelayDetection.bind(this);
      this._eventEmitter.addEventListener("webRtcConnected", (_) => {
        this._eventEmitter.addEventListener("statsReceived", this._setupWebRtcTCPRelayDetection);
      });
    }
    /**
     * Gets the element that contains the video stream element.
     */
    get videoElementParent() {
      if (!this._videoElementParent) {
        this._videoElementParent = document.createElement("div");
        this._videoElementParent.id = "videoElementParent";
      }
      return this._videoElementParent;
    }
    /**
     * Configure the settings with on change listeners and any additional per experience settings.
     */
    configureSettings() {
      this.config._addOnSettingChangedListener(Flags.IsQualityController, (wantsQualityController) => {
        if (wantsQualityController === true && !this._webRtcController.isQualityController) {
          this._webRtcController.sendRequestQualityControlOwnership();
        }
      });
      this.config._addOnSettingChangedListener(Flags.AFKDetection, (isAFKEnabled) => {
        this._webRtcController.setAfkEnabled(isAFKEnabled);
      });
      this.config._addOnSettingChangedListener(Flags.MatchViewportResolution, () => {
        this._webRtcController.videoPlayer.updateVideoStreamSize();
      });
      this.config._addOnSettingChangedListener(Flags.HoveringMouseMode, (isHoveringMouse) => {
        this.config.setFlagLabel(Flags.HoveringMouseMode, `Control Scheme: ${isHoveringMouse ? "Hovering" : "Locked"} Mouse`);
        this._webRtcController.setMouseInputEnabled(this.config.isFlagEnabled(Flags.MouseInput));
      });
      this.config._addOnSettingChangedListener(Flags.KeyboardInput, (isEnabled) => {
        this._webRtcController.setKeyboardInputEnabled(isEnabled);
      });
      this.config._addOnSettingChangedListener(Flags.MouseInput, (isEnabled) => {
        this._webRtcController.setMouseInputEnabled(isEnabled);
      });
      this.config._addOnSettingChangedListener(Flags.FakeMouseWithTouches, (_isFakeMouseEnabled) => {
        this._webRtcController.setTouchInputEnabled(this.config.isFlagEnabled(Flags.TouchInput));
      });
      this.config._addOnSettingChangedListener(Flags.TouchInput, (isEnabled) => {
        this._webRtcController.setTouchInputEnabled(isEnabled);
      });
      this.config._addOnSettingChangedListener(Flags.GamepadInput, (isEnabled) => {
        this._webRtcController.setGamePadInputEnabled(isEnabled);
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.MinQP, (newValue) => {
        Logger.Info("--------  Sending MinQP  --------");
        this._webRtcController.sendEncoderMinQP(newValue);
        Logger.Info("-------------------------------------------");
        const quality = Math.trunc(100 * (1 - newValue / 51));
        this.config.setNumericSetting(NumericParameters.CompatQualityMax, quality);
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.MaxQP, (newValue) => {
        Logger.Info("--------  Sending MaxQP  --------");
        this._webRtcController.sendEncoderMaxQP(newValue);
        Logger.Info("-------------------------------------------");
        const quality = Math.trunc(100 * (1 - newValue / 51));
        this.config.setNumericSetting(NumericParameters.CompatQualityMin, quality);
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.MinQuality, (newValue) => {
        Logger.Info("--------  Sending MinQuality  --------");
        this._webRtcController.sendEncoderMinQuality(newValue);
        Logger.Info("-------------------------------------------");
        this.config.setNumericSetting(NumericParameters.CompatQualityMin, newValue);
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.MaxQuality, (newValue) => {
        Logger.Info("--------  Sending MaxQuality  --------");
        this._webRtcController.sendEncoderMaxQuality(newValue);
        Logger.Info("-------------------------------------------");
        this.config.setNumericSetting(NumericParameters.CompatQualityMax, newValue);
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.CompatQualityMin, (newValue) => {
        newValue = 51 - newValue / 100 * 51;
        Logger.Info("--------  Sending MinQP from quality value  --------");
        this._webRtcController.sendEncoderMaxQP(newValue);
        Logger.Info("-------------------------------------------");
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.CompatQualityMax, (newValue) => {
        newValue = 51 - newValue / 100 * 51;
        Logger.Info("--------  Sending MaxQP from quality value  --------");
        this._webRtcController.sendEncoderMinQP(newValue);
        Logger.Info("-------------------------------------------");
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.WebRTCMinBitrate, (newValue) => {
        Logger.Info("--------  Sending web rtc settings  --------");
        this._webRtcController.sendWebRTCMinBitrate(
          newValue * 1e3
          /* kbps to bps */
        );
        Logger.Info("-------------------------------------------");
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.WebRTCMaxBitrate, (newValue) => {
        Logger.Info("--------  Sending web rtc settings  --------");
        this._webRtcController.sendWebRTCMaxBitrate(
          newValue * 1e3
          /* kbps to bps */
        );
        Logger.Info("-------------------------------------------");
      });
      this.config._addOnNumericSettingChangedListener(NumericParameters.WebRTCFPS, (newValue) => {
        Logger.Info("--------  Sending web rtc settings  --------");
        this._webRtcController.sendWebRTCFps(newValue);
        Logger.Info("-------------------------------------------");
      });
      this.config._addOnOptionSettingChangedListener(OptionParameters.PreferredCodec, (newValue) => {
        if (this._webRtcController) {
          this._webRtcController.setPreferredCodec(newValue);
        }
      });
      this.config._registerOnChangeEvents(this._eventEmitter);
    }
    /**
     * Set the input control ownership
     * @param inputControlOwnership - does the user have input control ownership
     */
    _onInputControlOwnership(inputControlOwnership) {
      this._inputController = inputControlOwnership;
    }
    /**
     * Instantiate the WebRTCPlayerController interface to provide WebRTCPlayerController functionality within this class and set up anything that requires it
     * @param webRtcPlayerController - a WebRtcPlayerController controller instance
     */
    setWebRtcPlayerController(webRtcPlayerController) {
      this._webRtcController = webRtcPlayerController;
      this._webRtcController.setPreferredCodec(this.config.getSettingOption(OptionParameters.PreferredCodec).selected);
      this._webRtcController.resizePlayerStyle();
      this.checkForAutoConnect();
    }
    /**
     * Connect to signaling server.
     */
    connect() {
      this._eventEmitter.dispatchEvent(new StreamPreConnectEvent());
      this._webRtcController.connectToSignallingServer();
    }
    /**
     * Reconnects to the signaling server. If connection is up, disconnects first
     * before establishing a new connection
     */
    reconnect() {
      this._eventEmitter.dispatchEvent(new StreamReconnectEvent());
      this._webRtcController.tryReconnect("Reconnecting...");
    }
    /**
     * Disconnect from the signaling server and close open peer connections.
     */
    disconnect() {
      this._eventEmitter.dispatchEvent(new StreamPreDisconnectEvent());
      this._webRtcController.close();
    }
    /**
     * Play the stream. Can be called only after a peer connection has been established.
     */
    play() {
      this._onStreamLoading();
      this._webRtcController.playStream();
    }
    /**
     * Auto connect if AutoConnect flag is enabled
     */
    checkForAutoConnect() {
      if (this.config.isFlagEnabled(Flags.AutoConnect)) {
        this._onWebRtcAutoConnect();
        this._webRtcController.connectToSignallingServer();
      }
    }
    /**
     * Will unmute the microphone track which is sent to Unreal Engine.
     * By default, will only unmute an existing mic track.
     *
     * @param forceEnable Can be used for cases when this object wasn't initialized with a mic track.
     * If this parameter is true, the connection will be restarted with a microphone.
     * Warning: this takes some time, as a full renegotiation and reconnection will happen.
     */
    unmuteMicrophone(forceEnable = false) {
      if (this.config.isFlagEnabled("UseMic")) {
        this.setMicrophoneMuted(false);
        return;
      }
      if (forceEnable) {
        this.config.setFlagEnabled("UseMic", true);
        this.reconnect();
        return;
      }
      Logger.Warning("Trying to unmute mic, but PixelStreaming was initialized with no microphone track. Call with forceEnable == true to re-connect with a mic track.");
    }
    muteMicrophone() {
      if (this.config.isFlagEnabled("UseMic")) {
        this.setMicrophoneMuted(true);
        return;
      }
      Logger.Info("Trying to mute mic, but PixelStreaming has no microphone track, so sending sound is already disabled.");
    }
    setMicrophoneMuted(mute) {
      var _a, _b, _c, _d;
      for (const transceiver of (_d = (_c = (_b = (_a = this._webRtcController) === null || _a === void 0 ? void 0 : _a.peerConnectionController) === null || _b === void 0 ? void 0 : _b.peerConnection) === null || _c === void 0 ? void 0 : _c.getTransceivers()) !== null && _d !== void 0 ? _d : []) {
        if (RTCUtils.canTransceiverSendAudio(transceiver)) {
          transceiver.sender.track.enabled = !mute;
        }
      }
    }
    /**
     * Will unmute the video track which is sent to Unreal Engine.
     * By default, will only unmute an existing video track.
     *
     * @param forceEnable Can be used for cases when this object wasn't initialized with a video track.
     * If this parameter is true, the connection will be restarted with a camera.
     * Warning: this takes some time, as a full renegotiation and reconnection will happen.
     */
    unmuteCamera(forceEnable = false) {
      if (this.config.isFlagEnabled("UseCamera")) {
        this.setCameraMuted(false);
        return;
      }
      if (forceEnable) {
        this.config.setFlagEnabled("UseCamera", true);
        this.reconnect();
        return;
      }
      Logger.Warning("Trying to unmute video, but PixelStreaming was initialized with no video track. Call with forceEnable == true to re-connect with a video track.");
    }
    muteCamera() {
      if (this.config.isFlagEnabled("UseCamera")) {
        this.setCameraMuted(true);
        return;
      }
      Logger.Info("Trying to mute camera, but PixelStreaming has no video track, so sending video is already disabled.");
    }
    setCameraMuted(mute) {
      var _a, _b, _c, _d;
      for (const transceiver of (_d = (_c = (_b = (_a = this._webRtcController) === null || _a === void 0 ? void 0 : _a.peerConnectionController) === null || _b === void 0 ? void 0 : _b.peerConnection) === null || _c === void 0 ? void 0 : _c.getTransceivers()) !== null && _d !== void 0 ? _d : []) {
        if (RTCUtils.canTransceiverSendVideo(transceiver)) {
          transceiver.sender.track.enabled = !mute;
        }
      }
    }
    /**
     * Internal function to emit an event when auto connecting occurs
     */
    _onWebRtcAutoConnect() {
      this._eventEmitter.dispatchEvent(new WebRtcAutoConnectEvent());
    }
    /**
     * Internal function to emit an event for when SDP negotiation is fully finished.
     */
    _onWebRtcSdp() {
      this._eventEmitter.dispatchEvent(new WebRtcSdpEvent());
    }
    /**
     * Internal function to emit an SDP offer after it has been set.
     */
    _onWebRtcSdpOffer(offer2) {
      this._eventEmitter.dispatchEvent(new WebRtcSdpOfferEvent({ sdp: offer2 }));
    }
    /**
     * Internal function to emit an SDP answer after it has been set.
     */
    _onWebRtcSdpAnswer(answer2) {
      this._eventEmitter.dispatchEvent(new WebRtcSdpAnswerEvent({ sdp: answer2 }));
    }
    /**
     * Internal function call to emit a `latencyCalculated` event.
     */
    _onLatencyCalculated(latencyInfo) {
      this._eventEmitter.dispatchEvent(new LatencyCalculatedEvent({ latencyInfo }));
    }
    /**
     * Internal function to emits a StreamLoading event
     */
    _onStreamLoading() {
      this._eventEmitter.dispatchEvent(new StreamLoadingEvent());
    }
    /**
     * Event fired when the video is disconnected - emits given eventString or an override
     * message from webRtcController if one has been set
     * @param eventString - a string describing why the connection closed
     * @param allowClickToReconnect - true if we want to allow the user to retry the connection with a click
     */
    _onDisconnect(eventString, allowClickToReconnect) {
      this._eventEmitter.dispatchEvent(new WebRtcDisconnectedEvent({
        eventString,
        allowClickToReconnect
      }));
    }
    /**
     * Handles when Web Rtc is connecting
     */
    _onWebRtcConnecting() {
      this._eventEmitter.dispatchEvent(new WebRtcConnectingEvent());
    }
    /**
     * Handles when Web Rtc has connected
     */
    _onWebRtcConnected() {
      this._eventEmitter.dispatchEvent(new WebRtcConnectedEvent());
    }
    /**
     * Handles when Web Rtc fails to connect
     */
    _onWebRtcFailed() {
      this._eventEmitter.dispatchEvent(new WebRtcFailedEvent());
    }
    /**
     * Handle when the Video has been Initialized
     */
    _onVideoInitialized() {
      this._eventEmitter.dispatchEvent(new VideoInitializedEvent());
      this._videoStartTime = Date.now();
      this.checkForAutoEnterVR();
    }
    /**
     * If the AutoEnterVR flag is set and an immersive-vr session is supported,
     * request the WebXR session. Browsers typically require a user gesture for
     * `requestSession`; if no gesture is currently active the request will be
     * rejected and a warning is logged. Callers that need a guaranteed entry
     * (e.g. AutoConnect from a fresh page load) should still wire up a button.
     */
    checkForAutoEnterVR() {
      if (!this.config.isFlagEnabled(Flags.AutoEnterVR)) {
        return;
      }
      WebXRController.isSessionSupported("immersive-vr").then((supported) => {
        if (!supported) {
          Logger.Info("AutoEnterVR is on but immersive-vr is not supported on this device.");
          return;
        }
        this._webXrController.xrClicked();
      }).catch((err) => {
        const msg = err instanceof Error ? err.message : JSON.stringify(err);
        Logger.Warning(`AutoEnterVR check failed: ${msg}`);
      });
    }
    /**
     * Set up functionality to happen when receiving latency test results
     * @param latency - latency test results object
     */
    _onLatencyTestResult(latencyTimings) {
      this._eventEmitter.dispatchEvent(new LatencyTestResultEvent({ latencyTimings }));
    }
    _onDataChannelLatencyTestResponse(response) {
      this._eventEmitter.dispatchEvent(new DataChannelLatencyTestResponseEvent({ response }));
    }
    /**
     * Set up functionality to happen when receiving video statistics
     * @param videoStats - video statistics as a aggregate stats object
     */
    _onVideoStats(videoStats) {
      if (!this._videoStartTime || this._videoStartTime === void 0) {
        this._videoStartTime = Date.now();
      }
      videoStats.handleSessionStatistics(this._videoStartTime, this._inputController, this._webRtcController.videoAvgQp);
      this._eventEmitter.dispatchEvent(new StatsReceivedEvent({ aggregatedStats: videoStats }));
    }
    /**
     * Set up functionality to happen when calculating the average video encoder qp
     * @param QP - the quality number of the stream
     */
    _onVideoEncoderAvgQP(QP) {
      this._eventEmitter.dispatchEvent(new VideoEncoderAvgQPEvent({ avgQP: QP }));
    }
    /**
     * Set up functionality to happen when receiving and handling initial settings for the UE app
     * @param settings - initial UE app settings
     */
    _onInitialSettings(settings) {
      var _a;
      this._eventEmitter.dispatchEvent(new InitialSettingsEvent({ settings }));
      if (settings.PixelStreamingSettings) {
        this.allowConsoleCommands = (_a = settings.PixelStreamingSettings.AllowPixelStreamingCommands) !== null && _a !== void 0 ? _a : false;
        if (this.allowConsoleCommands === false) {
          Logger.Info("-AllowPixelStreamingCommands=false, sending arbitrary console commands from browser to UE is disabled.");
        }
      }
      const useUrlParams = this.config.useUrlParams;
      const urlParams = new IURLSearchParams(window.location.search);
      Logger.Info(`using URL parameters ${useUrlParams}`);
      if (settings.EncoderSettings) {
        if (settings.EncoderSettings.MinQP) {
          this.config.setNumericSetting(
            NumericParameters.MinQP,
            // If a setting is set in the URL, make sure we respect that value as opposed to what the application sends us
            useUrlParams && urlParams.has(NumericParameters.MinQP) ? Number.parseFloat(urlParams.get(NumericParameters.MinQP)) : settings.EncoderSettings.MinQP || 0
          );
          this.config.setNumericSetting(NumericParameters.MaxQP, useUrlParams && urlParams.has(NumericParameters.MaxQP) ? Number.parseFloat(urlParams.get(NumericParameters.MaxQP)) : settings.EncoderSettings.MaxQP || 51);
        }
        if (settings.EncoderSettings.MinQuality) {
          this.config.setNumericSetting(
            NumericParameters.MinQuality,
            // If a setting is set in the URL, make sure we respect that value as opposed to what the application sends us
            useUrlParams && urlParams.has(NumericParameters.MinQuality) ? Number.parseFloat(urlParams.get(NumericParameters.MinQuality)) : settings.EncoderSettings.MinQuality || 0
          );
          this.config.setNumericSetting(NumericParameters.MaxQuality, useUrlParams && urlParams.has(NumericParameters.MaxQuality) ? Number.parseFloat(urlParams.get(NumericParameters.MaxQuality)) : settings.EncoderSettings.MaxQuality || 100);
        }
        if (useUrlParams) {
          if (urlParams.has(NumericParameters.CompatQualityMin)) {
            this.config.setNumericSetting(NumericParameters.CompatQualityMin, Number.parseFloat(urlParams.get(NumericParameters.CompatQualityMin)));
          }
          if (urlParams.has(NumericParameters.CompatQualityMax)) {
            this.config.setNumericSetting(NumericParameters.CompatQualityMax, Number.parseFloat(urlParams.get(NumericParameters.CompatQualityMax)));
          }
        }
      }
      if (settings.WebRTCSettings) {
        this.config.setNumericSetting(
          NumericParameters.WebRTCMinBitrate,
          useUrlParams && urlParams.has(NumericParameters.WebRTCMinBitrate) ? Number.parseFloat(urlParams.get(NumericParameters.WebRTCMinBitrate)) : settings.WebRTCSettings.MinBitrate / 1e3
          /* bps to kbps */
        );
        this.config.setNumericSetting(
          NumericParameters.WebRTCMaxBitrate,
          useUrlParams && urlParams.has(NumericParameters.WebRTCMaxBitrate) ? Number.parseFloat(urlParams.get(NumericParameters.WebRTCMaxBitrate)) : settings.WebRTCSettings.MaxBitrate / 1e3
          /* bps to kbps */
        );
        this.config.setNumericSetting(NumericParameters.WebRTCFPS, useUrlParams && urlParams.has(NumericParameters.WebRTCFPS) ? Number.parseFloat(urlParams.get(NumericParameters.WebRTCFPS)) : settings.WebRTCSettings.FPS);
      }
    }
    /**
     * Set up functionality to happen when setting quality control ownership of a stream
     * @param hasQualityOwnership - does this user have quality ownership of the stream true / false
     */
    _onQualityControlOwnership(hasQualityOwnership) {
      this.config.setFlagEnabled(Flags.IsQualityController, hasQualityOwnership);
    }
    _onPlayerCount(playerCount2) {
      this._eventEmitter.dispatchEvent(new PlayerCountEvent({ count: playerCount2 }));
    }
    _onSubscribeFailed(message) {
      this._eventEmitter.dispatchEvent(new SubscribeFailedEvent({ message }));
    }
    // Sets up to emit the webrtc tcp relay detect event
    _setupWebRtcTCPRelayDetection(statsReceivedEvent) {
      const activeCandidatePair = statsReceivedEvent.data.aggregatedStats.getActiveCandidatePair();
      if (activeCandidatePair != null) {
        const localCandidate = statsReceivedEvent.data.aggregatedStats.localCandidates.find((candidate) => candidate.id == activeCandidatePair.localCandidateId, null);
        if (localCandidate != null && localCandidate.candidateType == "relay" && localCandidate.relayProtocol == "tcp") {
          this._eventEmitter.dispatchEvent(new WebRtcTCPRelayDetectedEvent());
        }
        this._eventEmitter.removeEventListener("statsReceived", this._setupWebRtcTCPRelayDetection);
      }
    }
    /**
     * Request a connection latency test.
     * NOTE: There are plans to refactor all request* functions. Expect changes if you use this!
     * @returns
     */
    requestLatencyTest() {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.sendLatencyTest();
      return true;
    }
    /**
     * Request a data channel latency test.
     * NOTE: There are plans to refactor all request* functions. Expect changes if you use this!
     */
    requestDataChannelLatencyTest(config2) {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      if (!this._dataChannelLatencyTestController) {
        this._dataChannelLatencyTestController = new DataChannelLatencyTestController(this._webRtcController.sendDataChannelLatencyTest.bind(this._webRtcController), (result) => {
          this._eventEmitter.dispatchEvent(new DataChannelLatencyTestResultEvent({ result }));
        });
        this.addEventListener("dataChannelLatencyTestResponse", ({ data: { response } }) => {
          this._dataChannelLatencyTestController.receive(response);
        });
      }
      return this._dataChannelLatencyTestController.start(config2);
    }
    /**
     * Request for the UE application to show FPS counter.
     * NOTE: There are plans to refactor all request* functions. Expect changes if you use this!
     * @returns
     */
    requestShowFps() {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.sendShowFps();
      return true;
    }
    /**
     * Request for a new IFrame from the UE application.
     * NOTE: There are plans to refactor all request* functions. Expect changes if you use this!
     * @returns
     */
    requestIframe() {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.sendIframeRequest();
      return true;
    }
    /**
     * Send data to UE application. The data will be run through JSON.stringify() so e.g. strings
     * and any serializable plain JSON objects with no recurrence can be sent.
     * @returns true if succeeded, false if rejected
     */
    emitUIInteraction(descriptor) {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.emitUIInteraction(descriptor);
      return true;
    }
    /**
     * Send a command to UE application. Blocks ConsoleCommand descriptors unless UE
     * has signaled that it allows console commands.
     * @returns true if succeeded, false if rejected
     */
    emitCommand(descriptor) {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      if (!this.allowConsoleCommands && "ConsoleCommand" in descriptor) {
        return false;
      }
      this._webRtcController.emitCommand(descriptor);
      return true;
    }
    /**
     * Send a console command to UE application. Only allowed if UE has signaled that it allows
     * console commands.
     * @returns true if succeeded, false if rejected
     */
    emitConsoleCommand(command) {
      if (!this.allowConsoleCommands || !this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.emitConsoleCommand(command);
      return true;
    }
    /**
     * Sets the text contents of the currently focused UE text box widget.
     * @param contents The new contents of the UE text box.
     * @returns True if the message could be sent.
     */
    sendTextboxEntry(contents) {
      if (!this._webRtcController.videoPlayer.isVideoReady()) {
        return false;
      }
      this._webRtcController.sendTextboxEntry(contents);
      return true;
    }
    /**
     * Add a UE -> browser response event listener
     * @param name - The name of the response handler
     * @param listener - The method to be activated when a message is received
     */
    addResponseEventListener(name, listener) {
      this._webRtcController.responseController.addResponseEventListener(name, listener);
    }
    /**
     * Remove a UE -> browser response event listener
     * @param name - The name of the response handler
     */
    removeResponseEventListener(name) {
      this._webRtcController.responseController.removeResponseEventListener(name);
    }
    /**
     * Dispatch a new event.
     * @param e event
     * @returns
     */
    dispatchEvent(e) {
      return this._eventEmitter.dispatchEvent(e);
    }
    /**
     * Register an event handler.
     * @param type event name
     * @param listener event handler function
     */
    addEventListener(type, listener) {
      this._eventEmitter.addEventListener(type, listener);
    }
    /**
     * Remove an event handler.
     * @param type event name
     * @param listener event handler function
     */
    removeEventListener(type, listener) {
      this._eventEmitter.removeEventListener(type, listener);
    }
    /**
     * Enable/disable XR mode.
     */
    toggleXR() {
      this.webXrController.xrClicked();
    }
    /**
     * Pass in a function to generate a signalling server URL.
     * This function is useful if you need to programmatically construct your signalling server URL.
     * @param signallingUrlBuilderFunc A function that generates a signalling server url.
     */
    setSignallingUrlBuilder(signallingUrlBuilderFunc) {
      this._webRtcController.signallingUrlBuilder = signallingUrlBuilderFunc;
    }
    get webRtcController() {
      return this._webRtcController;
    }
    /**
     * Public getter for the websocket controller. Access to this property allows you to send
     * custom websocket messages.
     */
    get signallingProtocol() {
      return this._webRtcController.protocol;
    }
    /**
     * Public getter for the webXrController controller. Used for all XR features.
     */
    get webXrController() {
      return this._webXrController;
    }
    registerMessageHandler(name, direction, handler) {
      if (direction === MessageDirection.FromStreamer && typeof handler === "undefined") {
        Logger.Warning(`Unable to register an undefined handler for ${name}`);
        return;
      }
      if (direction === MessageDirection.ToStreamer && typeof handler === "undefined") {
        this._webRtcController.streamMessageController.registerMessageHandler(direction, name, (data) => this._webRtcController.sendMessageController.sendMessageToStreamer(name, data));
      } else {
        this._webRtcController.streamMessageController.registerMessageHandler(direction, name, (data) => handler(data));
      }
    }
    get toStreamerHandlers() {
      return this._webRtcController.streamMessageController.toStreamerHandlers;
    }
    isReconnecting() {
      return this._webRtcController.isReconnecting;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/pixelstreamingfrontend-ui.js
  var pixelstreamingfrontend_ui_exports = {};
  __export(pixelstreamingfrontend_ui_exports, {
    AFKOverlay: () => AFKOverlay,
    ActionOverlay: () => ActionOverlay,
    Application: () => Application,
    ConfigUI: () => ConfigUI,
    ConnectOverlay: () => ConnectOverlay,
    DisconnectOverlay: () => DisconnectOverlay,
    ErrorOverlay: () => ErrorOverlay,
    InfoOverlay: () => InfoOverlay,
    OverlayBase: () => OverlayBase,
    PixelStreamingApplicationStyle: () => PixelStreamingApplicationStyle,
    PlayOverlay: () => PlayOverlay,
    SettingUIBase: () => SettingUIBase,
    SettingUIFlag: () => SettingUIFlag,
    SettingUINumber: () => SettingUINumber,
    SettingUIOption: () => SettingUIOption,
    SettingUIText: () => SettingUIText,
    TextOverlay: () => TextOverlay,
    UIElementCreationMode: () => UIElementCreationMode
  });

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/BaseOverlay.js
  var OverlayBase = class {
    /**
     * Construct an overlay
     * @param rootDiv - the root element this overlay will be inserted into
     * @param rootElement - the root element that is the overlay
     */
    constructor(rootDiv, rootElement, textElement) {
      this.rootDiv = rootDiv;
      this.rootElement = rootElement;
      this.textElement = textElement;
      this.rootElement.appendChild(this.textElement);
      this.hide();
      this.rootDiv.appendChild(this.rootElement);
    }
    /**
     * Show the overlay
     */
    show() {
      this.rootElement.classList.remove("hiddenState");
    }
    /**
     * Hide the overlay
     */
    hide() {
      this.rootElement.classList.add("hiddenState");
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/ActionOverlay.js
  var ActionOverlay = class extends OverlayBase {
    /**
     * Construct an action overlay
     * @param rootDiv - the root element this overlay will be inserted into
     * @param rootElement - the root element that is the overlay
     * @param contentElement - an element that contains text for the action overlay
     */
    constructor(rootDiv, rootElement, contentElement) {
      super(rootDiv, rootElement, contentElement);
      this.onActionCallback = () => {
        Logger.Info("Did you forget to set the onAction callback in your overlay?");
      };
    }
    /**
     * Update the text overlays inner text
     * @param text - the update text to be inserted into the overlay
     */
    update(text) {
      if (text != null) {
        this.textElement.innerHTML = text;
      }
    }
    /**
     * Set a method as an event emitter callback
     * @param callBack - the method that is to be called when the event is emitted
     */
    onAction(callBack) {
      this.onActionCallback = callBack;
    }
    /**
     * Activate an event that is attached to the event emitter
     */
    activate() {
      this.onActionCallback();
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/ConnectOverlay.js
  var ConnectOverlay = class _ConnectOverlay extends ActionOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const connectElem = document.createElement("div");
      connectElem.id = "connectOverlay";
      connectElem.className = "clickableState";
      return connectElem;
    }
    /**
     * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
     */
    static createContentElement() {
      const connectContentElem = document.createElement("div");
      connectContentElem.id = "connectButton";
      connectContentElem.innerHTML = "Click to start";
      return connectContentElem;
    }
    /**
     * Construct a connect overlay with a connection button.
     * @param parentElem - the parent element this overlay will be inserted into.
     */
    constructor(parentElem) {
      super(parentElem, _ConnectOverlay.createRootElement(), _ConnectOverlay.createContentElement());
      this.rootElement.addEventListener("click", () => {
        this.activate();
      });
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/DisconnectOverlay.js
  var DisconnectOverlay = class _DisconnectOverlay extends ActionOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const disconnectOverlayHtml = document.createElement("div");
      disconnectOverlayHtml.id = "disconnectOverlay";
      disconnectOverlayHtml.className = "clickableState";
      return disconnectOverlayHtml;
    }
    /**
     * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
     */
    static createContentElement() {
      const disconnectOverlayHtmlContainer = document.createElement("div");
      disconnectOverlayHtmlContainer.id = "disconnectButton";
      disconnectOverlayHtmlContainer.innerHTML = "Click To Restart";
      return disconnectOverlayHtmlContainer;
    }
    /**
     * Construct a disconnect overlay with a retry connection icon.
     * @param parentElem - the parent element this overlay will be inserted into.
     */
    constructor(parentElem) {
      super(parentElem, _DisconnectOverlay.createRootElement(), _DisconnectOverlay.createContentElement());
      this.rootElement.addEventListener("click", () => {
        this.activate();
      });
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/PlayOverlay.js
  var PlayOverlay = class _PlayOverlay extends ActionOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const playElem = document.createElement("div");
      playElem.id = "playOverlay";
      playElem.className = "clickableState";
      return playElem;
    }
    /**
     * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
     */
    static createContentElement() {
      const playOverlayHtmlInner = document.createElement("img");
      playOverlayHtmlInner.id = "playButton";
      playOverlayHtmlInner.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPEAAAD5CAYAAAD2mNNkAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMjHxIGmVAAASgklEQVR4Xu2dC7BdVX2HqUCCIRASCPjAFIQREBRBBSRYbFOt8lIrFUWRFqXWsT5wbItUqFWs0KqIMPKoYEWpRS06KDjS1BeVFkVQbCw+wCfiAwGhCKWP9PuZtU24uTe59zz22Y/vm/nGkXtz7jlrr9+sdfZea/03Wb169QtxGW62iYi0D8L7NbwYj8EdcdPyIxFpA4T2P/F/8Ua8CI/GhPnXyq+ISJMhrAlxxX9hRuYL8Sh8SPk1EWkqBHXdEFfcg6vw3fhs3Kb8uog0DQI6XYgr8rOvYsJ8OM4v/0xEmkIJ6ob4P8zIfANegCvQMIs0BQK5sRBXJMy/wIzM5+ByXFBeRkQmBUGcbYjX5S5MmM/AA3CL8nIiUjcEcJAQV9yBX8a/wSeiz5hF6obgDRPikGfMCfOX8DTcu7y0iNQBoRs2xBX/g3diwvwm3Kn8CREZJ4RtVCGuqMKcu9kn4xJ09ZfIuCBgow5xyJ3sTLNzAywrwF6J26NhFhk1BGscIV6XhPluvA6Pxx3KnxaRUUCoxh3iioQ5z5n/BY/FJeUtiMgwEKa6QlyRMN+Hn8Hn4ZblrYjIIBCiukMc8p25Ws6ZMD+zvB0RmSsEaBIhnkrew5V4EHrCiMhcKAFqCv+Nl+J+uBC9my2yMQhKk0Jcke/M78Gsy06YH1TerohMhYA0McQVP8Nz8UDcCl2bLTIVgtHkEFd8D8/E/XFrdGQWqSAQbQhxyKOpm/B03Ac9MkgkEIa2hLgiN78S5lPx0bgIvQEm/YUAtC3EFQnzzfgnuDc6zZZ+Qsdva4jX5Sv4atwXHZmlX9DhuxDikC2Qn8dXYUbmReUjinQbOntXQlyRTRafwldgwrxV+agi3YRO3rUQV/wcV+LL8DHoyZzSTejcXQ1xRc7/uhyzl3kv3Lx8dJFuQKfueohDnjFnZP4o/j7m0ZQH4Es3oDP3IcQV2f6YMF+COZjgUeiZ2dJu6MR9CvG63ILvx4zMCfO80iQi7YLO29cQV3wb34spsr4rumBE2gWdtu8hDln99S1MXeYX4M6leUSaDx3WEK8lRdYT5lR/zPlfnswpzYeOaojXJ4cSfB3Pw+fgtug0W5oJndMQT0/uZGeaXZVyfTZuV5pNpDnQMQ3xxsk0O9Ufz8ZDcdvSfCKThw5piGdP2ioF496JT0c3WcjkKR1T5kYWjCTM78DfQheMyOSgAxriwch35lR/vAbPwOXozS+pHzqeIR6Oal12wvx2fBy6yULqgw5niEdDwpyR+VpMkfXsmHIpp4wfOpohHj234RfwFNwDnWbL+KCDGeLxkJH5p3g1vg53K00uMlroXIZ4vGTBSMJ8FeZkzmWl6UVGA53KENfD/ZiyNCmynvO/FpdLIDIcdCZDXC8ZmfOd+d/wJejZXzIcdCJDXD95xpwjdnP+V74zH4Wu/pLBoPMY4smSMN+FKbJ+BBpmmRt0GkPcDBLmu/FjeAi6lFNmB53FEDeHTLPzaCoj80dwBfqMWTYMncQQN5esAPsw7lcul8j60EEMcfPJDbD3YU7l3KxcOpE10CkMcTvIVDvfmc/E3XELtPqjGOKWkhVgp+GemDD7vbnP0AEMcXtJkfU34GNxAToy9xEuvCFuP6vwJMyOqYXl0kpf4KIb4m5QncyZTRapZGGY+wIX2xB3i3vxOswmi13QaXbX4QIb4m6SY3a/iMdh7mYb5q7ChTXE3aXaaLESq7rMW5ZLL12Bi2qI+8E9eDkmzLuhYe4KXExD3B8yMt+Ol+KL0CLrXYCLaIj7R8J8K16CR6PLOdsMF88Q95fsmPoRXozPxdzNdvVX2+CiGWLJza+EOXWZj8Sd0APw2wIXyxBLqPYy34LnY8K8DA1z0+EiGWKZSgJ9I74LU2R9R3Sa3VS4OIZYZqJaynkWpsj6w0u3kSbBhTHEsjHuwxswpVwPw6Wl+0gT4IIYYpkNmWKnr1yPqf54KG5VupFMknJhRGZLwpzVX6n++DZ8GrpjapJwAQyxDELCnB1TqWTx1/gUdGSeBDS8IZZBSZBjzv76PP4VHoSGuU5ocEMsoyBhTsG4VH98Ix6A80s3k3FCQxtiGSVZMPIT/CwmzPuhz5jHCQ1siGUcZClnwvxpPAX3LF1ORg2Na4hlXGSKnQUjCfNn8PX4CNy0dD8ZBTSoIZZxkzBXI/Pn8ATMumzDPApoSEMsdZEw5zvzDzHT7JdjwuzZX8NAAxpimQSZZifMn8Tj8aGlS8pcofEMsUyKjMw5lTOnjHwcc2TQktI1ZbbQaIZYJk3CnE0WGZmvwOeh+5hnC41liKUpVCNzwvwJPBy9+bUxaCRDLE0jYb4fU/0x0+yD8cGly8pUaBxDLE0kQa7CfCfmML8D0SN2p0KjGGJpOglztWgkh/k9CT1it4LGMMTSFhLmLBrJ3exzcJ/SjfsNDWGIpY0k0D/AM/GRpTv3ExrAEEubqVaAnY5LsX93s/nQhli6QLUF8nWYI3bnYT+Wc/JBDbF0heqO9jfwlfhInI/dDjMf0BBLF0mYr8NsskiNqS2wm2Hmgxli6TJ5zpwjg/4Qd8buLRrhQxli6QM5ZjdHBh2H+c7cnUUjfBhDLH0hU+y7cCU+H7OXeV6JQnvhQxhi6RsJc0bmy/BZ+MsbYCUS7YM3b4ilryTM2QL5QUzBuHxnbt80mzdtiEVWr74NL8KUck2R9faMzLxZQyyyhozMWcp5If4uJszNP5yAN2mIRR5IVn/djOfhEdjsw/x4c4ZYZHryjPkmPBsPwYeV2DQL3pghFpmZTLFzZFDCnLrMz8DtsTkbLXgzhlhk4yTM2cu8CrNjKiNzwjz5OlO8CUMsMjcS5qzLfgumyPr2JU6TgTdgiEUGoyqynrrMv42TOTObP2yIRQYn0+ws5bwaU8r1N3HrEq964A8aYpHhSZjvwBSMS5gPwnrWZfOHDLHI6Mgz5hyxm4Jxf4kH4HjDzB8wxCKjJ2HONPuf8c9xHxzPXmZe2BCLjIdMsWMqWfwTnoiPwdGOzLygIRYZPwlzVWPqtbgXjmbBCC9kiEXqI8+Ys8nicnwN7laiODi8iCEWqZeMylmXnTCnYFxO5tyxRHLu8I8NschkSJizLvv7mJH5pbgY57Zjin9giEUmSzUyfw9TZP1Y3LZEdOPwy4ZYpBkkzKn++B38KB6F25Wozgy/ZIhFmkXCnLO/vosfwpwysqhEdn34oSEWaSYJ8y8w0+wP4GG4/oIR/qMhFmk2VZgzzU6Ys2Nq7T5m/o8hFmkHCXO2PybMF+O++CBDLNIuEuSsy8535lvxZEMs0j6qWszZJbXUEIu0i1vwrZhqFZv5nVikPWTqfA5mF9QDD+fjPxhikeaR777xdrwAn1Aiuz780BCLNIvsdMqBAqkNtRw3XBeKXzDEIpMno27Cezdeik/GBSWmG4ZfNMQikyPhzXrpVGXM6R8rcG7lVfkHhlikfhLe7FzKo6KV+Hu45m7zXOEfGmKReske4oT3k3gMblniOBi8gCEWqYeMvD/GK/F43KHEcDh4IUMsMl5yw+pHmLOoX4aDH8UzHbygIRYZD/nem5H3KjwBd8LRV1HkRQ2xyGjJ3eacNZ1iayfhr+P46hnz4oZYZDRk2pzwph7TX+CuOP76xfwRQywyHNlVVIX3VHx8iVc98AcNscjgZJFGypq+GffHwZ71DgN/1BCLzJ2f47/iWzBlTId71jsM/HFDLDI7crf5HrwG34YHY70FxaeDN2GIRTZMwpvjcK7Fd+BTcfLhreDNGGKRmcnIez2+Ew/FhTi3MivjhjdkiEXWJ0fEfhXPwmfi4hKZ5sGbM8Qia8n65lX4LkzlhYeVqDQX3qQhFlnzrPc/8FzMtsBl2Kxp80zwRg2x9J0cxn4epoBZlkjW/6x3GHjDhlj6SJZI5gTJ9+DzMeHdvMSiXfDGDbH0iWpbYMqgJLy7YLtG3qnwAQyx9IVsC7wEX4C74/h2FtUJH8QQS9fJUTg5QfI43APnle7fDfhAhli6So5//Ri+GBPeya1vHid8MEMsXSMH0X0CX4J74cLS3bsJH9AQS1fITavs6f1VeLEdz3qHgQ9piKXtZHNC1jfnELpfTpux++Gt4MMaYmkrmTZ/GV+LCW+3p80zwQc3xNI2skTyBswhdHtic7YFTgIawBBLm7gRT8HH4dbYn2nzTNAIhljaQCrkvwkT3tywGv8pkm2BxjDE0lRyokbOsjoDUyE/N6wM71RoFEMsTSPhvRPfjY/GBei0eSZoHEMsTeJ2/ADug+3cVVQ3NJQhliaQkfcf8SnoqDsXaDBDLJMij4ruxcvwaejIOwg0nCGWusnyyIT3CjwM+7lIY1TQgIZY6iA3qzLyZmdRSn0eic09QbJN0JCGWMZJwpuR9w78Er4Qu7klcFLQoIZYxkXq9OZuc2oWZXNCv5dHjgsa1hDLqKnCm2qB2Zzw0NLdZBzQwIZYRkWmzT/DhPdE3KV0MxknNLQhlmHJ996ENwXHsjkhq6xcHlkXNLYhlkFJeHPDKhvyszkh4W338a9thEY3xDJX8qgoGxMS3tTpfSzOL11K6obGN8QyWxLeLI/MtDmlPvdHp82ThotgiGU2ZOStwrsCXSLZFLgYhlg2xF2Yc6zOxqejCzWaBhfFEMt0pMj2VzB1eg/BJaXLSNPg4hhiqcjd5izUSIX8lPp8Fi4tXUWaChfJEEtIhfwU2b4QU2R7O3RfbxvgQhnifpOD17+JCW9KfS5F7zi3CS6YIe4nOXj9W/h3eAw+vHQJaRtcPEPcL/Ks92a8CI/FXdFpc5vhAhri/vB9/Hv8A3wUukSyC3AhDXH3+Sn+Ax6PqZDvEskuwQU1xN2kOgonJ0im1Gc2J2xRLrt0CS6sIe4W1c6ij2NG3lROmFcut3QRLrAh7g4J75X4R7g3Gt4+wIU2xO0n0+ZP4aswBcdc39wnuOCGuL3kWe/n8DW4Ly4ql1X6BBfeELeTL+AJ+ATcBn3W21e4+Ia4PeSO89fwT/GJuAhdItl36ASGuPlkZ9G38fWYo3Ay8hpeWQOdwRA3lxwBexO+GVPq07Insj50DEPcTLK++e2Yc6wWo995ZXroHIa4WdyKOQpnOWbavGm5VCLTQycxxM0gp0iej0/G3LAyvDI76CyGeHJUx+G8Hw9Ewytzh05jiCdDDqK7HA/Aheh3XhkMOo8hrpe096fxd9D9vDI8pVPJ+LkXP4vPQafMMjroUIZ4fOQ7b9Y3X4U5x8oi2zJ66FiGePRkeWROkfwiHoee3Szjgw5miEdDRt14D+bw9ZfjDqWZRcYHHc0QD091FE6OgP0z9OB1qQ86myEenKxtTngz8r4BHXmlfuh4hnjuJLwp9Zlqgafh7qU5ReqHDmiIZ0+mzVkeeQO+FR9fmlFkctARDfHsSJ3ef8dqZ5GH0EkzoDMa4pnJ3ea0T07TOAezvnlBaTqRZlA6qTyQhDdrm1fhBXgwGl5pJnROQ7yW6jlvwvtefAZuXppKpJmUTitrp80p9Zn1zQ8uTSTSbOisfQ9xps2pkJ/wPhe3K00j0g7otH0N8f34dXwfHo0W2ZZ2QuftY4izPDKnabwIH4Ee/yrthQ7clxBnldUP8BJ8MSa87uuV9kNH7nqIc4ZVwvshfCkuQ8Mr3YEO3dUQZ4nkD/HDmFKfe5SPLNIt6NxdDHHC+xF8BabsiSOvdBc6eJdCfBtehglvimz7rFe6Dx29CyHOQo0r8NWYOr0W2Zb+QIdva4izRDLPeldi6vSm1OfC8rFE+gMdv40hznu+GlMhfz/cEj0OR/oJnb9NIc57vQZPxCehI69ICUbTydnN1+LJmPAuKW9fRAhEk0OcZ73XYw6hOwg9v1lkKgSjqSHO5oRT8TdwKbq+WWQ6CEeTQpw7zlmocTqmTm/Ob7bomMiGICRNCHGmzT/BszClPjPyuspKZDYQlkmH+Mf4t7gct0enzSJzgdBMKsQJ70X4VHTkFRkUwlN3iFM54YN4KG6LHkQnMgyEqK4Q51nvpZjwZuQ1vCKjgDDVEeIr8XBMeL3bLDJKCNW4QpyR9zo8ArdBb1iJjAPCNeoQJ7ypFngszkc3JoiME0I2qhDnWW8Kjv0xujFBpC4I3DAhzgqrHESXUp/Z0/uQ8rIiUhcEb5AQJ7z34TfwJNy5vJyI1A0BnG2IE9yYsiffwTfizuh3XpFJQghnE+J83014v4upkL8r+qhIpAkQxg2FOOHNzzNtPhf3REdekSZRQjqVTJtzguSNeD4eWH5dRJoGAZ0a4rvxm3ghrkCnzSJNhpBWIc7/plpgwpudRZ7dLNIGCOvtJbwX42G4uPxIRNoAoU2d3iNxUflPItIaNtnk/wEGBoMdpECGHAAAAABJRU5ErkJggg==";
      playOverlayHtmlInner.alt = "Start Streaming";
      return playOverlayHtmlInner;
    }
    /**
     * Construct a connect overlay with a connection button.
     * @param parentElem - the parent element this overlay will be inserted into.
     */
    constructor(parentElem) {
      super(parentElem, _PlayOverlay.createRootElement(), _PlayOverlay.createContentElement());
      this.rootElement.addEventListener("click", () => {
        this.activate();
      });
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/TextOverlay.js
  var TextOverlay = class extends OverlayBase {
    /**
     * Construct a text overlay
     * @param rootDiv - the root element this overlay will be inserted into
     * @param rootElement - the root element that is the overlay
     * @param textElement - an element that contains text for the action overlay
     */
    constructor(rootDiv, rootElement, textElement) {
      super(rootDiv, rootElement, textElement);
    }
    /**
     * Update the text overlays inner text
     * @param text - the update text to be inserted into the overlay
     */
    update(text) {
      if (text != null) {
        this.textElement.innerHTML = text;
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/InfoOverlay.js
  var InfoOverlay = class _InfoOverlay extends TextOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const infoOverlayHtml = document.createElement("div");
      infoOverlayHtml.id = "infoOverlay";
      infoOverlayHtml.className = "textDisplayState";
      return infoOverlayHtml;
    }
    /**
     * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
     */
    static createContentElement() {
      const infoOverlayHtmlInner = document.createElement("div");
      infoOverlayHtmlInner.id = "messageOverlayInner";
      return infoOverlayHtmlInner;
    }
    /**
     * Construct a connect overlay with a connection button.
     * @param parentElem - the parent element this overlay will be inserted into.
     */
    constructor(parentElem) {
      super(parentElem, _InfoOverlay.createRootElement(), _InfoOverlay.createContentElement());
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/ErrorOverlay.js
  var ErrorOverlay = class _ErrorOverlay extends TextOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const errorOverlayHtml = document.createElement("div");
      errorOverlayHtml.id = "errorOverlay";
      errorOverlayHtml.className = "textDisplayState";
      return errorOverlayHtml;
    }
    /**
     * @returns The created content element of this overlay, which contain whatever content this element contains, like text or a button.
     */
    static createContentElement() {
      const errorOverlayHtmlInner = document.createElement("div");
      errorOverlayHtmlInner.id = "errorOverlayInner";
      return errorOverlayHtmlInner;
    }
    /**
     * Construct a connect overlay with a connection button.
     * @param parentElem - the parent element this overlay will be inserted into.
     */
    constructor(parentElem) {
      super(parentElem, _ErrorOverlay.createRootElement(), _ErrorOverlay.createContentElement());
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Overlay/AFKOverlay.js
  var AFKOverlay = class _AFKOverlay extends ActionOverlay {
    /**
     * @returns The created root element of this overlay.
     */
    static createRootElement() {
      const afkOverlayHtml = document.createElement("div");
      afkOverlayHtml.id = "afkOverlay";
      afkOverlayHtml.className = "clickableState";
      return afkOverlayHtml;
    }
    /**
     * @returns The created content element of this overlay, which contain some text for an afk count down.
     */
    static createContentElement() {
      const afkOverlayHtmlInner = document.createElement("div");
      afkOverlayHtmlInner.id = "afkOverlayInner";
      afkOverlayHtmlInner.innerHTML = '<center>No activity detected<br>Disconnecting in <span id="afkCountDownNumber"></span> seconds<br>Click to continue<br></center>';
      return afkOverlayHtmlInner;
    }
    /**
     * Construct an Afk overlay
     * @param parentElement - the element this overlay will be inserted into
     */
    constructor(rootDiv) {
      super(rootDiv, _AFKOverlay.createRootElement(), _AFKOverlay.createContentElement());
      this.rootElement.addEventListener("click", () => {
        this.activate();
      });
    }
    /**
     * Update the count down spans number for the overlay
     * @param countdown - the count down number to be inserted into the span for updating
     */
    updateCountdown(countdown) {
      this.textElement.innerHTML = `<center>No activity detected<br>Disconnecting in <span id="afkCountDownNumber">${countdown}</span> seconds<br>Click to continue<br></center>`;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/FullscreenIcon.js
  var FullScreenIconBase = class {
    get rootElement() {
      return this._rootElement;
    }
    set rootElement(element) {
      element.onclick = () => this.toggleFullscreen();
      this._rootElement = element;
    }
    constructor() {
      this.isFullscreen = false;
      document.addEventListener("webkitfullscreenchange", () => this.onFullscreenChange(), false);
      document.addEventListener("mozfullscreenchange", () => this.onFullscreenChange(), false);
      document.addEventListener("fullscreenchange", () => this.onFullscreenChange(), false);
      document.addEventListener("MSFullscreenChange", () => this.onFullscreenChange(), false);
    }
    /**
     * Makes the document or fullscreenElement fullscreen.
     */
    toggleFullscreen() {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          void document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          void document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          void document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          void document.msExitFullscreen();
        }
      } else {
        const element = this.fullscreenElement;
        if (!element) {
          return;
        }
        if (element.requestFullscreen) {
          void element.requestFullscreen();
        } else if (element.mozRequestFullscreen) {
          void element.mozRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          void element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          void element.msRequestFullscreen();
        } else if (element.webkitEnterFullscreen) {
          element.webkitEnterFullscreen();
        }
      }
      this.onFullscreenChange();
    }
    /**
     * Handles the fullscreen button on change
     */
    onFullscreenChange() {
      this.isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement && document.msFullscreenElement !== null || document.fullscreenElement && document.fullscreenElement !== null;
    }
  };
  var FullScreenIconExternal = class extends FullScreenIconBase {
    constructor(externalButton) {
      super();
      this.rootElement = externalButton;
    }
  };
  var FullScreenIcon = class extends FullScreenIconBase {
    constructor() {
      super();
      const createdButton = document.createElement("button");
      createdButton.type = "button";
      createdButton.classList.add("UiTool");
      createdButton.id = "fullscreen-btn";
      createdButton.appendChild(this.maximizeIcon);
      createdButton.appendChild(this.minimizeIcon);
      createdButton.appendChild(this.tooltipText);
      this.rootElement = createdButton;
    }
    get tooltipText() {
      if (!this._tooltipText) {
        this._tooltipText = document.createElement("span");
        this._tooltipText.classList.add("tooltiptext");
        this._tooltipText.innerHTML = "Fullscreen";
      }
      return this._tooltipText;
    }
    get maximizeIcon() {
      if (!this._maximizeIcon) {
        this._maximizeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._maximizeIcon.setAttributeNS(null, "id", "maximizeIcon");
        this._maximizeIcon.setAttributeNS(null, "x", "0px");
        this._maximizeIcon.setAttributeNS(null, "y", "0px");
        this._maximizeIcon.setAttributeNS(null, "viewBox", "0 0 384.97 384.97");
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgGroup.classList.add("svgIcon");
        this._maximizeIcon.appendChild(svgGroup);
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttributeNS(null, "d", "M384.97,12.03c0-6.713-5.317-12.03-12.03-12.03H264.847c-6.833,0-11.922,5.39-11.934,12.223c0,6.821,5.101,11.838,11.934,11.838h96.062l-0.193,96.519c0,6.833,5.197,12.03,12.03,12.03c6.833-0.012,12.03-5.197,12.03-12.03l0.193-108.369c0-0.036-0.012-0.06-0.012-0.084C384.958,12.09,384.97,12.066,384.97,12.03z");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttributeNS(null, "d", "M120.496,0H12.403c-0.036,0-0.06,0.012-0.096,0.012C12.283,0.012,12.247,0,12.223,0C5.51,0,0.192,5.317,0.192,12.03L0,120.399c0,6.833,5.39,11.934,12.223,11.934c6.821,0,11.838-5.101,11.838-11.934l0.192-96.339h96.242c6.833,0,12.03-5.197,12.03-12.03C132.514,5.197,127.317,0,120.496,0z");
        const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path3.setAttributeNS(null, "d", "M120.123,360.909H24.061v-96.242c0-6.833-5.197-12.03-12.03-12.03S0,257.833,0,264.667v108.092c0,0.036,0.012,0.06,0.012,0.084c0,0.036-0.012,0.06-0.012,0.096c0,6.713,5.317,12.03,12.03,12.03h108.092c6.833,0,11.922-5.39,11.934-12.223C132.057,365.926,126.956,360.909,120.123,360.909z");
        const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path4.setAttributeNS(null, "d", "M372.747,252.913c-6.833,0-11.85,5.101-11.838,11.934v96.062h-96.242c-6.833,0-12.03,5.197-12.03,12.03s5.197,12.03,12.03,12.03h108.092c0.036,0,0.06-0.012,0.084-0.012c0.036-0.012,0.06,0.012,0.096,0.012c6.713,0,12.03-5.317,12.03-12.03V264.847C384.97,258.014,379.58,252.913,372.747,252.913z");
        svgGroup.appendChild(path1);
        svgGroup.appendChild(path2);
        svgGroup.appendChild(path3);
        svgGroup.appendChild(path4);
      }
      return this._maximizeIcon;
    }
    get minimizeIcon() {
      if (!this._minimizeIcon) {
        this._minimizeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._minimizeIcon.setAttributeNS(null, "id", "minimizeIcon");
        this._minimizeIcon.setAttributeNS(null, "x", "0px");
        this._minimizeIcon.setAttributeNS(null, "y", "0px");
        this._minimizeIcon.setAttributeNS(null, "viewBox", "0 0 385.331 385.331");
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgGroup.classList.add("svgIcon");
        this._minimizeIcon.appendChild(svgGroup);
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttributeNS(null, "d", "M264.943,156.665h108.273c6.833,0,11.934-5.39,11.934-12.211c0-6.833-5.101-11.85-11.934-11.838h-96.242V36.181c0-6.833-5.197-12.03-12.03-12.03s-12.03,5.197-12.03,12.03v108.273c0,0.036,0.012,0.06,0.012,0.084c0,0.036-0.012,0.06-0.012,0.096C252.913,151.347,258.23,156.677,264.943,156.665z");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttributeNS(null, "d", "M120.291,24.247c-6.821,0-11.838,5.113-11.838,11.934v96.242H12.03c-6.833,0-12.03,5.197-12.03,12.03c0,6.833,5.197,12.03,12.03,12.03h108.273c0.036,0,0.06-0.012,0.084-0.012c0.036,0,0.06,0.012,0.096,0.012c6.713,0,12.03-5.317,12.03-12.03V36.181C132.514,29.36,127.124,24.259,120.291,24.247z");
        const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path3.setAttributeNS(null, "d", "M120.387,228.666H12.115c-6.833,0.012-11.934,5.39-11.934,12.223c0,6.833,5.101,11.85,11.934,11.838h96.242v96.423c0,6.833,5.197,12.03,12.03,12.03c6.833,0,12.03-5.197,12.03-12.03V240.877c0-0.036-0.012-0.06-0.012-0.084c0-0.036,0.012-0.06,0.012-0.096C132.418,233.983,127.1,228.666,120.387,228.666z");
        const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path4.setAttributeNS(null, "d", "M373.3,228.666H265.028c-0.036,0-0.06,0.012-0.084,0.012c-0.036,0-0.06-0.012-0.096-0.012c-6.713,0-12.03,5.317-12.03,12.03v108.273c0,6.833,5.39,11.922,12.223,11.934c6.821,0.012,11.838-5.101,11.838-11.922v-96.242H373.3c6.833,0,12.03-5.197,12.03-12.03S380.134,228.678,373.3,228.666z");
        svgGroup.appendChild(path1);
        svgGroup.appendChild(path2);
        svgGroup.appendChild(path3);
        svgGroup.appendChild(path4);
      }
      return this._minimizeIcon;
    }
    onFullscreenChange() {
      super.onFullscreenChange();
      const minimize = this.minimizeIcon;
      const maximize = this.maximizeIcon;
      if (this.isFullscreen) {
        minimize.style.display = "inline";
        minimize.style.transform = "translate(0, 0)";
        maximize.style.display = "none";
      } else {
        minimize.style.display = "none";
        maximize.style.display = "inline";
        maximize.style.transform = "translate(0, 0)";
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/SettingsIcon.js
  var SettingsIcon = class {
    /**
     * Get the the button containing the settings icon.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("button");
        this._rootElement.type = "button";
        this._rootElement.classList.add("UiTool");
        this._rootElement.id = "settingsBtn";
        this._rootElement.appendChild(this.settingsIcon);
        this._rootElement.appendChild(this.tooltipText);
      }
      return this._rootElement;
    }
    get tooltipText() {
      if (!this._tooltipText) {
        this._tooltipText = document.createElement("span");
        this._tooltipText.classList.add("tooltiptext");
        this._tooltipText.innerHTML = "Settings";
      }
      return this._tooltipText;
    }
    get settingsIcon() {
      if (!this._settingsIcon) {
        this._settingsIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._settingsIcon.setAttributeNS(null, "id", "settingsIcon");
        this._settingsIcon.setAttributeNS(null, "x", "0px");
        this._settingsIcon.setAttributeNS(null, "y", "0px");
        this._settingsIcon.setAttributeNS(null, "viewBox", "0 0 478.703 478.703");
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgGroup.classList.add("svgIcon");
        this._settingsIcon.appendChild(svgGroup);
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttributeNS(null, "d", "M454.2,189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8,7.1-27.9-3.2-38.1l-29.8-29.8			c-5.6-5.6-13-8.7-20.9-8.7c-6.2,0-12.1,1.9-17.1,5.5l-27.8,19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2			c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5,0-26.8,10.4-29.2,24.7l-5.8,34c-11.2,3.5-22.1,8.1-32.5,13.7l-27.5-19.8			c-5-3.6-11-5.5-17.2-5.5c-7.9,0-15.4,3.1-20.9,8.7l-29.9,29.8c-10.2,10.2-11.6,26.3-3.2,38.1l20,28.1			c-5.5,10.5-9.9,21.4-13.3,32.7l-33.2,5.6c-14.3,2.4-24.7,14.7-24.7,29.2v42.1c0,14.5,10.4,26.8,24.7,29.2l34,5.8			c3.5,11.2,8.1,22.1,13.7,32.5l-19.7,27.4c-8.4,11.8-7.1,27.9,3.2,38.1l29.8,29.8c5.6,5.6,13,8.7,20.9,8.7c6.2,0,12.1-1.9,17.1-5.5			l28.1-20c10.1,5.3,20.7,9.6,31.6,13l5.6,33.6c2.4,14.3,14.7,24.7,29.2,24.7h42.2c14.5,0,26.8-10.4,29.2-24.7l5.7-33.6			c11.3-3.5,22.2-8,32.6-13.5l27.7,19.8c5,3.6,11,5.5,17.2,5.5l0,0c7.9,0,15.3-3.1,20.9-8.7l29.8-29.8c10.2-10.2,11.6-26.3,3.2-38.1			l-19.8-27.8c5.5-10.5,10.1-21.4,13.5-32.6l33.6-5.6c14.3-2.4,24.7-14.7,24.7-29.2v-42.1			C478.9,203.801,468.5,191.501,454.2,189.101z M451.9,260.401c0,1.3-0.9,2.4-2.2,2.6l-42,7c-5.3,0.9-9.5,4.8-10.8,9.9			c-3.8,14.7-9.6,28.8-17.4,41.9c-2.7,4.6-2.5,10.3,0.6,14.7l24.7,34.8c0.7,1,0.6,2.5-0.3,3.4l-29.8,29.8c-0.7,0.7-1.4,0.8-1.9,0.8			c-0.6,0-1.1-0.2-1.5-0.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-0.6c-13.1,7.8-27.2,13.6-41.9,17.4c-5.2,1.3-9.1,5.6-9.9,10.8l-7.1,42			c-0.2,1.3-1.3,2.2-2.6,2.2h-42.1c-1.3,0-2.4-0.9-2.6-2.2l-7-42c-0.9-5.3-4.8-9.5-9.9-10.8c-14.3-3.7-28.1-9.4-41-16.8			c-2.1-1.2-4.5-1.8-6.8-1.8c-2.7,0-5.5,0.8-7.8,2.5l-35,24.9c-0.5,0.3-1,0.5-1.5,0.5c-0.4,0-1.2-0.1-1.9-0.8l-29.8-29.8			c-0.9-0.9-1-2.3-0.3-3.4l24.6-34.5c3.1-4.4,3.3-10.2,0.6-14.8c-7.8-13-13.8-27.1-17.6-41.8c-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2			c-1.3-0.2-2.2-1.3-2.2-2.6v-42.1c0-1.3,0.9-2.4,2.2-2.6l41.7-7c5.3-0.9,9.6-4.8,10.9-10c3.7-14.7,9.4-28.9,17.1-42			c2.7-4.6,2.4-10.3-0.7-14.6l-24.9-35c-0.7-1-0.6-2.5,0.3-3.4l29.8-29.8c0.7-0.7,1.4-0.8,1.9-0.8c0.6,0,1.1,0.2,1.5,0.5l34.5,24.6			c4.4,3.1,10.2,3.3,14.8,0.6c13-7.8,27.1-13.8,41.8-17.6c5.1-1.4,9-5.6,9.9-10.8l7.2-42.3c0.2-1.3,1.3-2.2,2.6-2.2h42.1			c1.3,0,2.4,0.9,2.6,2.2l7,41.7c0.9,5.3,4.8,9.6,10,10.9c15.1,3.8,29.5,9.7,42.9,17.6c4.6,2.7,10.3,2.5,14.7-0.6l34.5-24.8			c0.5-0.3,1-0.5,1.5-0.5c0.4,0,1.2,0.1,1.9,0.8l29.8,29.8c0.9,0.9,1,2.3,0.3,3.4l-24.7,34.7c-3.1,4.3-3.3,10.1-0.6,14.7			c7.8,13.1,13.6,27.2,17.4,41.9c1.3,5.2,5.6,9.1,10.8,9.9l42,7.1c1.3,0.2,2.2,1.3,2.2,2.6v42.1H451.9z");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttributeNS(null, "d", "M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z");
        svgGroup.appendChild(path1);
        svgGroup.appendChild(path2);
      }
      return this._settingsIcon;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/StatsIcon.js
  var StatsIcon = class {
    /**
     * Get the the button containing the stats icon.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("button");
        this._rootElement.type = "button";
        this._rootElement.classList.add("UiTool");
        this._rootElement.id = "statsBtn";
        this._rootElement.appendChild(this.statsIcon);
        this._rootElement.appendChild(this.tooltipText);
      }
      return this._rootElement;
    }
    get tooltipText() {
      if (!this._tooltipText) {
        this._tooltipText = document.createElement("span");
        this._tooltipText.classList.add("tooltiptext");
        this._tooltipText.innerHTML = "Information";
      }
      return this._tooltipText;
    }
    get statsIcon() {
      if (!this._statsIcon) {
        this._statsIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._statsIcon.setAttributeNS(null, "id", "statsIcon");
        this._statsIcon.setAttributeNS(null, "x", "0px");
        this._statsIcon.setAttributeNS(null, "y", "0px");
        this._statsIcon.setAttributeNS(null, "viewBox", "0 0 330 330");
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgGroup.classList.add("svgIcon");
        this._statsIcon.appendChild(svgGroup);
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttributeNS(null, "d", "M165,0.008C74.019,0.008,0,74.024,0,164.999c0,90.977,74.019,164.992,165,164.992s165-74.015,165-164.992C330,74.024,255.981,0.008,165,0.008z M165,299.992c-74.439,0-135-60.557-135-134.992S90.561,30.008,165,30.008s135,60.557,135,134.991C300,239.436,239.439,299.992,165,299.992z");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttributeNS(null, "d", "M165,130.008c-8.284,0-15,6.716-15,15v99.983c0,8.284,6.716,15,15,15s15-6.716,15-15v-99.983C180,136.725,173.284,130.008,165,130.008z");
        const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path3.setAttributeNS(null, "d", "M165,70.011c-3.95,0-7.811,1.6-10.61,4.39c-2.79,2.79-4.39,6.66-4.39,10.61s1.6,7.81,4.39,10.61c2.79,2.79,6.66,4.39,10.61,4.39s7.81-1.6,10.609-4.39c2.79-2.8,4.391-6.66,4.391-10.61s-1.601-7.82-4.391-10.61C172.81,71.61,168.95,70.011,165,70.011z");
        svgGroup.appendChild(path1);
        svgGroup.appendChild(path2);
        svgGroup.appendChild(path3);
      }
      return this._statsIcon;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/XRIcon.js
  var XRIcon = class {
    /**
     * Get the the button containing the XR icon.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("button");
        this._rootElement.type = "button";
        this._rootElement.classList.add("UiTool");
        this._rootElement.id = "xrBtn";
        this._rootElement.appendChild(this.xrIcon);
        this._rootElement.appendChild(this.tooltipText);
      }
      return this._rootElement;
    }
    get tooltipText() {
      if (!this._tooltipText) {
        this._tooltipText = document.createElement("span");
        this._tooltipText.classList.add("tooltiptext");
        this._tooltipText.innerHTML = "XR";
      }
      return this._tooltipText;
    }
    get xrIcon() {
      if (!this._xrIcon) {
        this._xrIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._xrIcon.setAttributeNS(null, "id", "xrIcon");
        this._xrIcon.setAttributeNS(null, "x", "0px");
        this._xrIcon.setAttributeNS(null, "y", "0px");
        this._xrIcon.setAttributeNS(null, "viewBox", "0 0 100 100");
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgGroup.classList.add("svgIcon");
        this._xrIcon.appendChild(svgGroup);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttributeNS(null, "d", "M29 41c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm42-14c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm12-31H17c-6.6 0-12 5.4-12 12v28c0 6.6 5.4 12 12 12h14.5c3.5 0 6.8-1.5 9-4.1l3.5-4c1.5-1.7 3.7-2.7 6-2.7s4.5 1 6 2.7l3.5 4c2.3 2.6 5.6 4.1 9 4.1H83c6.6 0 12-5.4 12-12V36c0-6.6-5.4-12-12-12zm8 40c0 4.4-3.6 8-8 8H68.5c-2.3 0-4.5-1-6-2.7l-3.5-4c-2.3-2.6-5.6-4.1-9-4.1-3.5 0-6.8 1.5-9 4.1l-3.5 4C36 71 33.8 72 31.5 72H17c-4.4 0-8-3.6-8-8V36c0-4.4 3.6-8 8-8h66c4.4 0 8 3.6 8 8v28z");
        svgGroup.appendChild(path);
      }
      return this._xrIcon;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/UIConfigurationTypes.js
  var ExtraFlags = class {
  };
  ExtraFlags.LightMode = "LightMode";
  var SettingsSections = class {
  };
  SettingsSections.PixelStreaming = "Pixel Streaming";
  SettingsSections.UI = "UI";
  SettingsSections.Input = "Input";
  SettingsSections.Encoder = "Encoder";
  SettingsSections.WebRTC = "WebRTC";
  SettingsSections.Commands = "Commands";
  var StatsSections = class {
  };
  StatsSections.SessionStats = "Session Stats";
  StatsSections.LatencyStats = "Latency Stats";
  StatsSections.LatencyTest = "Latency Test";
  StatsSections.DataChannelLatencyTest = "Data Channel Latency Test";
  var UIElementCreationMode;
  (function(UIElementCreationMode2) {
    UIElementCreationMode2[UIElementCreationMode2["CreateDefaultElement"] = 0] = "CreateDefaultElement";
    UIElementCreationMode2[UIElementCreationMode2["UseCustomElement"] = 1] = "UseCustomElement";
    UIElementCreationMode2[UIElementCreationMode2["Disable"] = 2] = "Disable";
  })(UIElementCreationMode || (UIElementCreationMode = {}));
  function isPanelEnabled(config2) {
    return !config2 || !!config2 && config2.isEnabled;
  }
  function isSectionEnabled(config2, section) {
    return !config2 || !!config2 && (!Object.prototype.hasOwnProperty.call(config2.sectionVisibility, section) || Object.prototype.hasOwnProperty.call(config2.sectionVisibility, section) && config2.sectionVisibility[section]);
  }
  function isSettingEnabled(config2, setting) {
    return !config2 || !!config2 && (!Object.prototype.hasOwnProperty.call(config2.settingVisibility, setting) || Object.prototype.hasOwnProperty.call(config2.settingVisibility, setting) && config2.settingVisibility[setting]);
  }

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/Controls.js
  function shouldCreateButton(type) {
    return type === void 0 ? true : type.creationMode === UIElementCreationMode.CreateDefaultElement;
  }
  var Controls = class {
    /**
     * Construct the controls
     */
    constructor(config2) {
      this.config = config2;
      if (!config2 || shouldCreateButton(config2.statsButtonType)) {
        this.statsIcon = new StatsIcon();
      }
      if (!config2 || shouldCreateButton(config2.settingsButtonType)) {
        this.settingsIcon = new SettingsIcon();
      }
      if (!config2 || shouldCreateButton(config2.fullscreenButtonType)) {
        this.fullscreenIcon = new FullScreenIcon();
      }
      if (!config2 || shouldCreateButton(config2.xrIconType)) {
        this.xrIcon = new XRIcon();
      }
    }
    /**
     * Get the element containing the controls.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = "controls";
        if (this.fullscreenIcon) {
          this._rootElement.appendChild(this.fullscreenIcon.rootElement);
        }
        if (this.settingsIcon) {
          this._rootElement.appendChild(this.settingsIcon.rootElement);
        }
        if (this.statsIcon) {
          this._rootElement.appendChild(this.statsIcon.rootElement);
        }
        if (this.xrIcon) {
          void WebXRController.isSessionSupported("immersive-vr").then((supported) => {
            if (supported) {
              this._rootElement.appendChild(this.xrIcon.rootElement);
            }
          });
        }
        document.addEventListener("fullscreenchange", this.handleFullscreenChange.bind(this));
      }
      return this._rootElement;
    }
    handleFullscreenChange() {
      var _a;
      const isInFullscreen = !!document.fullscreenElement;
      if (isInFullscreen && ((_a = this.config) === null || _a === void 0 ? void 0 : _a.hideControlsInFullscreen)) {
        this._rootElement.style.visibility = "hidden";
      } else {
        this._rootElement.style.visibility = "visible";
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/LabelledButton.js
  var LabelledButton = class {
    constructor(label, buttonText) {
      this._label = label;
      this._buttonText = buttonText;
    }
    /**
     * Add a click listener to the button element.
     */
    addOnClickListener(onClickFunc) {
      this.button.addEventListener("click", onClickFunc);
    }
    /**
     * Get the HTMLInputElement for the button.
     */
    get button() {
      if (!this._button) {
        this._button = document.createElement("input");
        this._button.type = "button";
        this._button.value = this._buttonText;
        this._button.classList.add("overlay-button");
        this._button.classList.add("btn-flat");
      }
      return this._button;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.classList.add("setting");
        const settingsTextElem = document.createElement("div");
        settingsTextElem.innerText = this._label;
        this._rootElement.appendChild(settingsTextElem);
        const wrapperLabel = document.createElement("label");
        wrapperLabel.classList.add("btn-overlay");
        this._rootElement.appendChild(wrapperLabel);
        wrapperLabel.appendChild(this.button);
      }
      return this._rootElement;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/SettingsPanel.js
  var SettingsPanel = class {
    constructor() {
      this._rootElement = null;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = "settings-panel";
        this._rootElement.classList.add("panel-wrap");
        const panelElem = document.createElement("div");
        panelElem.classList.add("panel");
        this._rootElement.appendChild(panelElem);
        const settingsHeading = document.createElement("div");
        settingsHeading.id = "settingsHeading";
        settingsHeading.textContent = "Settings";
        panelElem.appendChild(settingsHeading);
        panelElem.appendChild(this.settingsCloseButton);
        panelElem.appendChild(this.settingsContentElement);
      }
      return this._rootElement;
    }
    get settingsContentElement() {
      if (!this._settingsContentElement) {
        this._settingsContentElement = document.createElement("div");
        this._settingsContentElement.id = "settingsContent";
      }
      return this._settingsContentElement;
    }
    get settingsCloseButton() {
      if (!this._settingsCloseButton) {
        this._settingsCloseButton = document.createElement("div");
        this._settingsCloseButton.id = "settingsClose";
      }
      return this._settingsCloseButton;
    }
    /**
     * Show settings panel.
     */
    show() {
      if (!this.rootElement.classList.contains("panel-wrap-visible")) {
        this.rootElement.classList.add("panel-wrap-visible");
      }
    }
    /**
     * Toggle the visibility of the settings panel.
     */
    toggleVisibility() {
      this.rootElement.classList.toggle("panel-wrap-visible");
    }
    /**
     * Hide settings panel.
     */
    hide() {
      if (this.rootElement.classList.contains("panel-wrap-visible")) {
        this.rootElement.classList.remove("panel-wrap-visible");
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/LatencyTest.js
  var LatencyTest = class {
    /**
     * Get the the button containing the stats icon.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("section");
        this._rootElement.classList.add("settingsContainer");
        const heading = document.createElement("div");
        heading.id = "latencyTestHeader";
        heading.classList.add("settings-text");
        heading.classList.add("settingsHeader");
        this._rootElement.appendChild(heading);
        const headingText = document.createElement("div");
        headingText.innerHTML = StatsSections.LatencyTest;
        heading.appendChild(headingText);
        heading.appendChild(this.latencyTestButton);
        const resultsParentElem = document.createElement("div");
        resultsParentElem.id = "latencyTestContainer";
        resultsParentElem.classList.add("d-none");
        this._rootElement.appendChild(resultsParentElem);
        resultsParentElem.appendChild(this.latencyTestResultsElement);
      }
      return this._rootElement;
    }
    get latencyTestResultsElement() {
      if (!this._latencyTestResultsElement) {
        this._latencyTestResultsElement = document.createElement("div");
        this._latencyTestResultsElement.id = "latencyStatsResults";
        this._latencyTestResultsElement.classList.add("StatsResult");
      }
      return this._latencyTestResultsElement;
    }
    get latencyTestButton() {
      if (!this._latencyTestButton) {
        this._latencyTestButton = document.createElement("input");
        this._latencyTestButton.type = "button";
        this._latencyTestButton.value = "Run Test";
        this._latencyTestButton.id = "btn-start-latency-test";
        this._latencyTestButton.classList.add("streamTools-button");
        this._latencyTestButton.classList.add("btn-flat");
      }
      return this._latencyTestButton;
    }
    /**
     * Populate the UI based on the latency test's results.
     * @param latencyTimings - The latency test results.
     */
    handleTestResult(latencyTimings) {
      Logger.Info(JSON.stringify(latencyTimings));
      let latencyStatsInnerHTML = "";
      if (latencyTimings.networkLatency !== void 0 && latencyTimings.networkLatency > 0) {
        latencyStatsInnerHTML += "<div>Net latency RTT (ms): " + latencyTimings.networkLatency + "</div>";
      }
      if (latencyTimings.EncodeMs !== void 0 && latencyTimings.EncodeMs > 0) {
        latencyStatsInnerHTML += "<div>UE Encode (ms): " + latencyTimings.EncodeMs + "</div>";
      }
      if (latencyTimings.CaptureToSendMs !== void 0 && latencyTimings.CaptureToSendMs > 0) {
        latencyStatsInnerHTML += "<div>UE Capture (ms): " + latencyTimings.CaptureToSendMs + "</div>";
      }
      if (latencyTimings.browserSendLatency !== void 0 && latencyTimings.browserSendLatency > 0) {
        latencyStatsInnerHTML += "<div>Browser send latency (ms): " + latencyTimings.browserSendLatency + "</div>";
      }
      if (latencyTimings.frameDisplayDeltaTimeMs !== void 0 && latencyTimings.browserReceiptTimeMs !== void 0) {
        latencyStatsInnerHTML += latencyTimings.frameDisplayDeltaTimeMs && latencyTimings.browserReceiptTimeMs ? "<div>Browser receive latency (ms): " + latencyTimings.frameDisplayDeltaTimeMs + "</div>" : "";
      }
      if (latencyTimings.latencyExcludingDecode !== void 0) {
        latencyStatsInnerHTML += "<div>Total latency (excluding browser) (ms): " + latencyTimings.latencyExcludingDecode + "</div>";
      }
      if (latencyTimings.endToEndLatency !== void 0) {
        latencyStatsInnerHTML += latencyTimings.endToEndLatency ? "<div>Total latency (ms): " + latencyTimings.endToEndLatency + "</div>" : "";
      }
      this.latencyTestResultsElement.innerHTML = latencyStatsInnerHTML;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Util/MathUtils.js
  var MathUtils = class {
    /**
     * formats Bytes coming in for video stats
     * @param bytes - number to convert
     * @param decimals - number of decimal places
     */
    static formatBytes(bytes, decimals) {
      if (bytes === 0) {
        return "0";
      }
      const factor = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
      const i = Math.floor(Math.log(bytes) / Math.log(factor));
      return parseFloat((bytes / Math.pow(factor, i)).toFixed(dm)) + " " + sizes[i];
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/DataChannelLatencyTest.js
  var DataChannelLatencyTest = class {
    /**
     * Get the button containing the stats icon.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("section");
        this._rootElement.classList.add("settingsContainer");
        const heading = document.createElement("div");
        heading.id = "dataChannelLatencyTestHeader";
        heading.classList.add("settings-text");
        heading.classList.add("settingsHeader");
        this._rootElement.appendChild(heading);
        const headingText = document.createElement("div");
        headingText.innerHTML = StatsSections.DataChannelLatencyTest;
        heading.appendChild(headingText);
        heading.appendChild(this.latencyTestButton);
        const resultsParentElem = document.createElement("div");
        resultsParentElem.id = "dataChannelLatencyTestContainer";
        resultsParentElem.classList.add("d-none");
        this._rootElement.appendChild(resultsParentElem);
        resultsParentElem.appendChild(this.latencyTestResultsElement);
      }
      return this._rootElement;
    }
    get latencyTestResultsElement() {
      if (!this._latencyTestResultsElement) {
        this._latencyTestResultsElement = document.createElement("div");
        this._latencyTestResultsElement.id = "dataChannelLatencyStatsResults";
        this._latencyTestResultsElement.classList.add("StatsResult");
      }
      return this._latencyTestResultsElement;
    }
    get latencyTestButton() {
      if (!this._latencyTestButton) {
        this._latencyTestButton = document.createElement("input");
        this._latencyTestButton.type = "button";
        this._latencyTestButton.value = "Run Test";
        this._latencyTestButton.id = "btn-start-data-channel-latency-test";
        this._latencyTestButton.classList.add("streamTools-button");
        this._latencyTestButton.classList.add("btn-flat");
      }
      return this._latencyTestButton;
    }
    /**
     * Populate the UI based on the latency test's results.
     * @param result - The latency test results.
     */
    handleTestResult(result) {
      Logger.Info(JSON.stringify(result));
      if (isNaN(result.dataChannelRtt)) {
        this.latencyTestResultsElement.innerHTML = "<div>Not supported</div>";
        return;
      }
      let latencyStatsInnerHTML = "";
      latencyStatsInnerHTML += "<div>Data channel RTT (ms): " + result.dataChannelRtt + "</div>";
      if (result.playerToStreamerTime >= 0 && result.streamerToPlayerTime >= 0) {
        latencyStatsInnerHTML += "<div>Player to Streamer path (ms): " + result.playerToStreamerTime + "</div>";
        latencyStatsInnerHTML += "<div>Streamer to Player path (ms): " + result.streamerToPlayerTime + "</div>";
      }
      this.latencyTestResultsElement.innerHTML = latencyStatsInnerHTML;
      const downloadButton = document.createElement("input");
      downloadButton.type = "button";
      downloadButton.value = "Download";
      downloadButton.classList.add("streamTools-button");
      downloadButton.classList.add("btn-flat");
      downloadButton.onclick = () => {
        const file = new Blob([result.exportLatencyAsCSV()], { type: "text/plain" });
        const a = document.createElement("a");
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = "data_channel_latency_test_results.csv";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      };
      this.latencyTestResultsElement.appendChild(downloadButton);
    }
    handleTestStart() {
      this.latencyTestResultsElement.innerHTML = "<div>Test in progress</div>";
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/StatsPanel.js
  var Stat = class {
  };
  var StatsPanel = class {
    constructor(config2) {
      this.statsMap = /* @__PURE__ */ new Map();
      this._config = config2;
      this.latencyTest = new LatencyTest();
      this.dataChannelLatencyTest = new DataChannelLatencyTest();
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = "stats-panel";
        this._rootElement.classList.add("panel-wrap");
        const panelElem = document.createElement("div");
        panelElem.classList.add("panel");
        this._rootElement.appendChild(panelElem);
        const statsHeading = document.createElement("div");
        statsHeading.id = "statsHeading";
        statsHeading.textContent = "Information";
        panelElem.appendChild(statsHeading);
        panelElem.appendChild(this.statsCloseButton);
        panelElem.appendChild(this.statsContentElement);
      }
      return this._rootElement;
    }
    get statsContentElement() {
      if (!this._statsContentElement) {
        this._statsContentElement = document.createElement("div");
        this._statsContentElement.id = "statsContent";
        const streamToolStats = document.createElement("div");
        streamToolStats.id = "streamToolsStats";
        streamToolStats.classList.add("container");
        const controlStats = document.createElement("div");
        controlStats.id = "ControlStats";
        controlStats.classList.add("row");
        const statistics = document.createElement("section");
        statistics.id = "statistics";
        statistics.classList.add("settingsContainer");
        const latencyStats = document.createElement("section");
        latencyStats.id = "latencyStats";
        latencyStats.classList.add("settingsContainer");
        const statisticsHeader = document.createElement("div");
        statisticsHeader.id = "statisticsHeader";
        statisticsHeader.classList.add("settings-text");
        statisticsHeader.classList.add("settingsHeader");
        const latencyStatsHeader = document.createElement("div");
        latencyStatsHeader.id = "latencyStatsHeader";
        latencyStatsHeader.classList.add("settings-text");
        latencyStatsHeader.classList.add("settingsHeader");
        this._statsContentElement.appendChild(streamToolStats);
        streamToolStats.appendChild(controlStats);
        controlStats.appendChild(statistics);
        controlStats.appendChild(latencyStats);
        statistics.appendChild(statisticsHeader);
        latencyStats.appendChild(latencyStatsHeader);
        if (isSectionEnabled(this._config, StatsSections.SessionStats)) {
          const sessionStatsText = document.createElement("div");
          sessionStatsText.innerHTML = StatsSections.SessionStats;
          statisticsHeader.appendChild(sessionStatsText);
        }
        statistics.appendChild(this.statisticsContainer);
        if (isSectionEnabled(this._config, StatsSections.LatencyStats)) {
          const latencyStatsText = document.createElement("div");
          latencyStatsText.innerHTML = StatsSections.LatencyStats;
          latencyStatsHeader.appendChild(latencyStatsText);
        }
        latencyStats.appendChild(this.latencyStatsContainer);
        if (isSectionEnabled(this._config, StatsSections.LatencyTest)) {
          controlStats.appendChild(this.latencyTest.rootElement);
        }
        if (isSectionEnabled(this._config, StatsSections.DataChannelLatencyTest)) {
          controlStats.appendChild(this.dataChannelLatencyTest.rootElement);
        }
      }
      return this._statsContentElement;
    }
    get statisticsContainer() {
      if (!this._statisticsContainer) {
        this._statisticsContainer = document.createElement("div");
        this._statisticsContainer.id = "statisticsContainer";
        this._statisticsContainer.classList.add("d-none");
        this._statisticsContainer.appendChild(this.statsResult);
      }
      return this._statisticsContainer;
    }
    get latencyStatsContainer() {
      if (!this._latencyStatsContainer) {
        this._latencyStatsContainer = document.createElement("div");
        this._latencyStatsContainer.id = "latencyStatsContainer";
        this._latencyStatsContainer.classList.add("d-none");
        this._latencyStatsContainer.appendChild(this.latencyResult);
      }
      return this._latencyStatsContainer;
    }
    get statsResult() {
      if (!this._statsResult) {
        this._statsResult = document.createElement("div");
        this._statsResult.id = "statisticsResult";
        this._statsResult.classList.add("StatsResult");
      }
      return this._statsResult;
    }
    get latencyResult() {
      if (!this._latencyResult) {
        this._latencyResult = document.createElement("div");
        this._latencyResult.id = "latencyResult";
        this._latencyResult.classList.add("StatsResult");
      }
      return this._latencyResult;
    }
    get statsCloseButton() {
      if (!this._statsCloseButton) {
        this._statsCloseButton = document.createElement("div");
        this._statsCloseButton.id = "statsClose";
      }
      return this._statsCloseButton;
    }
    onDisconnect() {
      this.latencyTest.latencyTestButton.onclick = () => {
      };
      this.dataChannelLatencyTest.latencyTestButton.onclick = () => {
      };
    }
    onVideoInitialized(stream) {
      this.latencyTest.latencyTestButton.onclick = () => {
        stream.requestLatencyTest();
      };
      this.dataChannelLatencyTest.latencyTestButton.onclick = () => {
        const started = stream.requestDataChannelLatencyTest({
          duration: 1e3,
          rps: 10,
          requestSize: 200,
          responseSize: 200
        });
        if (started) {
          this.dataChannelLatencyTest.handleTestStart();
        }
      };
    }
    configure(settings) {
      if (settings.DisableLatencyTest) {
        this.latencyTest.latencyTestButton.disabled = true;
        this.latencyTest.latencyTestButton.title = "Disabled by -PixelStreamingDisableLatencyTester=true";
        this.dataChannelLatencyTest.latencyTestButton.disabled = true;
        this.dataChannelLatencyTest.latencyTestButton.title = "Disabled by -PixelStreamingDisableLatencyTester=true";
        Logger.Info("-PixelStreamingDisableLatencyTester=true, requesting latency report from the the browser to UE is disabled.");
      }
    }
    /**
     * Show stats panel.
     */
    show() {
      if (!this.rootElement.classList.contains("panel-wrap-visible")) {
        this.rootElement.classList.add("panel-wrap-visible");
      }
    }
    /**
     * Toggle the visibility of the stats panel.
     */
    toggleVisibility() {
      this.rootElement.classList.toggle("panel-wrap-visible");
    }
    /**
     * Hide the stats panel.
     */
    hide() {
      if (this.rootElement.classList.contains("panel-wrap-visible")) {
        this.rootElement.classList.remove("panel-wrap-visible");
      }
    }
    handlePlayerCount(playerCount2) {
      this.addOrUpdateSessionStat("PlayerCountStat", "Players", playerCount2.toString());
    }
    /**
     * Handle stats coming in from browser/UE
     * @param stats - the stats structure
     */
    handleStats(stats2) {
      var _a, _b, _c, _d;
      const numberFormat = new Intl.NumberFormat(window.navigator.language, {
        maximumFractionDigits: 0
      });
      const inboundData = MathUtils.formatBytes(stats2.inboundVideoStats.bytesReceived, 2);
      this.addOrUpdateSessionStat("InboundDataStat", "Received", inboundData);
      const packetsLostStat = Object.prototype.hasOwnProperty.call(stats2.inboundVideoStats, "packetsLost") ? numberFormat.format(stats2.inboundVideoStats.packetsLost) : "Chrome only";
      this.addOrUpdateSessionStat("PacketsLostStat", "Packets Lost", packetsLostStat);
      if (stats2.inboundVideoStats.bitrate) {
        this.addOrUpdateSessionStat("VideoBitrateStat", "Video Bitrate (kbps)", stats2.inboundVideoStats.bitrate.toString());
      }
      if (stats2.inboundAudioStats.bitrate) {
        this.addOrUpdateSessionStat("AudioBitrateStat", "Audio Bitrate (kbps)", stats2.inboundAudioStats.bitrate.toString());
      }
      const resStat = stats2.inboundVideoStats.frameWidth !== void 0 && stats2.inboundVideoStats.frameWidth > 0 && stats2.inboundVideoStats.frameHeight !== void 0 && stats2.inboundVideoStats.frameHeight > 0 ? stats2.inboundVideoStats.frameWidth + "x" + stats2.inboundVideoStats.frameHeight : "Chrome only";
      this.addOrUpdateSessionStat("VideoResStat", "Video resolution", resStat);
      if (stats2.inboundVideoStats.framesDecoded !== void 0) {
        const framesDecoded = numberFormat.format(stats2.inboundVideoStats.framesDecoded);
        this.addOrUpdateSessionStat("FramesDecodedStat", "Frames Decoded", framesDecoded);
      }
      if (stats2.inboundVideoStats.framesPerSecond) {
        this.addOrUpdateSessionStat("FramerateStat", "Framerate", stats2.inboundVideoStats.framesPerSecond.toString());
      }
      if (stats2.inboundVideoStats.framesDropped !== void 0) {
        this.addOrUpdateSessionStat("FramesDroppedStat", "Frames dropped", stats2.inboundVideoStats.framesDropped.toString());
      }
      if (stats2.inboundVideoStats.codecId) {
        this.addOrUpdateSessionStat(
          "VideoCodecStat",
          "Video codec",
          // Split the codec to remove the Fmtp line
          (_b = (_a = stats2.codecs.get(stats2.inboundVideoStats.codecId)) === null || _a === void 0 ? void 0 : _a.mimeType.replace("video/", "")) !== null && _b !== void 0 ? _b : ""
        );
      }
      if (stats2.inboundAudioStats.codecId) {
        this.addOrUpdateSessionStat(
          "AudioCodecStat",
          "Audio codec",
          // Split the codec to remove the Fmtp line
          (_d = (_c = stats2.codecs.get(stats2.inboundAudioStats.codecId)) === null || _c === void 0 ? void 0 : _c.mimeType.replace("audio/", "")) !== null && _d !== void 0 ? _d : ""
        );
      }
      const activeCandidatePair = stats2.getActiveCandidatePair();
      if (activeCandidatePair) {
        const netRTT = Object.prototype.hasOwnProperty.call(activeCandidatePair, "currentRoundTripTime") && stats2.isNumber(activeCandidatePair.currentRoundTripTime) ? Math.ceil(activeCandidatePair.currentRoundTripTime * 1e3).toString() : "Can't calculate";
        this.addOrUpdateSessionStat("RTTStat", "Net RTT (ms)", netRTT);
      }
      this.addOrUpdateSessionStat("DurationStat", "Duration", stats2.sessionStats.runTime);
      this.addOrUpdateSessionStat("ControlsInputStat", "Controls stream input", stats2.sessionStats.controlsStreamInput);
      if (stats2.sessionStats.videoEncoderAvgQP !== void 0 && !Number.isNaN(stats2.sessionStats.videoEncoderAvgQP)) {
        this.addOrUpdateSessionStat("QPStat", "Video quantization parameter", stats2.sessionStats.videoEncoderAvgQP.toString());
      }
      Logger.Info(`--------- Stats ---------
 ${JSON.stringify(stats2)}
------------------------`);
    }
    handleLatencyInfo(latencyInfo) {
      if (latencyInfo.frameTiming !== void 0) {
        if (latencyInfo.frameTiming.encoderLatencyMs !== void 0) {
          this.addOrUpdateLatencyStat("EncodeLatency", "Encode latency (ms)", Math.ceil(latencyInfo.frameTiming.encoderLatencyMs).toString());
        }
        if (latencyInfo.frameTiming.packetizeLatencyMs !== void 0) {
          this.addOrUpdateLatencyStat("PacketizerLatency", "Packetizer latency (ms)", Math.ceil(latencyInfo.frameTiming.packetizeLatencyMs).toString());
        }
        if (latencyInfo.frameTiming.pacerLatencyMs !== void 0) {
          this.addOrUpdateLatencyStat("PacerLatency", "Pacer latency (ms)", Math.ceil(latencyInfo.frameTiming.pacerLatencyMs).toString());
        }
        if (latencyInfo.frameTiming.captureToSendLatencyMs !== void 0) {
          this.addOrUpdateLatencyStat("VideoTimingCaptureToSend", "Post-capture to send latency (ms)", Math.ceil(latencyInfo.frameTiming.captureToSendLatencyMs).toString());
        }
      }
      if (latencyInfo.senderLatencyMs !== void 0) {
        this.addOrUpdateLatencyStat("AbsCaptureTimeToSendLatency", "Post-capture (abs-ct) to send latency (ms)", Math.ceil(latencyInfo.senderLatencyMs).toString());
      }
      if (latencyInfo.averageAssemblyDelayMs !== void 0) {
        this.addOrUpdateLatencyStat("AvgAssemblyDelay", "Assembly delay (ms)", Math.ceil(latencyInfo.averageAssemblyDelayMs).toString());
      }
      if (latencyInfo.averageDecodeLatencyMs !== void 0) {
        this.addOrUpdateLatencyStat("AvgDecodeDelay", "Decode time (ms)", Math.ceil(latencyInfo.averageDecodeLatencyMs).toString());
      }
      if (latencyInfo.averageJitterBufferDelayMs !== void 0) {
        this.addOrUpdateLatencyStat("AvgJitterBufferDelay", "Jitter buffer (ms)", Math.ceil(latencyInfo.averageJitterBufferDelayMs).toString());
      }
      if (latencyInfo.averageProcessingDelayMs !== void 0) {
        this.addOrUpdateLatencyStat("AvgProcessingDelay", "Processing delay (ms)", Math.ceil(latencyInfo.averageProcessingDelayMs).toString());
      }
      if (latencyInfo.averageE2ELatency !== void 0) {
        this.addOrUpdateLatencyStat("AvgE2ELatency", "Total latency (ms)", Math.ceil(latencyInfo.averageE2ELatency).toString());
      }
    }
    /**
     * Adds a new stat to the stats results in the DOM or updates an exiting stat.
     * @param id - The id of the stat to add/update.
     * @param stat - The contents of the stat.
     */
    addOrUpdateSessionStat(id, statLabel, stat) {
      this.addOrUpdateStat(StatsSections.SessionStats, id, statLabel, stat);
    }
    /**
     * Adds a new stat to the latency results in the DOM or updates an exiting stat.
     * @param id - The id of the stat to add/update.
     * @param stat - The contents of the stat.
     */
    addOrUpdateLatencyStat(id, statLabel, stat) {
      this.addOrUpdateStat(StatsSections.LatencyStats, id, statLabel, stat);
    }
    /**
     * Adds a new stat to the stats results in the DOM or updates an exiting stat.
     * @param sectionId - The section to add this stat too.
     * @param id - The id of the stat to add/update.
     * @param stat - The contents of the stat.
     */
    addOrUpdateStat(sectionId, id, statLabel, stat) {
      if (sectionId === StatsSections.SessionStats && !isSectionEnabled(this._config, StatsSections.SessionStats)) {
        return;
      }
      if (sectionId === StatsSections.LatencyStats && !isSectionEnabled(this._config, StatsSections.LatencyStats)) {
        return;
      }
      if (sectionId !== StatsSections.SessionStats && sectionId !== StatsSections.LatencyStats) {
        return;
      }
      const parentElem = sectionId === StatsSections.SessionStats ? this.statsResult : this.latencyResult;
      const statHTML = `${statLabel}: ${stat}`;
      if (!this.statsMap.has(id)) {
        const newStat = new Stat();
        newStat.id = id;
        newStat.stat = stat;
        newStat.title = statLabel;
        newStat.element = document.createElement("div");
        newStat.element.innerHTML = statHTML;
        parentElem.appendChild(newStat.element);
        this.statsMap.set(id, newStat);
      } else {
        const value = this.statsMap.get(id);
        if (value !== void 0) {
          value.element.innerHTML = statHTML;
        }
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/VideoQpIndicator.js
  var VideoQpIndicator = class {
    constructor(config2) {
      this.videoEncoderAvgQP = -1;
      this.statsText = "";
      this.color = "";
      this.orangeQP = 26;
      this.redQP = 35;
      this.config = config2;
    }
    /**
     * Get the root element of the QP indicator.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = "connection";
        this._rootElement.classList.add("UiTool");
        this._rootElement.appendChild(this.qualityStatus);
        this._rootElement.appendChild(this.qualityText);
        this.updateQpTooltip(-1);
      }
      return this._rootElement;
    }
    /**
     * Get the text that displays under the icon.
     */
    get qualityText() {
      if (!this._qualityText) {
        this._qualityText = document.createElement("span");
        this._qualityText.id = "qualityText";
        this._qualityText.classList.add("tooltiptext");
      }
      return this._qualityText;
    }
    /**
     * Get the icon.
     */
    get qualityStatus() {
      if (!this._qualityStatus) {
        this._qualityStatus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._qualityStatus.setAttributeNS(null, "id", "connectionStrength");
        this._qualityStatus.setAttributeNS(null, "x", "0px");
        this._qualityStatus.setAttributeNS(null, "y", "0px");
        this._qualityStatus.setAttributeNS(null, "viewBox", "0 0 494.45 494.45");
        this.qualityStatus.appendChild(this.dot);
        this.qualityStatus.appendChild(this.middle);
        this.qualityStatus.appendChild(this.outer);
        this.qualityStatus.appendChild(this.inner);
      }
      return this._qualityStatus;
    }
    /**
     * Get the dot at the bottom of the wifi icon.
     */
    get dot() {
      if (!this._dot) {
        this._dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._dot.setAttributeNS(null, "id", "dot");
        this._dot.setAttributeNS(null, "cx", "247.125");
        this._dot.setAttributeNS(null, "cy", "398.925");
        this._dot.setAttributeNS(null, "r", "35.3");
      }
      return this._dot;
    }
    /**
     * Get the outer arc of the wifi icon.
     */
    get outer() {
      if (!this._outer) {
        this._outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._outer.setAttributeNS(null, "id", "outer");
        this._outer.setAttributeNS(null, "d", "M467.925,204.625c-6.8,0-13.5-2.6-18.7-7.8c-111.5-111.4-292.7-111.4-404.1,0c-10.3,10.3-27.1,10.3-37.4,0s-10.3-27.1,0-37.4c64-64,149-99.2,239.5-99.2s175.5,35.2,239.5,99.2c10.3,10.3,10.3,27.1,0,37.4C481.425,202.025,474.625,204.625,467.925,204.625z");
      }
      return this._outer;
    }
    /**
     * Get the middle arc of the wifi icon.
     */
    get middle() {
      if (!this._middle) {
        this._middle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._middle.setAttributeNS(null, "id", "middle");
        this._middle.setAttributeNS(null, "d", "M395.225,277.325c-6.8,0-13.5-2.6-18.7-7.8c-71.4-71.3-187.4-71.3-258.8,0c-10.3,10.3-27.1,10.3-37.4,0s-10.3-27.1,0-37.4c92-92,241.6-92,333.6,0c10.3,10.3,10.3,27.1,0,37.4C408.725,274.725,401.925,277.325,395.225,277.325z");
      }
      return this._middle;
    }
    /**
     * Get the inner arc of the wifi icon.
     */
    get inner() {
      if (!this._inner) {
        this._inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._inner.setAttributeNS(null, "id", "inner");
        this._inner.setAttributeNS(null, "d", "M323.625,348.825c-6.8,0-13.5-2.6-18.7-7.8c-15.4-15.4-36-23.9-57.8-23.9s-42.4,8.5-57.8,23.9c-10.3,10.3-27.1,10.3-37.4,0c-10.3-10.3-10.3-27.1,0-37.4c25.4-25.4,59.2-39.4,95.2-39.4s69.8,14,95.2,39.5c10.3,10.3,10.3,27.1,0,37.4C337.225,346.225,330.425,348.825,323.625,348.825z");
      }
      return this._inner;
    }
    /**
     * Used to set the speed of the status light.
     * @param speed - Set the speed of the blink, higher numbers make the status light blink faster.
     */
    blinkVideoQualityStatus(speed) {
      let iteration = speed;
      let opacity = 1;
      const tickID = setInterval(() => {
        opacity -= 0.1;
        this.qualityText.style.opacity = String(Math.abs((opacity - 0.5) * 2));
        if (opacity <= 0.1) {
          if (--iteration === 0) {
            clearInterval(tickID);
          } else {
            opacity = 1;
          }
        }
      }, 100 / speed);
    }
    /**
     * updates the QP tooltip by converting the Video Encoder QP to a color light
     * @param QP - The video encoder QP number needed to find the average
     */
    updateQpTooltip(QP) {
      var _a;
      this.videoEncoderAvgQP = QP;
      if (QP > this.redQP) {
        this.color = "red";
        this.blinkVideoQualityStatus(2);
        this.statsText = `<div style="color: ${this.color}">Poor encoding quality</div>`;
        this.outer.setAttributeNS(null, "fill", "#3c3b40");
        this.middle.setAttributeNS(null, "fill", "#3c3b40");
        this.inner.setAttributeNS(null, "fill", this.color);
        this.dot.setAttributeNS(null, "fill", this.color);
      } else if (QP > this.orangeQP) {
        this.color = "orange";
        this.blinkVideoQualityStatus(1);
        this.statsText = `<div style="color: ${this.color}">Blocky encoding quality</div>`;
        this.outer.setAttributeNS(null, "fill", "#3c3b40");
        this.middle.setAttributeNS(null, "fill", this.color);
        this.inner.setAttributeNS(null, "fill", this.color);
        this.dot.setAttributeNS(null, "fill", this.color);
      } else if (QP <= 0) {
        this.color = "#b0b0b0";
        this.outer.setAttributeNS(null, "fill", "#3c3b40");
        this.middle.setAttributeNS(null, "fill", "#3c3b40");
        this.inner.setAttributeNS(null, "fill", "#3c3b40");
        this.dot.setAttributeNS(null, "fill", "#3c3b40");
        this.statsText = `<div style="color: ${this.color}">Not connected</div>`;
      } else {
        this.color = "lime";
        this.qualityStatus.style.opacity = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.hideWhenGood) === true ? "0" : "1";
        this.statsText = `<div style="color: ${this.color}">Clear encoding quality</div>`;
        this.outer.setAttributeNS(null, "fill", this.color);
        this.middle.setAttributeNS(null, "fill", this.color);
        this.inner.setAttributeNS(null, "fill", this.color);
        this.dot.setAttributeNS(null, "fill", this.color);
      }
      this.qualityText.innerHTML = this.statsText;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/SettingUIBase.js
  var SettingUIBase = class {
    constructor(setting) {
      this._setting = setting;
    }
    /**
     * @returns The setting component.
     */
    get setting() {
      return this._setting;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
      }
      return this._rootElement;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/SettingUIFlag.js
  var SettingUIFlag = class extends SettingUIBase {
    constructor(setting) {
      super(setting);
      this.label = setting.label;
      this.flag = setting.flag;
    }
    /**
     * @returns The setting component.
     */
    get setting() {
      return this._setting;
    }
    get settingsTextElem() {
      if (!this._settingsTextElem) {
        this._settingsTextElem = document.createElement("div");
        this._settingsTextElem.innerText = this.setting._label;
        this._settingsTextElem.title = this.setting.description;
      }
      return this._settingsTextElem;
    }
    get checkbox() {
      if (!this._checkbox) {
        this._checkbox = document.createElement("input");
        this._checkbox.type = "checkbox";
        this._checkbox.addEventListener("keypress", (event) => {
          event.stopPropagation();
        });
        this._checkbox.addEventListener("keyup", (event) => {
          event.stopPropagation();
        });
        this._checkbox.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });
      }
      return this._checkbox;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = this.setting.id;
        this._rootElement.classList.add("setting");
        this._rootElement.appendChild(this.settingsTextElem);
        const wrapperLabel = document.createElement("label");
        wrapperLabel.classList.add("tgl-switch");
        this._rootElement.appendChild(wrapperLabel);
        this.checkbox.title = this.setting.description;
        this.checkbox.classList.add("tgl");
        this.checkbox.classList.add("tgl-flat");
        const slider = document.createElement("div");
        slider.classList.add("tgl-slider");
        wrapperLabel.appendChild(this.checkbox);
        wrapperLabel.appendChild(slider);
        this.checkbox.addEventListener("change", () => {
          if (this.setting.flag !== this.checkbox.checked) {
            this.setting.flag = this.checkbox.checked;
            this.setting.updateURLParams();
          }
        });
      }
      return this._rootElement;
    }
    /**
     * Update the setting's stored value.
     * @param inValue - The new value for the setting.
     */
    set flag(inValue) {
      this.checkbox.checked = inValue;
    }
    /**
     * Get value
     */
    get flag() {
      return this.checkbox.checked;
    }
    /**
     * Set the label text for the setting.
     * @param label - setting label.
     */
    set label(inLabel) {
      this.settingsTextElem.innerText = inLabel;
    }
    /**
     * Get label
     */
    get label() {
      return this.settingsTextElem.innerText;
    }
    disable() {
      this.checkbox.disabled = true;
    }
    enable() {
      this.checkbox.disabled = false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/SettingUINumber.js
  var SettingUINumber = class extends SettingUIBase {
    constructor(setting) {
      super(setting);
      this.label = this.setting.label;
      this.number = this.setting.number;
    }
    /**
     * @returns The setting component.
     */
    get setting() {
      return this._setting;
    }
    get settingsTextElem() {
      if (!this._settingsTextElem) {
        this._settingsTextElem = document.createElement("label");
        this._settingsTextElem.innerText = this.setting.label;
        this._settingsTextElem.title = this.setting.description;
      }
      return this._settingsTextElem;
    }
    /**
     * Get the HTMLInputElement for the button.
     */
    get spinner() {
      if (!this._spinner) {
        this._spinner = document.createElement("input");
        this._spinner.type = "number";
        if (this.setting.min != null) {
          this._spinner.min = this.setting.min.toString();
        }
        if (this.setting.max != null) {
          this._spinner.max = this.setting.max.toString();
        }
        this._spinner.value = this.setting.number.toString();
        this._spinner.title = this.setting.description;
        this._spinner.classList.add("form-control");
        this.spinner.addEventListener("keypress", (event) => {
          event.stopPropagation();
        });
        this.spinner.addEventListener("keyup", (event) => {
          event.stopPropagation();
        });
        this.spinner.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });
      }
      return this._spinner;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.classList.add("setting");
        this._rootElement.classList.add("form-group");
        this._rootElement.appendChild(this.settingsTextElem);
        this._rootElement.appendChild(this.spinner);
        this.spinner.onchange = (event) => {
          const inputElem = event.target;
          const parsedValue = Number.parseFloat(inputElem.value);
          if (Number.isNaN(parsedValue)) {
            Logger.Warning(`Could not parse value change into a valid number - value was ${inputElem.value}, resetting value to ${this.setting.min}`);
            if (this.setting.number !== this.setting.min) {
              this.setting.number = this.setting.min;
            }
          } else {
            if (this.setting.number !== parsedValue) {
              this.setting.number = parsedValue;
              this.setting.updateURLParams();
            }
          }
        };
      }
      return this._rootElement;
    }
    /**
     * Set the number in the spinner (will be clamped within range).
     */
    set number(newNumber) {
      this.spinner.value = this.setting.clamp(newNumber).toString();
    }
    /**
     * Get value
     */
    get number() {
      return +this.spinner.value;
    }
    /**
     * Set the label text for the setting.
     * @param label - setting label.
     */
    set label(inLabel) {
      this.settingsTextElem.innerText = inLabel;
    }
    /**
     * Get label
     */
    get label() {
      return this.settingsTextElem.innerText;
    }
    disable() {
      this.spinner.disabled = true;
    }
    enable() {
      this.spinner.disabled = false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/SettingUIText.js
  var SettingUIText = class extends SettingUIBase {
    constructor(setting) {
      super(setting);
      this.label = this.setting.label;
      this.text = this.setting.text;
    }
    /**
     * @returns The setting component.
     */
    get setting() {
      return this._setting;
    }
    get settingsTextElem() {
      if (!this._settingsTextElem) {
        this._settingsTextElem = document.createElement("div");
        this._settingsTextElem.innerText = this.setting.label;
        this._settingsTextElem.title = this.setting.description;
      }
      return this._settingsTextElem;
    }
    get textbox() {
      if (!this._textbox) {
        this._textbox = document.createElement("input");
        this._textbox.classList.add("form-control");
        this._textbox.type = "textbox";
      }
      return this._textbox;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = this.setting.id;
        this._rootElement.classList.add("setting");
        this._rootElement.appendChild(this.settingsTextElem);
        const wrapperLabel = document.createElement("label");
        this._rootElement.appendChild(wrapperLabel);
        this.textbox.title = this.setting.description;
        wrapperLabel.appendChild(this.textbox);
        this.textbox.addEventListener("input", (event) => {
          if (this.setting.text !== this.textbox.value) {
            this.setting.text = this.textbox.value;
            this.setting.updateURLParams();
          }
          event.stopPropagation();
        });
        this.textbox.addEventListener("keypress", (event) => {
          event.stopPropagation();
        });
        this.textbox.addEventListener("keyup", (event) => {
          event.stopPropagation();
        });
        this.textbox.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });
      }
      return this._rootElement;
    }
    /**
     * Update the setting's stored value.
     * @param inValue - The new value for the setting.
     */
    set text(inValue) {
      this.textbox.value = inValue;
    }
    /**
     * Get value
     */
    get text() {
      return this.textbox.value;
    }
    /**
     * Set the label text for the setting.
     * @param label - setting label.
     */
    set label(inLabel) {
      this.settingsTextElem.innerText = inLabel;
    }
    /**
     * Get label
     */
    get label() {
      return this.settingsTextElem.innerText;
    }
    disable() {
      this.textbox.disabled = true;
    }
    enable() {
      this.textbox.disabled = false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/SettingUIOption.js
  var SettingUIOption = class extends SettingUIBase {
    constructor(setting) {
      super(setting);
      this.label = this.setting.label;
      this.options = this.setting.options;
      this.selected = this.setting.selected;
    }
    /**
     * @returns The setting component.
     */
    get setting() {
      return this._setting;
    }
    get selector() {
      if (!this._selector) {
        this._selector = document.createElement("select");
        this._selector.classList.add("form-control");
        this._selector.classList.add("settings-option");
      }
      return this._selector;
    }
    get settingsTextElem() {
      if (!this._settingsTextElem) {
        this._settingsTextElem = document.createElement("div");
        this._settingsTextElem.innerText = this.setting.label;
        this._settingsTextElem.title = this.setting.description;
      }
      return this._settingsTextElem;
    }
    /**
     * Set the label text for the setting.
     * @param label - setting label.
     */
    set label(inLabel) {
      this.settingsTextElem.innerText = inLabel;
    }
    /**
     * Get label
     */
    get label() {
      return this.settingsTextElem.innerText;
    }
    /**
     * @returns Return or creates a HTML element that represents this setting in the DOM.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.id = this.setting.id;
        this._rootElement.classList.add("setting");
        this._rootElement.classList.add("form-group");
        this._rootElement.appendChild(this.settingsTextElem);
        const wrapperLabel = document.createElement("label");
        this._rootElement.appendChild(wrapperLabel);
        this.selector.title = this.setting.description;
        wrapperLabel.appendChild(this.selector);
        this.selector.onchange = () => {
          if (this.setting.selected !== this.selector.value) {
            this.setting.selected = this.selector.value;
            this.setting.updateURLParams();
          }
        };
        this.selector.addEventListener("keypress", (event) => {
          event.stopPropagation();
        });
        this.selector.addEventListener("keyup", (event) => {
          event.stopPropagation();
        });
        this.selector.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });
      }
      return this._rootElement;
    }
    set options(values) {
      for (let i = this.selector.options.length - 1; i >= 0; i--) {
        this.selector.remove(i);
      }
      values.forEach((value) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.innerHTML = value;
        this.selector.appendChild(opt);
      });
    }
    get options() {
      return [...this.selector.options].map((o) => o.value);
    }
    set selected(value) {
      const filteredList = this.options.filter((option) => option.indexOf(value) !== -1);
      if (filteredList.length) {
        this.selector.value = filteredList[0];
      }
    }
    get selected() {
      return this.selector.value;
    }
    disable() {
      this.selector.disabled = true;
    }
    enable() {
      this.selector.disabled = false;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Config/ConfigUI.js
  var ConfigUI = class {
    // ------------ Settings -----------------
    constructor(config2) {
      this.customFlags = /* @__PURE__ */ new Map();
      this.flagsUi = /* @__PURE__ */ new Map();
      this.numericParametersUi = /* @__PURE__ */ new Map();
      this.textParametersUi = /* @__PURE__ */ new Map();
      this.optionParametersUi = /* @__PURE__ */ new Map();
      this.createCustomUISettings(config2.useUrlParams);
      this.registerSettingsUIComponents(config2);
    }
    /**
     * Create custom UI settings that are not provided by the Pixel Streaming library.
     */
    createCustomUISettings(useUrlParams) {
      this.customFlags.set(ExtraFlags.LightMode, new SettingFlag(ExtraFlags.LightMode, "Color Scheme: Dark Mode", "Page styling will be either light or dark", false, useUrlParams, (isLightMode, setting) => {
        setting.label = `Color Scheme: ${isLightMode ? "Light" : "Dark"} Mode`;
      }));
    }
    /**
     * Creates UI wrapper components for each setting element in config.
     * @param config -
     */
    registerSettingsUIComponents(config2) {
      for (const setting of config2.getFlags()) {
        this.flagsUi.set(setting.id, new SettingUIFlag(setting));
      }
      for (const setting of Array.from(this.customFlags.values())) {
        this.flagsUi.set(setting.id, new SettingUIFlag(setting));
      }
      for (const setting of config2.getTextSettings()) {
        this.textParametersUi.set(setting.id, new SettingUIText(setting));
      }
      for (const setting of config2.getNumericSettings()) {
        this.numericParametersUi.set(setting.id, new SettingUINumber(setting));
      }
      for (const setting of config2.getOptionSettings()) {
        this.optionParametersUi.set(setting.id, new SettingUIOption(setting));
      }
    }
    /**
     * Make DOM elements for a settings section with a heading.
     * @param settingsElem - The parent container for our DOM elements.
     * @param sectionHeading - The heading element to go into the section.
     * @returns The constructed DOM element for the section.
     */
    buildSectionWithHeading(settingsElem, sectionHeading) {
      const sectionElem = document.createElement("section");
      sectionElem.classList.add("settingsContainer");
      const psSettingsHeader = document.createElement("div");
      psSettingsHeader.classList.add("settingsHeader");
      psSettingsHeader.classList.add("settings-text");
      psSettingsHeader.textContent = sectionHeading;
      sectionElem.appendChild(psSettingsHeader);
      settingsElem.appendChild(sectionElem);
      return sectionElem;
    }
    /**
     * Setup flags with their default values and add them to the `Config.flags` map.
     * @param settingsElem - - The element that contains all the individual settings sections, flags, and so on.
     */
    populateSettingsElement(settingsElem, settingsConfig) {
      if (isSectionEnabled(settingsConfig, SettingsSections.PixelStreaming)) {
        const psSettingsSection = this.buildSectionWithHeading(settingsElem, SettingsSections.PixelStreaming);
        if (isSettingEnabled(settingsConfig, TextParameters.SignallingServerUrl))
          this.addSettingText(psSettingsSection, this.textParametersUi.get(TextParameters.SignallingServerUrl));
        if (isSettingEnabled(settingsConfig, OptionParameters.StreamerId))
          this.addSettingOption(psSettingsSection, this.optionParametersUi.get(OptionParameters.StreamerId));
        if (isSettingEnabled(settingsConfig, Flags.AutoConnect))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.AutoConnect));
        if (isSettingEnabled(settingsConfig, Flags.AutoPlayVideo))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.AutoPlayVideo));
        if (isSettingEnabled(settingsConfig, Flags.UseMic))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.UseMic));
        if (isSettingEnabled(settingsConfig, Flags.UseCamera))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.UseCamera));
        if (isSettingEnabled(settingsConfig, Flags.StartVideoMuted))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.StartVideoMuted));
        if (isSettingEnabled(settingsConfig, Flags.IsQualityController))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.IsQualityController));
        if (isSettingEnabled(settingsConfig, Flags.ForceMonoAudio))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.ForceMonoAudio));
        if (isSettingEnabled(settingsConfig, Flags.ForceTURN))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.ForceTURN));
        if (isSettingEnabled(settingsConfig, Flags.SuppressBrowserKeys))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.SuppressBrowserKeys));
        if (isSettingEnabled(settingsConfig, Flags.AFKDetection))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.AFKDetection));
        if (isSettingEnabled(settingsConfig, Flags.WaitForStreamer))
          this.addSettingFlag(psSettingsSection, this.flagsUi.get(Flags.WaitForStreamer));
        if (isSettingEnabled(settingsConfig, NumericParameters.AFKTimeoutSecs))
          this.addSettingNumeric(psSettingsSection, this.numericParametersUi.get(NumericParameters.AFKTimeoutSecs));
        if (isSettingEnabled(settingsConfig, NumericParameters.AFKCountdownSecs))
          this.addSettingNumeric(psSettingsSection, this.numericParametersUi.get(NumericParameters.AFKCountdownSecs));
        if (isSettingEnabled(settingsConfig, NumericParameters.MaxReconnectAttempts))
          this.addSettingNumeric(psSettingsSection, this.numericParametersUi.get(NumericParameters.MaxReconnectAttempts));
        if (isSettingEnabled(settingsConfig, NumericParameters.StreamerAutoJoinInterval))
          this.addSettingNumeric(psSettingsSection, this.numericParametersUi.get(NumericParameters.StreamerAutoJoinInterval));
        if (isSettingEnabled(settingsConfig, NumericParameters.KeepaliveDelay))
          this.addSettingNumeric(psSettingsSection, this.numericParametersUi.get(NumericParameters.KeepaliveDelay));
      }
      if (isSectionEnabled(settingsConfig, SettingsSections.UI)) {
        const viewSettingsSection = this.buildSectionWithHeading(settingsElem, SettingsSections.UI);
        if (isSettingEnabled(settingsConfig, Flags.MatchViewportResolution))
          this.addSettingFlag(viewSettingsSection, this.flagsUi.get(Flags.MatchViewportResolution));
        if (isSettingEnabled(settingsConfig, NumericParameters.ViewportResScale))
          this.addSettingNumeric(viewSettingsSection, this.numericParametersUi.get(NumericParameters.ViewportResScale));
        if (isSettingEnabled(settingsConfig, Flags.HoveringMouseMode))
          this.addSettingFlag(viewSettingsSection, this.flagsUi.get(Flags.HoveringMouseMode));
        if (isSettingEnabled(settingsConfig, ExtraFlags.LightMode))
          this.addSettingFlag(viewSettingsSection, this.flagsUi.get(ExtraFlags.LightMode));
      }
      if (isSectionEnabled(settingsConfig, SettingsSections.Input)) {
        const inputSettingsSection = this.buildSectionWithHeading(settingsElem, SettingsSections.Input);
        if (isSettingEnabled(settingsConfig, Flags.KeyboardInput))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.KeyboardInput));
        if (isSettingEnabled(settingsConfig, Flags.MouseInput))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.MouseInput));
        if (isSettingEnabled(settingsConfig, Flags.MouseDoubleClickAutoRelease))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.MouseDoubleClickAutoRelease));
        if (isSettingEnabled(settingsConfig, Flags.FakeMouseWithTouches))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.FakeMouseWithTouches));
        if (isSettingEnabled(settingsConfig, Flags.TouchInput))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.TouchInput));
        if (isSettingEnabled(settingsConfig, Flags.GamepadInput))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.GamepadInput));
        if (isSettingEnabled(settingsConfig, Flags.XRControllerInput))
          this.addSettingFlag(inputSettingsSection, this.flagsUi.get(Flags.XRControllerInput));
      }
      if (isSectionEnabled(settingsConfig, SettingsSections.Encoder)) {
        const encoderSettingsSection = this.buildSectionWithHeading(settingsElem, SettingsSections.Encoder);
        if (isSettingEnabled(settingsConfig, NumericParameters.CompatQualityMin))
          this.addSettingNumeric(encoderSettingsSection, this.numericParametersUi.get(NumericParameters.CompatQualityMin));
        if (isSettingEnabled(settingsConfig, NumericParameters.CompatQualityMax))
          this.addSettingNumeric(encoderSettingsSection, this.numericParametersUi.get(NumericParameters.CompatQualityMax));
        const preferredCodecOption = this.optionParametersUi.get(OptionParameters.PreferredCodec);
        if (isSettingEnabled(settingsConfig, OptionParameters.PreferredCodec))
          this.addSettingOption(encoderSettingsSection, this.optionParametersUi.get(OptionParameters.PreferredCodec));
        if (preferredCodecOption && [...preferredCodecOption.selector.options].map((o) => o.value).includes("Only available on Chrome")) {
          preferredCodecOption.disable();
        }
        if (isSettingEnabled(settingsConfig, OptionParameters.PreferredQuality))
          this.addSettingOption(encoderSettingsSection, this.optionParametersUi.get(OptionParameters.PreferredQuality));
      }
      if (isSectionEnabled(settingsConfig, SettingsSections.WebRTC)) {
        const webrtcSettingsSection = this.buildSectionWithHeading(settingsElem, SettingsSections.WebRTC);
        if (isSettingEnabled(settingsConfig, NumericParameters.WebRTCFPS))
          this.addSettingNumeric(webrtcSettingsSection, this.numericParametersUi.get(NumericParameters.WebRTCFPS));
        if (isSettingEnabled(settingsConfig, NumericParameters.WebRTCMinBitrate))
          this.addSettingNumeric(webrtcSettingsSection, this.numericParametersUi.get(NumericParameters.WebRTCMinBitrate));
        if (isSettingEnabled(settingsConfig, NumericParameters.WebRTCMaxBitrate))
          this.addSettingNumeric(webrtcSettingsSection, this.numericParametersUi.get(NumericParameters.WebRTCMaxBitrate));
      }
    }
    /**
     * Add a SettingText element to a particular settings section in the DOM and registers that text in the text settings map.
     * @param settingsSection - The settings section HTML element.
     * @param settingText - The textual settings object.
     */
    addSettingText(settingsSection, settingText) {
      if (settingText) {
        settingsSection.appendChild(settingText.rootElement);
        this.textParametersUi.set(settingText.setting.id, settingText);
      }
    }
    /**
     * Add a SettingFlag element to a particular settings section in the DOM and registers that flag in the Config.flag map.
     * @param settingsSection - The settings section HTML element.
     * @param settingFlag - The settings flag object.
     */
    addSettingFlag(settingsSection, settingFlag) {
      if (settingFlag) {
        settingsSection.appendChild(settingFlag.rootElement);
        this.flagsUi.set(settingFlag.setting.id, settingFlag);
      }
    }
    /**
     * Add a numeric setting element to a particular settings section in the DOM and registers that flag in the Config.numericParameters map.
     * @param settingsSection - The settings section HTML element.
     * @param settingFlag - The settings flag object.
     */
    addSettingNumeric(settingsSection, setting) {
      if (setting) {
        settingsSection.appendChild(setting.rootElement);
        this.numericParametersUi.set(setting.setting.id, setting);
      }
    }
    /**
     * Add an enum based settings element to a particular settings section in the DOM and registers that flag in the Config.enumParameters map.
     * @param settingsSection - The settings section HTML element.
     * @param settingFlag - The settings flag object.
     */
    addSettingOption(settingsSection, setting) {
      if (setting) {
        settingsSection.appendChild(setting.rootElement);
        this.optionParametersUi.set(setting.setting.id, setting);
      }
    }
    onSettingsChanged({ data: { id, target, type } }) {
      if (type === "flag") {
        const setting = this.flagsUi.get(id);
        if (setting) {
          if (setting.flag !== target.flag) {
            setting.flag = target.flag;
          }
          if (setting.label !== target.label) {
            setting.label = target.label;
          }
        }
      } else if (type === "number") {
        const setting = this.numericParametersUi.get(id);
        if (setting) {
          if (setting.number !== target.number) {
            setting.number = target.number;
          }
          if (setting.label !== target.label) {
            setting.label = target.label;
          }
        }
      } else if (type === "text") {
        const setting = this.textParametersUi.get(id);
        if (setting) {
          if (setting.text !== target.text) {
            setting.text = target.text;
          }
          if (setting.label !== target.label) {
            setting.label = target.label;
          }
        }
      } else if (type === "option") {
        const setting = this.optionParametersUi.get(id);
        if (setting) {
          const uiOptions = setting.options;
          const targetOptions = target.options;
          if (uiOptions.length !== targetOptions.length || !uiOptions.every((value) => targetOptions.includes(value))) {
            setting.options = target.options;
          }
          if (setting.selected !== target.selected) {
            setting.selected = target.selected;
          }
          if (setting.label !== target.label) {
            setting.label = target.label;
          }
        }
      }
    }
    /**
     * Add a callback to fire when the flag is toggled.
     * @param id - The id of the flag.
     * @param onChangeListener - The callback to fire when the value changes.
     */
    addCustomFlagOnSettingChangedListener(id, onChangeListener) {
      if (this.customFlags.has(id)) {
        this.customFlags.get(id).onChange = onChangeListener;
      }
    }
    /**
     * Set the label for the flag.
     * @param id - The id of the flag.
     * @param label - The new label to use for the flag.
     */
    setCustomFlagLabel(id, label) {
      if (!this.customFlags.has(id)) {
        Logger.Warning(`Cannot set label for flag called ${id} - it does not exist in the Config.flags map.`);
      } else {
        this.customFlags.get(id).label = label;
        this.flagsUi.get(id).label = label;
      }
    }
    /**
     * Get the value of the configuration flag which has the given id.
     * @param id - The unique id for the flag.
     * @returns True if the flag is enabled.
     */
    isCustomFlagEnabled(id) {
      return this.customFlags.get(id).flag;
    }
    disableSetting(id) {
      var _a, _b, _c, _d;
      if (isFlagId(id)) {
        (_a = this.flagsUi.get(id)) === null || _a === void 0 ? void 0 : _a.disable();
      } else if (isNumericId(id)) {
        (_b = this.numericParametersUi.get(id)) === null || _b === void 0 ? void 0 : _b.disable();
      } else if (isTextId(id)) {
        (_c = this.textParametersUi.get(id)) === null || _c === void 0 ? void 0 : _c.disable();
      } else if (isOptionId(id)) {
        (_d = this.optionParametersUi.get(id)) === null || _d === void 0 ? void 0 : _d.disable();
      }
    }
    enableSetting(id) {
      var _a, _b, _c, _d;
      if (isFlagId(id)) {
        (_a = this.flagsUi.get(id)) === null || _a === void 0 ? void 0 : _a.enable();
      } else if (isNumericId(id)) {
        (_b = this.numericParametersUi.get(id)) === null || _b === void 0 ? void 0 : _b.enable();
      } else if (isTextId(id)) {
        (_c = this.textParametersUi.get(id)) === null || _c === void 0 ? void 0 : _c.enable();
      } else if (isOptionId(id)) {
        (_d = this.optionParametersUi.get(id)) === null || _d === void 0 ? void 0 : _d.enable();
      }
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/UI/EditTextModal.js
  var EditConfirmedEvent = class extends CustomEvent {
    constructor(confirmedText) {
      super("editConfirmed", {
        detail: confirmedText,
        bubbles: true,
        cancelable: true
      });
      this.confirmedText = confirmedText;
    }
  };
  var EditTextModal = class {
    constructor() {
      this._rootElement = this.rootElement;
      this._events = new EventTarget();
    }
    // Bind to this if you want to handle edit confirmed
    get events() {
      return this._events;
    }
    showModal(existingTextAreaContents) {
      if (existingTextAreaContents) {
        existingTextAreaContents = existingTextAreaContents.replace(/\0/g, "");
        this.textArea.value = existingTextAreaContents;
      }
      this.textArea.focus();
      this.textArea.selectionStart = this.textArea.value.length;
    }
    /**
     * Get the root element that contains either the modal (mobile) or hidden text input (desktop)
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = document.createElement("div");
        this._rootElement.classList.add("modal");
        this._rootElement.appendChild(this.innerModal);
      }
      return this._rootElement;
    }
    get innerModal() {
      if (!this._innerModal) {
        this._innerModal = document.createElement("div");
        this._innerModal.classList.add("innerModal");
        this._innerModal.appendChild(this.editTextHeading);
        this._innerModal.appendChild(this.textArea);
        this._innerModal.appendChild(this.modalBtnContainer);
      }
      return this._innerModal;
    }
    get editTextHeading() {
      if (!this._editTextHeading) {
        this._editTextHeading = document.createElement("h2");
        this._editTextHeading.innerText = "Edit Text";
      }
      return this._editTextHeading;
    }
    get textArea() {
      if (!this._textArea) {
        this._textArea = document.createElement("textarea");
        this._textArea.classList.add("form-control");
        this._textArea.classList.add("modalTextArea");
        this._textArea.title = "Edit Text Area";
        this._textArea.placeholder = "UE text widget value here...";
        this.textArea.addEventListener("keypress", (event) => {
          event.stopPropagation();
        });
        this.textArea.addEventListener("keyup", (event) => {
          event.stopPropagation();
        });
        this.textArea.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });
        this.textArea.addEventListener("compositionend", (event) => {
          event.stopPropagation();
        });
      }
      return this._textArea;
    }
    get modalBtnContainer() {
      if (!this._modalBtnContainer) {
        this._modalBtnContainer = document.createElement("div");
        this._modalBtnContainer.classList.add("modalBtnContainer");
        this._modalBtnContainer.appendChild(this.cancelBtn);
        this._modalBtnContainer.appendChild(this.confirmBtn);
      }
      return this._modalBtnContainer;
    }
    get cancelBtn() {
      if (!this._cancelBtn) {
        this._cancelBtn = document.createElement("button");
        this._cancelBtn.classList.add("btn-flat");
        this._cancelBtn.innerText = "Cancel";
        this._cancelBtn.addEventListener("click", (event) => {
          this.rootElement.remove();
          event.stopPropagation();
        });
      }
      return this._cancelBtn;
    }
    get confirmBtn() {
      if (!this._confirmBtn) {
        this._confirmBtn = document.createElement("button");
        this._confirmBtn.classList.add("btn-flat");
        this._confirmBtn.innerText = "Confirm";
        this._confirmBtn.addEventListener("click", (event) => {
          this.events.dispatchEvent(new EditConfirmedEvent(this.textArea.value));
          this.rootElement.remove();
          event.stopPropagation();
        });
      }
      return this._confirmBtn;
    }
  };

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Application/Application.js
  var Application = class {
    /**
     * @param options - Initialization options
     */
    constructor(options) {
      this.editTextModal = null;
      this._options = options;
      this.stream = options.stream;
      this._uiFeatureElement = this.createUIFeaturesElement();
      this._rootElement = this.createRootElement(this.stream, this._uiFeatureElement);
      this.onColorModeChanged = options.onColorModeChanged;
      this.configUI = new ConfigUI(this.stream.config);
      this.createOverlays();
      if (isPanelEnabled(options.statsPanelConfig)) {
        this.statsPanel = new StatsPanel(options.statsPanelConfig);
        this.uiFeaturesElement.appendChild(this.statsPanel.rootElement);
      }
      if (isPanelEnabled(options.settingsPanelConfig)) {
        this.settingsPanel = new SettingsPanel();
        this.uiFeaturesElement.appendChild(this.settingsPanel.rootElement);
        this.configureSettings();
      }
      if (!options.videoQpIndicatorConfig || !options.videoQpIndicatorConfig.disableIndicator) {
        this.videoQpIndicator = new VideoQpIndicator(options.videoQpIndicatorConfig);
        this.uiFeaturesElement.appendChild(this.videoQpIndicator.rootElement);
      }
      this.createButtons();
      this.registerCallbacks();
      this.showConnectOrAutoConnectOverlays();
      this.setColorMode(this.configUI.isCustomFlagEnabled(ExtraFlags.LightMode));
      this.stream.config._addOnSettingChangedListener(Flags.HideUI, (isEnabled) => {
        this._uiFeatureElement.style.visibility = isEnabled ? "hidden" : "visible";
      });
      if (this.stream.config.isFlagEnabled(Flags.HideUI)) {
        this._uiFeatureElement.style.visibility = "hidden";
      }
    }
    createOverlays() {
      this.disconnectOverlay = new DisconnectOverlay(this.stream.videoElementParent);
      this.connectOverlay = new ConnectOverlay(this.stream.videoElementParent);
      this.playOverlay = new PlayOverlay(this.stream.videoElementParent);
      this.infoOverlay = new InfoOverlay(this.stream.videoElementParent);
      this.errorOverlay = new ErrorOverlay(this.stream.videoElementParent);
      this.afkOverlay = new AFKOverlay(this.stream.videoElementParent);
      this.disconnectOverlay.onAction(() => this.stream.reconnect());
      this.connectOverlay.onAction(() => this.stream.connect());
      this.playOverlay.onAction(() => this.stream.play());
    }
    /**
     * Set up button click functions and button functionality
     */
    createButtons() {
      const isIphone = /iPhone/.test(navigator.userAgent);
      const isIpad = /iPad/.test(navigator.userAgent) || /Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
      const isSafari = navigator.vendor && navigator.vendor.indexOf("Apple") > -1 && navigator.userAgent && navigator.userAgent.indexOf("CriOS") === -1 && navigator.userAgent.indexOf("FxiOS") === -1;
      const disableFullscreenButton = isIphone || !isSafari && isIpad;
      if (this._options.fullScreenControlsConfig === void 0 && disableFullscreenButton) {
        this._options.fullScreenControlsConfig = { creationMode: UIElementCreationMode.Disable };
      }
      const controlsUIConfig = {
        statsButtonType: this._options.statsPanelConfig ? this._options.statsPanelConfig.visibilityButtonConfig : void 0,
        settingsButtonType: this._options.settingsPanelConfig ? this._options.settingsPanelConfig.visibilityButtonConfig : void 0,
        fullscreenButtonType: this._options.fullScreenControlsConfig,
        xrIconType: this._options.xrControlsConfig,
        hideControlsInFullscreen: this._options.hideControlsInFullscreen
      };
      const controls = new Controls(controlsUIConfig);
      this.uiFeaturesElement.appendChild(controls.rootElement);
      const fullScreenButton = (
        // Depending on if we're creating an internal button, or using an external one
        !!this._options.fullScreenControlsConfig && this._options.fullScreenControlsConfig.creationMode === UIElementCreationMode.UseCustomElement ? (
          // Either create a fullscreen class based on the external button
          new FullScreenIconExternal(this._options.fullScreenControlsConfig.customElement)
        ) : (
          // Or use the one created by the Controls initializer earlier
          controls.fullscreenIcon
        )
      );
      if (fullScreenButton) {
        fullScreenButton.fullscreenElement = /iPad|iPhone|iPod/.test(navigator.userAgent) ? this.stream.videoElementParent.getElementsByTagName("video")[0] : this.rootElement;
      }
      const settingsButton = controls.settingsIcon ? controls.settingsIcon.rootElement : this._options.settingsPanelConfig.visibilityButtonConfig.customElement;
      if (settingsButton)
        settingsButton.onclick = () => this.settingsClicked();
      if (this.settingsPanel)
        this.settingsPanel.settingsCloseButton.onclick = () => this.settingsClicked();
      const xrButton = controls.xrIcon ? controls.xrIcon.rootElement : this._options.xrControlsConfig.creationMode === UIElementCreationMode.UseCustomElement ? this._options.xrControlsConfig.customElement : void 0;
      if (xrButton)
        xrButton.onclick = () => this.stream.toggleXR();
      const statsButton = controls.statsIcon ? controls.statsIcon.rootElement : this._options.statsPanelConfig.visibilityButtonConfig.customElement;
      if (statsButton)
        statsButton.onclick = () => this.statsClicked();
      if (this.statsPanel) {
        this.statsPanel.statsCloseButton.onclick = () => this.statsClicked();
      }
      if (this.settingsPanel) {
        const showFPSButton = new LabelledButton("Show FPS", "Toggle");
        showFPSButton.addOnClickListener(() => {
          this.stream.requestShowFps();
        });
        const restartStreamButton = new LabelledButton("Restart Stream", "Restart");
        restartStreamButton.addOnClickListener(() => {
          this.stream.reconnect();
        });
        const requestKeyframeButton = new LabelledButton("Request keyframe", "Request");
        requestKeyframeButton.addOnClickListener(() => {
          this.stream.requestIframe();
        });
        const commandsSectionElem = this.configUI.buildSectionWithHeading(this.settingsPanel.settingsContentElement, "Commands");
        commandsSectionElem.appendChild(showFPSButton.rootElement);
        commandsSectionElem.appendChild(requestKeyframeButton.rootElement);
        commandsSectionElem.appendChild(restartStreamButton.rootElement);
      }
    }
    /**
     * Configure the settings with on change listeners and any additional per experience settings.
     */
    configureSettings() {
      this.configUI.populateSettingsElement(this.settingsPanel.settingsContentElement, this._options.settingsPanelConfig);
      this.configUI.addCustomFlagOnSettingChangedListener(ExtraFlags.LightMode, (isLightMode) => {
        this.configUI.setCustomFlagLabel(ExtraFlags.LightMode, `Color Scheme: ${isLightMode ? "Light" : "Dark"} Mode`);
        this.setColorMode(isLightMode);
      });
    }
    registerCallbacks() {
      this.stream.addEventListener("afkWarningActivate", ({ data: { countDown, dismissAfk } }) => this.showAfkOverlay(countDown, dismissAfk));
      this.stream.addEventListener("afkWarningUpdate", ({ data: { countDown } }) => this.afkOverlay.updateCountdown(countDown));
      this.stream.addEventListener("afkWarningDeactivate", () => this.afkOverlay.hide());
      this.stream.addEventListener("afkTimedOut", () => this.afkOverlay.hide());
      this.stream.addEventListener("videoEncoderAvgQP", ({ data: { avgQP } }) => this.onVideoEncoderAvgQP(avgQP));
      this.stream.addEventListener("webRtcSdp", () => this.onWebRtcSdp());
      this.stream.addEventListener("webRtcAutoConnect", () => this.onWebRtcAutoConnect());
      this.stream.addEventListener("webRtcConnecting", () => this.onWebRtcConnecting());
      this.stream.addEventListener("webRtcConnected", () => this.onWebRtcConnected());
      this.stream.addEventListener("webRtcFailed", () => this.onWebRtcFailed());
      this.stream.addEventListener("webRtcDisconnected", ({ data: { eventString, allowClickToReconnect } }) => this.onDisconnect(eventString, allowClickToReconnect));
      this.stream.addEventListener("videoInitialized", () => this.onVideoInitialized());
      this.stream.addEventListener("streamLoading", () => this.onStreamLoading());
      this.stream.addEventListener("playStreamError", ({ data: { message } }) => this.onPlayStreamError(message));
      this.stream.addEventListener("playStream", () => this.onPlayStream());
      this.stream.addEventListener("playStreamRejected", ({ data: { reason } }) => this.onPlayStreamRejected(reason));
      this.stream.addEventListener("loadFreezeFrame", ({ data: { shouldShowPlayOverlay } }) => this.onLoadFreezeFrame(shouldShowPlayOverlay));
      this.stream.addEventListener("statsReceived", ({ data: { aggregatedStats } }) => this.onStatsReceived(aggregatedStats));
      this.stream.addEventListener("latencyCalculated", ({ data: { latencyInfo } }) => this.onLatencyUpdate(latencyInfo));
      this.stream.addEventListener("latencyTestResult", ({ data: { latencyTimings } }) => this.onLatencyTestResults(latencyTimings));
      this.stream.addEventListener("dataChannelLatencyTestResult", ({ data: { result } }) => this.onDataChannelLatencyTestResults(result));
      this.stream.addEventListener("streamerListMessage", ({ data: { messageStreamerList, autoSelectedStreamerId, wantedStreamerId } }) => this.handleStreamerListMessage(messageStreamerList, autoSelectedStreamerId, wantedStreamerId));
      this.stream.addEventListener("subscribeFailed", ({ data: { message } }) => this.handleSubscribeFailedMessage(message));
      this.stream.addEventListener("settingsChanged", (event) => this.onSettingsChanged(event));
      this.stream.addEventListener("playerCount", ({ data: { count } }) => this.onPlayerCount(count));
      this.stream.addEventListener("webRtcTCPRelayDetected", () => Logger.Warning(`Stream quailty degraded due to network enviroment, stream is relayed over TCP.`));
      this.stream.addEventListener("showOnScreenKeyboard", (event) => {
        if (!this.stream.config.isFlagEnabled(Flags.UseModalForTextInput)) {
          return;
        }
        const evtData = event.data;
        if (evtData.showOnScreenKeyboard) {
          this.showEditTextModal(evtData.contents);
        }
      });
    }
    /**
     * Gets the rootElement of the application, video stream and all UI are children of this element.
     */
    get rootElement() {
      if (!this._rootElement) {
        this._rootElement = this.createRootElement(this.stream, this.uiFeaturesElement);
      }
      return this._rootElement;
    }
    /**
     * Creates the root element for the Pixel Streaming UI.
     * Note: This should be called before the Pixel Streaming object is created.
     * @param pixelstreaming - The Pixel Streaming object.
     * @param uiFeaturesElem - The element holding all the custom UI features.
     * @returns A div with the id #playerUI populated with videoElementParent and uiFeatureElement.
     */
    createRootElement(pixelstreaming, uiFeaturesElem) {
      const elem = document.createElement("div");
      elem.id = "playerUI";
      elem.classList.add("noselect");
      if (pixelstreaming === void 0) {
        throw new Error("Could not create root element properly - pixelstreaming object was undefined. Are you calling this too early?");
      }
      if (pixelstreaming.videoElementParent === void 0) {
        throw new Error("Could not create root element properly - videoElementParent object was undefined. Are you calling this too early?");
      }
      if (uiFeaturesElem === void 0) {
        throw new Error("Could not create root element properly - uiFeaturesElement object was undefined. Are you calling this too early?");
      }
      elem.appendChild(pixelstreaming.videoElementParent);
      elem.appendChild(uiFeaturesElem);
      return elem;
    }
    /**
     * Gets the element that contains all the UI features, like the stats and settings panels.
     */
    get uiFeaturesElement() {
      if (!this._uiFeatureElement) {
        this._uiFeatureElement = this.createUIFeaturesElement();
      }
      return this._uiFeatureElement;
    }
    /**
     * Creates the UI features element for holding all the custom UI features.
     * @returns A div with the id #uiFeatures.
     */
    createUIFeaturesElement() {
      const elem = document.createElement("div");
      elem.id = "uiFeatures";
      return elem;
    }
    /**
     * Shows the disconnect overlay
     * @param updateText - the text that will be displayed in the overlay
     */
    showDisconnectOverlay(updateText) {
      this.hideCurrentOverlay();
      this.updateDisconnectOverlay(updateText);
      this.disconnectOverlay.show();
      this.currentOverlay = this.disconnectOverlay;
    }
    /**
     * Update the disconnect overlays span text
     * @param updateText - the new countdown number
     */
    updateDisconnectOverlay(updateText) {
      this.disconnectOverlay.update(updateText);
    }
    /**
     * Activates the disconnect overlays action
     */
    onDisconnectionAction() {
      this.disconnectOverlay.activate();
    }
    /**
     * Hides the current overlay
     */
    hideCurrentOverlay() {
      if (this.currentOverlay != null) {
        this.currentOverlay.hide();
        this.currentOverlay = null;
      }
    }
    /**
     * Shows the connect overlay
     */
    showConnectOverlay() {
      this.hideCurrentOverlay();
      this.connectOverlay.show();
      this.currentOverlay = this.connectOverlay;
    }
    /**
     * Shows the play overlay
     */
    showPlayOverlay() {
      this.hideCurrentOverlay();
      this.playOverlay.show();
      this.currentOverlay = this.playOverlay;
    }
    /**
     * Shows the text overlay
     * @param text - the text that will be shown in the overlay
     */
    showTextOverlay(text) {
      this.hideCurrentOverlay();
      this.infoOverlay.update(text);
      this.infoOverlay.show();
      this.currentOverlay = this.infoOverlay;
    }
    /**
     * Shows the error overlay
     * @param text - the text that will be shown in the overlay
     */
    showErrorOverlay(text) {
      this.hideCurrentOverlay();
      this.errorOverlay.update(text);
      this.errorOverlay.show();
      this.currentOverlay = this.errorOverlay;
    }
    /**
     * Shows or hides the settings panel if clicked
     */
    settingsClicked() {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.hide();
      this.settingsPanel.toggleVisibility();
    }
    /**
     * Shows or hides the stats panel if clicked
     */
    statsClicked() {
      var _a;
      (_a = this.settingsPanel) === null || _a === void 0 ? void 0 : _a.hide();
      this.statsPanel.toggleVisibility();
    }
    /**
     * Activates the connect overlays action
     */
    onConnectAction() {
      this.connectOverlay.activate();
    }
    /**
     * Activates the play overlays action
     */
    onPlayAction() {
      this.playOverlay.activate();
    }
    /**
     * Shows the afk overlay
     * @param countDown - the countdown number for the afk countdown
     */
    showAfkOverlay(countDown, dismissAfk) {
      this.hideCurrentOverlay();
      this.afkOverlay.updateCountdown(countDown);
      this.afkOverlay.onAction(() => dismissAfk());
      this.afkOverlay.show();
      this.currentOverlay = this.afkOverlay;
    }
    /**
     * Show the Connect Overlay or auto connect
     */
    showConnectOrAutoConnectOverlays() {
      if (!this.stream.config.isFlagEnabled(Flags.AutoConnect)) {
        this.showConnectOverlay();
      }
    }
    /**
     * Show the webRtcAutoConnect Overlay and connect
     */
    onWebRtcAutoConnect() {
      this.showTextOverlay("Auto Connecting Now");
    }
    /**
     * Set up functionality to happen when receiving a webRTC answer
     */
    onWebRtcSdp() {
      this.showTextOverlay("WebRTC Connection Negotiated");
    }
    /**
     * Shows a text overlay to alert the user the stream is currently loading
     */
    onStreamLoading() {
      const spinnerSpan = document.createElement("span");
      spinnerSpan.className = "visually-hidden";
      spinnerSpan.innerHTML = "Loading...";
      const spinnerDiv = document.createElement("div");
      spinnerDiv.id = "loading-spinner";
      spinnerDiv.className = "spinner-border ms-2";
      spinnerDiv.setAttribute("role", "status");
      spinnerDiv.appendChild(spinnerSpan);
      this.showTextOverlay("Loading Stream " + spinnerDiv.outerHTML);
    }
    /**
     * Event fired when the video is disconnected - displays the error overlay and resets the buttons stream tools upon disconnect
     * @param eventString - the event text that will be shown in the overlay
     * @param allowClickToReconnect - true if we want to allow the user to click to reconnect. Otherwise it's just a message.
     */
    onDisconnect(eventString, allowClickToReconnect) {
      var _a;
      const overlayMessage = "Disconnected" + (eventString ? `: ${eventString}` : ".");
      if (allowClickToReconnect) {
        this.showDisconnectOverlay(`${overlayMessage} Click To Restart.`);
      } else {
        this.showErrorOverlay(overlayMessage);
      }
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.onDisconnect();
    }
    /**
     * Handles when Web Rtc is connecting
     */
    onWebRtcConnecting() {
      this.showTextOverlay("Starting connection to server, please wait");
    }
    /**
     * Handles when Web Rtc has connected
     */
    onWebRtcConnected() {
      this.showTextOverlay("WebRTC connected, waiting for video");
    }
    /**
     * Handles when Web Rtc fails to connect
     */
    onWebRtcFailed() {
      this.showErrorOverlay("Unable to setup video");
    }
    onLoadFreezeFrame(shouldShowPlayOverlay) {
      if (shouldShowPlayOverlay === true) {
        Logger.Info("showing play overlay");
        this.showPlayOverlay();
      }
    }
    onPlayStream() {
      this.hideCurrentOverlay();
    }
    onPlayStreamError(message) {
      this.showErrorOverlay(message);
    }
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    onPlayStreamRejected(onRejectedReason) {
      this.showPlayOverlay();
    }
    onVideoInitialized() {
      var _a;
      if (!this.stream.config.isFlagEnabled(Flags.AutoPlayVideo)) {
        this.showPlayOverlay();
      }
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.onVideoInitialized(this.stream);
    }
    /**
     * Set up functionality to happen when calculating the average video encoder qp
     * @param QP - the quality number of the stream
     */
    onVideoEncoderAvgQP(QP) {
      if (this.videoQpIndicator) {
        this.videoQpIndicator.updateQpTooltip(QP);
      }
    }
    onInitialSettings(settings) {
      var _a;
      if (settings.PixelStreamingSettings) {
        (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.configure(settings.PixelStreamingSettings);
      }
    }
    onStatsReceived(aggregatedStats) {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.handleStats(aggregatedStats);
    }
    onLatencyUpdate(latencyInfo) {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.handleLatencyInfo(latencyInfo);
    }
    onLatencyTestResults(latencyTimings) {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.latencyTest.handleTestResult(latencyTimings);
    }
    onDataChannelLatencyTestResults(result) {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.dataChannelLatencyTest.handleTestResult(result);
    }
    onPlayerCount(playerCount2) {
      var _a;
      (_a = this.statsPanel) === null || _a === void 0 ? void 0 : _a.handlePlayerCount(playerCount2);
    }
    handleStreamerListMessage(messageStreamingList, autoSelectedStreamerId, wantedStreamerId) {
      const waitForStreamer = this.stream.config.isFlagEnabled(Flags.WaitForStreamer);
      const isReconnecting = this.stream.isReconnecting();
      let message = null;
      let allowRestart = true;
      if (!autoSelectedStreamerId) {
        if (waitForStreamer && wantedStreamerId) {
          if (isReconnecting) {
            message = `Waiting for ${wantedStreamerId} to become available.`;
            allowRestart = false;
          } else {
            message = `Gave up waiting for ${wantedStreamerId} to become available. Click to try again`;
            if (messageStreamingList.ids.length > 0) {
              message += ` or select a streamer from the settings menu.`;
            }
            allowRestart = true;
          }
        } else if (messageStreamingList.ids.length === 0) {
          if (isReconnecting) {
            message = `Waiting for a streamer to become available.`;
            allowRestart = false;
          } else {
            message = `No streamers available. Click to try again.`;
            allowRestart = true;
          }
        } else {
          message = `Multiple streamers available. Select one from the settings menu.`;
          allowRestart = false;
        }
        if (allowRestart) {
          this.showDisconnectOverlay(message);
        } else {
          this.showTextOverlay(message);
        }
      }
    }
    handleSubscribeFailedMessage(message) {
      this.showDisconnectOverlay(`Subscribe failed: "${message}" Click to try again`);
    }
    /**
     * Set light/dark color mode
     * @param isLightMode - should we use a light or dark color scheme
     */
    setColorMode(isLightMode) {
      if (this.onColorModeChanged) {
        this.onColorModeChanged(isLightMode);
      }
    }
    showEditTextModal(ueTextboxContents) {
      var _a;
      (_a = this.editTextModal) === null || _a === void 0 ? void 0 : _a.rootElement.remove();
      this.editTextModal = new EditTextModal();
      this.rootElement.append(this.editTextModal.rootElement);
      this.editTextModal.showModal(ueTextboxContents);
      this.editTextModal.events.addEventListener("editConfirmed", (evt) => {
        const editTextEvent = evt;
        this.stream.sendTextboxEntry(editTextEvent.confirmedText);
      });
    }
    onSettingsChanged(event) {
      this.configUI.onSettingsChanged(event);
      const {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        data: { id, target, type }
      } = event;
      if (id === OptionParameters.PreferredQuality) {
        const preferredQualityOption = this.stream.config.getSettingOption(OptionParameters.PreferredQuality);
        if ([...preferredQualityOption.options].includes("Default")) {
          this.configUI.disableSetting(OptionParameters.PreferredQuality);
        } else {
          this.configUI.enableSetting(OptionParameters.PreferredQuality);
        }
      }
    }
  };

  // node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  // node_modules/is-in-browser/dist/module.js
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
  } : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };
  var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof(document)) === "object" && document.nodeType === 9;
  var module_default = isBrowser;

  // node_modules/tiny-warning/dist/tiny-warning.esm.js
  var isProduction = false;
  function warning(condition, message) {
    if (!isProduction) {
      if (condition) {
        return;
      }
      var text = "Warning: " + message;
      if (typeof console !== "undefined") {
        console.warn(text);
      }
      try {
        throw Error(text);
      } catch (x) {
      }
    }
  }
  var tiny_warning_esm_default = warning;

  // node_modules/@babel/runtime/helpers/esm/typeof.js
  function _typeof2(o) {
    "@babel/helpers - typeof";
    return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof2(o);
  }

  // node_modules/@babel/runtime/helpers/esm/toPrimitive.js
  function toPrimitive(t, e) {
    if ("object" != _typeof2(t) || !t) return t;
    var r;
    if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) {
      var i = r.call(t, e || "default");
      if ("object" != _typeof2(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === e ? String : Number)(t);
  }

  // node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
  function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof2(i) ? i : i + "";
  }

  // node_modules/@babel/runtime/helpers/esm/createClass.js
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: false
    }), e;
  }

  // node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
      return t2.__proto__ = e2, t2;
    }, _setPrototypeOf(t, e);
  }

  // node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
  function _inheritsLoose(t, o) {
    t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
  }

  // node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }

  // node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r[n];
    }
    return t;
  }

  // node_modules/jss/dist/jss.esm.js
  var plainObjectConstrurctor = {}.constructor;
  function cloneStyle(style) {
    if (style == null || typeof style !== "object") return style;
    if (Array.isArray(style)) return style.map(cloneStyle);
    if (style.constructor !== plainObjectConstrurctor) return style;
    var newStyle = {};
    for (var name in style) {
      newStyle[name] = cloneStyle(style[name]);
    }
    return newStyle;
  }
  function createRule(name, decl, options) {
    if (name === void 0) {
      name = "unnamed";
    }
    var jss = options.jss;
    var declCopy = cloneStyle(decl);
    var rule = jss.plugins.onCreateRule(name, declCopy, options);
    if (rule) return rule;
    if (name[0] === "@") {
      true ? tiny_warning_esm_default(false, "[JSS] Unknown rule " + name) : void 0;
    }
    return null;
  }
  var join = function join2(value, by) {
    var result = "";
    for (var i = 0; i < value.length; i++) {
      if (value[i] === "!important") break;
      if (result) result += by;
      result += value[i];
    }
    return result;
  };
  var toCssValue = function toCssValue2(value) {
    if (!Array.isArray(value)) return value;
    var cssValue = "";
    if (Array.isArray(value[0])) {
      for (var i = 0; i < value.length; i++) {
        if (value[i] === "!important") break;
        if (cssValue) cssValue += ", ";
        cssValue += join(value[i], " ");
      }
    } else cssValue = join(value, ", ");
    if (value[value.length - 1] === "!important") {
      cssValue += " !important";
    }
    return cssValue;
  };
  function getWhitespaceSymbols(options) {
    if (options && options.format === false) {
      return {
        linebreak: "",
        space: ""
      };
    }
    return {
      linebreak: "\n",
      space: " "
    };
  }
  function indentStr(str, indent) {
    var result = "";
    for (var index2 = 0; index2 < indent; index2++) {
      result += "  ";
    }
    return result + str;
  }
  function toCss(selector, style, options) {
    if (options === void 0) {
      options = {};
    }
    var result = "";
    if (!style) return result;
    var _options = options, _options$indent = _options.indent, indent = _options$indent === void 0 ? 0 : _options$indent;
    var fallbacks = style.fallbacks;
    if (options.format === false) {
      indent = -Infinity;
    }
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak, space = _getWhitespaceSymbols.space;
    if (selector) indent++;
    if (fallbacks) {
      if (Array.isArray(fallbacks)) {
        for (var index2 = 0; index2 < fallbacks.length; index2++) {
          var fallback = fallbacks[index2];
          for (var prop in fallback) {
            var value = fallback[prop];
            if (value != null) {
              if (result) result += linebreak;
              result += indentStr(prop + ":" + space + toCssValue(value) + ";", indent);
            }
          }
        }
      } else {
        for (var _prop in fallbacks) {
          var _value = fallbacks[_prop];
          if (_value != null) {
            if (result) result += linebreak;
            result += indentStr(_prop + ":" + space + toCssValue(_value) + ";", indent);
          }
        }
      }
    }
    for (var _prop2 in style) {
      var _value2 = style[_prop2];
      if (_value2 != null && _prop2 !== "fallbacks") {
        if (result) result += linebreak;
        result += indentStr(_prop2 + ":" + space + toCssValue(_value2) + ";", indent);
      }
    }
    if (!result && !options.allowEmpty) return result;
    if (!selector) return result;
    indent--;
    if (result) result = "" + linebreak + result + linebreak;
    return indentStr("" + selector + space + "{" + result, indent) + indentStr("}", indent);
  }
  var escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
  var nativeEscape = typeof CSS !== "undefined" && CSS.escape;
  var escape = (function(str) {
    return nativeEscape ? nativeEscape(str) : str.replace(escapeRegex, "\\$1");
  });
  var BaseStyleRule = /* @__PURE__ */ (function() {
    function BaseStyleRule2(key, style, options) {
      this.type = "style";
      this.isProcessed = false;
      var sheet = options.sheet, Renderer = options.Renderer;
      this.key = key;
      this.options = options;
      this.style = style;
      if (sheet) this.renderer = sheet.renderer;
      else if (Renderer) this.renderer = new Renderer();
    }
    var _proto = BaseStyleRule2.prototype;
    _proto.prop = function prop(name, value, options) {
      if (value === void 0) return this.style[name];
      var force = options ? options.force : false;
      if (!force && this.style[name] === value) return this;
      var newValue = value;
      if (!options || options.process !== false) {
        newValue = this.options.jss.plugins.onChangeValue(value, name, this);
      }
      var isEmpty = newValue == null || newValue === false;
      var isDefined = name in this.style;
      if (isEmpty && !isDefined && !force) return this;
      var remove = isEmpty && isDefined;
      if (remove) delete this.style[name];
      else this.style[name] = newValue;
      if (this.renderable && this.renderer) {
        if (remove) this.renderer.removeProperty(this.renderable, name);
        else this.renderer.setProperty(this.renderable, name, newValue);
        return this;
      }
      var sheet = this.options.sheet;
      if (sheet && sheet.attached) {
        true ? tiny_warning_esm_default(false, '[JSS] Rule is not linked. Missing sheet option "link: true".') : void 0;
      }
      return this;
    };
    return BaseStyleRule2;
  })();
  var StyleRule = /* @__PURE__ */ (function(_BaseStyleRule) {
    _inheritsLoose(StyleRule2, _BaseStyleRule);
    function StyleRule2(key, style, options) {
      var _this;
      _this = _BaseStyleRule.call(this, key, style, options) || this;
      var selector = options.selector, scoped = options.scoped, sheet = options.sheet, generateId = options.generateId;
      if (selector) {
        _this.selectorText = selector;
      } else if (scoped !== false) {
        _this.id = generateId(_assertThisInitialized(_assertThisInitialized(_this)), sheet);
        _this.selectorText = "." + escape(_this.id);
      }
      return _this;
    }
    var _proto2 = StyleRule2.prototype;
    _proto2.applyTo = function applyTo(renderable) {
      var renderer = this.renderer;
      if (renderer) {
        var json = this.toJSON();
        for (var prop in json) {
          renderer.setProperty(renderable, prop, json[prop]);
        }
      }
      return this;
    };
    _proto2.toJSON = function toJSON() {
      var json = {};
      for (var prop in this.style) {
        var value = this.style[prop];
        if (typeof value !== "object") json[prop] = value;
        else if (Array.isArray(value)) json[prop] = toCssValue(value);
      }
      return json;
    };
    _proto2.toString = function toString(options) {
      var sheet = this.options.sheet;
      var link = sheet ? sheet.options.link : false;
      var opts = link ? _extends({}, options, {
        allowEmpty: true
      }) : options;
      return toCss(this.selectorText, this.style, opts);
    };
    _createClass(StyleRule2, [{
      key: "selector",
      set: function set(selector) {
        if (selector === this.selectorText) return;
        this.selectorText = selector;
        var renderer = this.renderer, renderable = this.renderable;
        if (!renderable || !renderer) return;
        var hasChanged = renderer.setSelector(renderable, selector);
        if (!hasChanged) {
          renderer.replaceRule(renderable, this);
        }
      },
      get: function get() {
        return this.selectorText;
      }
    }]);
    return StyleRule2;
  })(BaseStyleRule);
  var pluginStyleRule = {
    onCreateRule: function onCreateRule(key, style, options) {
      if (key[0] === "@" || options.parent && options.parent.type === "keyframes") {
        return null;
      }
      return new StyleRule(key, style, options);
    }
  };
  var defaultToStringOptions = {
    indent: 1,
    children: true
  };
  var atRegExp = /@([\w-]+)/;
  var ConditionalRule = /* @__PURE__ */ (function() {
    function ConditionalRule2(key, styles, options) {
      this.type = "conditional";
      this.isProcessed = false;
      this.key = key;
      var atMatch = key.match(atRegExp);
      this.at = atMatch ? atMatch[1] : "unknown";
      this.query = options.name || "@" + this.at;
      this.options = options;
      this.rules = new RuleList(_extends({}, options, {
        parent: this
      }));
      for (var name in styles) {
        this.rules.add(name, styles[name]);
      }
      this.rules.process();
    }
    var _proto = ConditionalRule2.prototype;
    _proto.getRule = function getRule(name) {
      return this.rules.get(name);
    };
    _proto.indexOf = function indexOf(rule) {
      return this.rules.indexOf(rule);
    };
    _proto.addRule = function addRule(name, style, options) {
      var rule = this.rules.add(name, style, options);
      if (!rule) return null;
      this.options.jss.plugins.onProcessRule(rule);
      return rule;
    };
    _proto.replaceRule = function replaceRule(name, style, options) {
      var newRule = this.rules.replace(name, style, options);
      if (newRule) this.options.jss.plugins.onProcessRule(newRule);
      return newRule;
    };
    _proto.toString = function toString(options) {
      if (options === void 0) {
        options = defaultToStringOptions;
      }
      var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
      if (options.indent == null) options.indent = defaultToStringOptions.indent;
      if (options.children == null) options.children = defaultToStringOptions.children;
      if (options.children === false) {
        return this.query + " {}";
      }
      var children = this.rules.toString(options);
      return children ? this.query + " {" + linebreak + children + linebreak + "}" : "";
    };
    return ConditionalRule2;
  })();
  var keyRegExp = /@container|@media|@supports\s+/;
  var pluginConditionalRule = {
    onCreateRule: function onCreateRule2(key, styles, options) {
      return keyRegExp.test(key) ? new ConditionalRule(key, styles, options) : null;
    }
  };
  var defaultToStringOptions$1 = {
    indent: 1,
    children: true
  };
  var nameRegExp = /@keyframes\s+([\w-]+)/;
  var KeyframesRule = /* @__PURE__ */ (function() {
    function KeyframesRule2(key, frames, options) {
      this.type = "keyframes";
      this.at = "@keyframes";
      this.isProcessed = false;
      var nameMatch = key.match(nameRegExp);
      if (nameMatch && nameMatch[1]) {
        this.name = nameMatch[1];
      } else {
        this.name = "noname";
        true ? tiny_warning_esm_default(false, "[JSS] Bad keyframes name " + key) : void 0;
      }
      this.key = this.type + "-" + this.name;
      this.options = options;
      var scoped = options.scoped, sheet = options.sheet, generateId = options.generateId;
      this.id = scoped === false ? this.name : escape(generateId(this, sheet));
      this.rules = new RuleList(_extends({}, options, {
        parent: this
      }));
      for (var name in frames) {
        this.rules.add(name, frames[name], _extends({}, options, {
          parent: this
        }));
      }
      this.rules.process();
    }
    var _proto = KeyframesRule2.prototype;
    _proto.toString = function toString(options) {
      if (options === void 0) {
        options = defaultToStringOptions$1;
      }
      var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
      if (options.indent == null) options.indent = defaultToStringOptions$1.indent;
      if (options.children == null) options.children = defaultToStringOptions$1.children;
      if (options.children === false) {
        return this.at + " " + this.id + " {}";
      }
      var children = this.rules.toString(options);
      if (children) children = "" + linebreak + children + linebreak;
      return this.at + " " + this.id + " {" + children + "}";
    };
    return KeyframesRule2;
  })();
  var keyRegExp$1 = /@keyframes\s+/;
  var refRegExp = /\$([\w-]+)/g;
  var findReferencedKeyframe = function findReferencedKeyframe2(val, keyframes) {
    if (typeof val === "string") {
      return val.replace(refRegExp, function(match, name) {
        if (name in keyframes) {
          return keyframes[name];
        }
        true ? tiny_warning_esm_default(false, '[JSS] Referenced keyframes rule "' + name + '" is not defined.') : void 0;
        return match;
      });
    }
    return val;
  };
  var replaceRef = function replaceRef2(style, prop, keyframes) {
    var value = style[prop];
    var refKeyframe = findReferencedKeyframe(value, keyframes);
    if (refKeyframe !== value) {
      style[prop] = refKeyframe;
    }
  };
  var pluginKeyframesRule = {
    onCreateRule: function onCreateRule3(key, frames, options) {
      return typeof key === "string" && keyRegExp$1.test(key) ? new KeyframesRule(key, frames, options) : null;
    },
    // Animation name ref replacer.
    onProcessStyle: function onProcessStyle(style, rule, sheet) {
      if (rule.type !== "style" || !sheet) return style;
      if ("animation-name" in style) replaceRef(style, "animation-name", sheet.keyframes);
      if ("animation" in style) replaceRef(style, "animation", sheet.keyframes);
      return style;
    },
    onChangeValue: function onChangeValue(val, prop, rule) {
      var sheet = rule.options.sheet;
      if (!sheet) {
        return val;
      }
      switch (prop) {
        case "animation":
          return findReferencedKeyframe(val, sheet.keyframes);
        case "animation-name":
          return findReferencedKeyframe(val, sheet.keyframes);
        default:
          return val;
      }
    }
  };
  var KeyframeRule = /* @__PURE__ */ (function(_BaseStyleRule) {
    _inheritsLoose(KeyframeRule2, _BaseStyleRule);
    function KeyframeRule2() {
      return _BaseStyleRule.apply(this, arguments) || this;
    }
    var _proto = KeyframeRule2.prototype;
    _proto.toString = function toString(options) {
      var sheet = this.options.sheet;
      var link = sheet ? sheet.options.link : false;
      var opts = link ? _extends({}, options, {
        allowEmpty: true
      }) : options;
      return toCss(this.key, this.style, opts);
    };
    return KeyframeRule2;
  })(BaseStyleRule);
  var pluginKeyframeRule = {
    onCreateRule: function onCreateRule4(key, style, options) {
      if (options.parent && options.parent.type === "keyframes") {
        return new KeyframeRule(key, style, options);
      }
      return null;
    }
  };
  var FontFaceRule = /* @__PURE__ */ (function() {
    function FontFaceRule2(key, style, options) {
      this.type = "font-face";
      this.at = "@font-face";
      this.isProcessed = false;
      this.key = key;
      this.style = style;
      this.options = options;
    }
    var _proto = FontFaceRule2.prototype;
    _proto.toString = function toString(options) {
      var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
      if (Array.isArray(this.style)) {
        var str = "";
        for (var index2 = 0; index2 < this.style.length; index2++) {
          str += toCss(this.at, this.style[index2]);
          if (this.style[index2 + 1]) str += linebreak;
        }
        return str;
      }
      return toCss(this.at, this.style, options);
    };
    return FontFaceRule2;
  })();
  var keyRegExp$2 = /@font-face/;
  var pluginFontFaceRule = {
    onCreateRule: function onCreateRule5(key, style, options) {
      return keyRegExp$2.test(key) ? new FontFaceRule(key, style, options) : null;
    }
  };
  var ViewportRule = /* @__PURE__ */ (function() {
    function ViewportRule2(key, style, options) {
      this.type = "viewport";
      this.at = "@viewport";
      this.isProcessed = false;
      this.key = key;
      this.style = style;
      this.options = options;
    }
    var _proto = ViewportRule2.prototype;
    _proto.toString = function toString(options) {
      return toCss(this.key, this.style, options);
    };
    return ViewportRule2;
  })();
  var pluginViewportRule = {
    onCreateRule: function onCreateRule6(key, style, options) {
      return key === "@viewport" || key === "@-ms-viewport" ? new ViewportRule(key, style, options) : null;
    }
  };
  var SimpleRule = /* @__PURE__ */ (function() {
    function SimpleRule2(key, value, options) {
      this.type = "simple";
      this.isProcessed = false;
      this.key = key;
      this.value = value;
      this.options = options;
    }
    var _proto = SimpleRule2.prototype;
    _proto.toString = function toString(options) {
      if (Array.isArray(this.value)) {
        var str = "";
        for (var index2 = 0; index2 < this.value.length; index2++) {
          str += this.key + " " + this.value[index2] + ";";
          if (this.value[index2 + 1]) str += "\n";
        }
        return str;
      }
      return this.key + " " + this.value + ";";
    };
    return SimpleRule2;
  })();
  var keysMap = {
    "@charset": true,
    "@import": true,
    "@namespace": true
  };
  var pluginSimpleRule = {
    onCreateRule: function onCreateRule7(key, value, options) {
      return key in keysMap ? new SimpleRule(key, value, options) : null;
    }
  };
  var plugins = [pluginStyleRule, pluginConditionalRule, pluginKeyframesRule, pluginKeyframeRule, pluginFontFaceRule, pluginViewportRule, pluginSimpleRule];
  var defaultUpdateOptions = {
    process: true
  };
  var forceUpdateOptions = {
    force: true,
    process: true
    /**
     * Contains rules objects and allows adding/removing etc.
     * Is used for e.g. by `StyleSheet` or `ConditionalRule`.
     */
  };
  var RuleList = /* @__PURE__ */ (function() {
    function RuleList2(options) {
      this.map = {};
      this.raw = {};
      this.index = [];
      this.counter = 0;
      this.options = options;
      this.classes = options.classes;
      this.keyframes = options.keyframes;
    }
    var _proto = RuleList2.prototype;
    _proto.add = function add(name, decl, ruleOptions) {
      var _this$options = this.options, parent = _this$options.parent, sheet = _this$options.sheet, jss = _this$options.jss, Renderer = _this$options.Renderer, generateId = _this$options.generateId, scoped = _this$options.scoped;
      var options = _extends({
        classes: this.classes,
        parent,
        sheet,
        jss,
        Renderer,
        generateId,
        scoped,
        name,
        keyframes: this.keyframes,
        selector: void 0
      }, ruleOptions);
      var key = name;
      if (name in this.raw) {
        key = name + "-d" + this.counter++;
      }
      this.raw[key] = decl;
      if (key in this.classes) {
        options.selector = "." + escape(this.classes[key]);
      }
      var rule = createRule(key, decl, options);
      if (!rule) return null;
      this.register(rule);
      var index2 = options.index === void 0 ? this.index.length : options.index;
      this.index.splice(index2, 0, rule);
      return rule;
    };
    _proto.replace = function replace(name, decl, ruleOptions) {
      var oldRule = this.get(name);
      var oldIndex = this.index.indexOf(oldRule);
      if (oldRule) {
        this.remove(oldRule);
      }
      var options = ruleOptions;
      if (oldIndex !== -1) options = _extends({}, ruleOptions, {
        index: oldIndex
      });
      return this.add(name, decl, options);
    };
    _proto.get = function get(nameOrSelector) {
      return this.map[nameOrSelector];
    };
    _proto.remove = function remove(rule) {
      this.unregister(rule);
      delete this.raw[rule.key];
      this.index.splice(this.index.indexOf(rule), 1);
    };
    _proto.indexOf = function indexOf(rule) {
      return this.index.indexOf(rule);
    };
    _proto.process = function process2() {
      var plugins2 = this.options.jss.plugins;
      this.index.slice(0).forEach(plugins2.onProcessRule, plugins2);
    };
    _proto.register = function register(rule) {
      this.map[rule.key] = rule;
      if (rule instanceof StyleRule) {
        this.map[rule.selector] = rule;
        if (rule.id) this.classes[rule.key] = rule.id;
      } else if (rule instanceof KeyframesRule && this.keyframes) {
        this.keyframes[rule.name] = rule.id;
      }
    };
    _proto.unregister = function unregister(rule) {
      delete this.map[rule.key];
      if (rule instanceof StyleRule) {
        delete this.map[rule.selector];
        delete this.classes[rule.key];
      } else if (rule instanceof KeyframesRule) {
        delete this.keyframes[rule.name];
      }
    };
    _proto.update = function update() {
      var name;
      var data;
      var options;
      if (typeof (arguments.length <= 0 ? void 0 : arguments[0]) === "string") {
        name = arguments.length <= 0 ? void 0 : arguments[0];
        data = arguments.length <= 1 ? void 0 : arguments[1];
        options = arguments.length <= 2 ? void 0 : arguments[2];
      } else {
        data = arguments.length <= 0 ? void 0 : arguments[0];
        options = arguments.length <= 1 ? void 0 : arguments[1];
        name = null;
      }
      if (name) {
        this.updateOne(this.get(name), data, options);
      } else {
        for (var index2 = 0; index2 < this.index.length; index2++) {
          this.updateOne(this.index[index2], data, options);
        }
      }
    };
    _proto.updateOne = function updateOne(rule, data, options) {
      if (options === void 0) {
        options = defaultUpdateOptions;
      }
      var _this$options2 = this.options, plugins2 = _this$options2.jss.plugins, sheet = _this$options2.sheet;
      if (rule.rules instanceof RuleList2) {
        rule.rules.update(data, options);
        return;
      }
      var style = rule.style;
      plugins2.onUpdate(data, rule, sheet, options);
      if (options.process && style && style !== rule.style) {
        plugins2.onProcessStyle(rule.style, rule, sheet);
        for (var prop in rule.style) {
          var nextValue = rule.style[prop];
          var prevValue = style[prop];
          if (nextValue !== prevValue) {
            rule.prop(prop, nextValue, forceUpdateOptions);
          }
        }
        for (var _prop in style) {
          var _nextValue = rule.style[_prop];
          var _prevValue = style[_prop];
          if (_nextValue == null && _nextValue !== _prevValue) {
            rule.prop(_prop, null, forceUpdateOptions);
          }
        }
      }
    };
    _proto.toString = function toString(options) {
      var str = "";
      var sheet = this.options.sheet;
      var link = sheet ? sheet.options.link : false;
      var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
      for (var index2 = 0; index2 < this.index.length; index2++) {
        var rule = this.index[index2];
        var css = rule.toString(options);
        if (!css && !link) continue;
        if (str) str += linebreak;
        str += css;
      }
      return str;
    };
    return RuleList2;
  })();
  var StyleSheet = /* @__PURE__ */ (function() {
    function StyleSheet2(styles, options) {
      this.attached = false;
      this.deployed = false;
      this.classes = {};
      this.keyframes = {};
      this.options = _extends({}, options, {
        sheet: this,
        parent: this,
        classes: this.classes,
        keyframes: this.keyframes
      });
      if (options.Renderer) {
        this.renderer = new options.Renderer(this);
      }
      this.rules = new RuleList(this.options);
      for (var name in styles) {
        this.rules.add(name, styles[name]);
      }
      this.rules.process();
    }
    var _proto = StyleSheet2.prototype;
    _proto.attach = function attach() {
      if (this.attached) return this;
      if (this.renderer) this.renderer.attach();
      this.attached = true;
      if (!this.deployed) this.deploy();
      return this;
    };
    _proto.detach = function detach() {
      if (!this.attached) return this;
      if (this.renderer) this.renderer.detach();
      this.attached = false;
      return this;
    };
    _proto.addRule = function addRule(name, decl, options) {
      var queue = this.queue;
      if (this.attached && !queue) this.queue = [];
      var rule = this.rules.add(name, decl, options);
      if (!rule) return null;
      this.options.jss.plugins.onProcessRule(rule);
      if (this.attached) {
        if (!this.deployed) return rule;
        if (queue) queue.push(rule);
        else {
          this.insertRule(rule);
          if (this.queue) {
            this.queue.forEach(this.insertRule, this);
            this.queue = void 0;
          }
        }
        return rule;
      }
      this.deployed = false;
      return rule;
    };
    _proto.replaceRule = function replaceRule(nameOrSelector, decl, options) {
      var oldRule = this.rules.get(nameOrSelector);
      if (!oldRule) return this.addRule(nameOrSelector, decl, options);
      var newRule = this.rules.replace(nameOrSelector, decl, options);
      if (newRule) {
        this.options.jss.plugins.onProcessRule(newRule);
      }
      if (this.attached) {
        if (!this.deployed) return newRule;
        if (this.renderer) {
          if (!newRule) {
            this.renderer.deleteRule(oldRule);
          } else if (oldRule.renderable) {
            this.renderer.replaceRule(oldRule.renderable, newRule);
          }
        }
        return newRule;
      }
      this.deployed = false;
      return newRule;
    };
    _proto.insertRule = function insertRule2(rule) {
      if (this.renderer) {
        this.renderer.insertRule(rule);
      }
    };
    _proto.addRules = function addRules(styles, options) {
      var added = [];
      for (var name in styles) {
        var rule = this.addRule(name, styles[name], options);
        if (rule) added.push(rule);
      }
      return added;
    };
    _proto.getRule = function getRule(nameOrSelector) {
      return this.rules.get(nameOrSelector);
    };
    _proto.deleteRule = function deleteRule(name) {
      var rule = typeof name === "object" ? name : this.rules.get(name);
      if (!rule || // Style sheet was created without link: true and attached, in this case we
      // won't be able to remove the CSS rule from the DOM.
      this.attached && !rule.renderable) {
        return false;
      }
      this.rules.remove(rule);
      if (this.attached && rule.renderable && this.renderer) {
        return this.renderer.deleteRule(rule.renderable);
      }
      return true;
    };
    _proto.indexOf = function indexOf(rule) {
      return this.rules.indexOf(rule);
    };
    _proto.deploy = function deploy() {
      if (this.renderer) this.renderer.deploy();
      this.deployed = true;
      return this;
    };
    _proto.update = function update() {
      var _this$rules;
      (_this$rules = this.rules).update.apply(_this$rules, arguments);
      return this;
    };
    _proto.updateOne = function updateOne(rule, data, options) {
      this.rules.updateOne(rule, data, options);
      return this;
    };
    _proto.toString = function toString(options) {
      return this.rules.toString(options);
    };
    return StyleSheet2;
  })();
  var PluginsRegistry = /* @__PURE__ */ (function() {
    function PluginsRegistry2() {
      this.plugins = {
        internal: [],
        external: []
      };
      this.registry = {};
    }
    var _proto = PluginsRegistry2.prototype;
    _proto.onCreateRule = function onCreateRule8(name, decl, options) {
      for (var i = 0; i < this.registry.onCreateRule.length; i++) {
        var rule = this.registry.onCreateRule[i](name, decl, options);
        if (rule) return rule;
      }
      return null;
    };
    _proto.onProcessRule = function onProcessRule(rule) {
      if (rule.isProcessed) return;
      var sheet = rule.options.sheet;
      for (var i = 0; i < this.registry.onProcessRule.length; i++) {
        this.registry.onProcessRule[i](rule, sheet);
      }
      if (rule.style) this.onProcessStyle(rule.style, rule, sheet);
      rule.isProcessed = true;
    };
    _proto.onProcessStyle = function onProcessStyle2(style, rule, sheet) {
      for (var i = 0; i < this.registry.onProcessStyle.length; i++) {
        rule.style = this.registry.onProcessStyle[i](rule.style, rule, sheet);
      }
    };
    _proto.onProcessSheet = function onProcessSheet(sheet) {
      for (var i = 0; i < this.registry.onProcessSheet.length; i++) {
        this.registry.onProcessSheet[i](sheet);
      }
    };
    _proto.onUpdate = function onUpdate(data, rule, sheet, options) {
      for (var i = 0; i < this.registry.onUpdate.length; i++) {
        this.registry.onUpdate[i](data, rule, sheet, options);
      }
    };
    _proto.onChangeValue = function onChangeValue2(value, prop, rule) {
      var processedValue = value;
      for (var i = 0; i < this.registry.onChangeValue.length; i++) {
        processedValue = this.registry.onChangeValue[i](processedValue, prop, rule);
      }
      return processedValue;
    };
    _proto.use = function use(newPlugin, options) {
      if (options === void 0) {
        options = {
          queue: "external"
        };
      }
      var plugins2 = this.plugins[options.queue];
      if (plugins2.indexOf(newPlugin) !== -1) {
        return;
      }
      plugins2.push(newPlugin);
      this.registry = [].concat(this.plugins.external, this.plugins.internal).reduce(function(registry, plugin) {
        for (var name in plugin) {
          if (name in registry) {
            registry[name].push(plugin[name]);
          } else {
            true ? tiny_warning_esm_default(false, '[JSS] Unknown hook "' + name + '".') : void 0;
          }
        }
        return registry;
      }, {
        onCreateRule: [],
        onProcessRule: [],
        onProcessStyle: [],
        onProcessSheet: [],
        onChangeValue: [],
        onUpdate: []
      });
    };
    return PluginsRegistry2;
  })();
  var SheetsRegistry = /* @__PURE__ */ (function() {
    function SheetsRegistry2() {
      this.registry = [];
    }
    var _proto = SheetsRegistry2.prototype;
    _proto.add = function add(sheet) {
      var registry = this.registry;
      var index2 = sheet.options.index;
      if (registry.indexOf(sheet) !== -1) return;
      if (registry.length === 0 || index2 >= this.index) {
        registry.push(sheet);
        return;
      }
      for (var i = 0; i < registry.length; i++) {
        if (registry[i].options.index > index2) {
          registry.splice(i, 0, sheet);
          return;
        }
      }
    };
    _proto.reset = function reset() {
      this.registry = [];
    };
    _proto.remove = function remove(sheet) {
      var index2 = this.registry.indexOf(sheet);
      this.registry.splice(index2, 1);
    };
    _proto.toString = function toString(_temp) {
      var _ref = _temp === void 0 ? {} : _temp, attached = _ref.attached, options = _objectWithoutPropertiesLoose(_ref, ["attached"]);
      var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
      var css = "";
      for (var i = 0; i < this.registry.length; i++) {
        var sheet = this.registry[i];
        if (attached != null && sheet.attached !== attached) {
          continue;
        }
        if (css) css += linebreak;
        css += sheet.toString(options);
      }
      return css;
    };
    _createClass(SheetsRegistry2, [{
      key: "index",
      /**
       * Current highest index number.
       */
      get: function get() {
        return this.registry.length === 0 ? 0 : this.registry[this.registry.length - 1].options.index;
      }
    }]);
    return SheetsRegistry2;
  })();
  var sheets = new SheetsRegistry();
  var globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" && window.Math === Math ? window : typeof self !== "undefined" && self.Math === Math ? self : Function("return this")();
  var ns = "2f1acc6c3a606b082e5eef5e54414ffb";
  if (globalThis$1[ns] == null) globalThis$1[ns] = 0;
  var moduleId = globalThis$1[ns]++;
  var maxRules = 1e10;
  var createGenerateId = function createGenerateId2(options) {
    if (options === void 0) {
      options = {};
    }
    var ruleCounter = 0;
    var generateId = function generateId2(rule, sheet) {
      ruleCounter += 1;
      if (ruleCounter > maxRules) {
        true ? tiny_warning_esm_default(false, "[JSS] You might have a memory leak. Rule counter is at " + ruleCounter + ".") : void 0;
      }
      var jssId = "";
      var prefix = "";
      if (sheet) {
        if (sheet.options.classNamePrefix) {
          prefix = sheet.options.classNamePrefix;
        }
        if (sheet.options.jss.id != null) {
          jssId = String(sheet.options.jss.id);
        }
      }
      if (options.minify) {
        return "" + (prefix || "c") + moduleId + jssId + ruleCounter;
      }
      return prefix + rule.key + "-" + moduleId + (jssId ? "-" + jssId : "") + "-" + ruleCounter;
    };
    return generateId;
  };
  var memoize = function memoize2(fn) {
    var value;
    return function() {
      if (!value) value = fn();
      return value;
    };
  };
  var getPropertyValue = function getPropertyValue2(cssRule, prop) {
    try {
      if (cssRule.attributeStyleMap) {
        return cssRule.attributeStyleMap.get(prop);
      }
      return cssRule.style.getPropertyValue(prop);
    } catch (err) {
      return "";
    }
  };
  var setProperty = function setProperty2(cssRule, prop, value) {
    try {
      var cssValue = value;
      if (Array.isArray(value)) {
        cssValue = toCssValue(value);
      }
      if (cssRule.attributeStyleMap) {
        cssRule.attributeStyleMap.set(prop, cssValue);
      } else {
        var indexOfImportantFlag = cssValue ? cssValue.indexOf("!important") : -1;
        var cssValueWithoutImportantFlag = indexOfImportantFlag > -1 ? cssValue.substr(0, indexOfImportantFlag - 1) : cssValue;
        cssRule.style.setProperty(prop, cssValueWithoutImportantFlag, indexOfImportantFlag > -1 ? "important" : "");
      }
    } catch (err) {
      return false;
    }
    return true;
  };
  var removeProperty = function removeProperty2(cssRule, prop) {
    try {
      if (cssRule.attributeStyleMap) {
        cssRule.attributeStyleMap.delete(prop);
      } else {
        cssRule.style.removeProperty(prop);
      }
    } catch (err) {
      true ? tiny_warning_esm_default(false, '[JSS] DOMException "' + err.message + '" was thrown. Tried to remove property "' + prop + '".') : void 0;
    }
  };
  var setSelector = function setSelector2(cssRule, selectorText) {
    cssRule.selectorText = selectorText;
    return cssRule.selectorText === selectorText;
  };
  var getHead = memoize(function() {
    return document.querySelector("head");
  });
  function findHigherSheet(registry, options) {
    for (var i = 0; i < registry.length; i++) {
      var sheet = registry[i];
      if (sheet.attached && sheet.options.index > options.index && sheet.options.insertionPoint === options.insertionPoint) {
        return sheet;
      }
    }
    return null;
  }
  function findHighestSheet(registry, options) {
    for (var i = registry.length - 1; i >= 0; i--) {
      var sheet = registry[i];
      if (sheet.attached && sheet.options.insertionPoint === options.insertionPoint) {
        return sheet;
      }
    }
    return null;
  }
  function findCommentNode(text) {
    var head = getHead();
    for (var i = 0; i < head.childNodes.length; i++) {
      var node = head.childNodes[i];
      if (node.nodeType === 8 && node.nodeValue.trim() === text) {
        return node;
      }
    }
    return null;
  }
  function findPrevNode(options) {
    var registry = sheets.registry;
    if (registry.length > 0) {
      var sheet = findHigherSheet(registry, options);
      if (sheet && sheet.renderer) {
        return {
          parent: sheet.renderer.element.parentNode,
          node: sheet.renderer.element
        };
      }
      sheet = findHighestSheet(registry, options);
      if (sheet && sheet.renderer) {
        return {
          parent: sheet.renderer.element.parentNode,
          node: sheet.renderer.element.nextSibling
        };
      }
    }
    var insertionPoint = options.insertionPoint;
    if (insertionPoint && typeof insertionPoint === "string") {
      var comment = findCommentNode(insertionPoint);
      if (comment) {
        return {
          parent: comment.parentNode,
          node: comment.nextSibling
        };
      }
      true ? tiny_warning_esm_default(false, '[JSS] Insertion point "' + insertionPoint + '" not found.') : void 0;
    }
    return false;
  }
  function insertStyle(style, options) {
    var insertionPoint = options.insertionPoint;
    var nextNode = findPrevNode(options);
    if (nextNode !== false && nextNode.parent) {
      nextNode.parent.insertBefore(style, nextNode.node);
      return;
    }
    if (insertionPoint && typeof insertionPoint.nodeType === "number") {
      var insertionPointElement = insertionPoint;
      var parentNode = insertionPointElement.parentNode;
      if (parentNode) parentNode.insertBefore(style, insertionPointElement.nextSibling);
      else true ? tiny_warning_esm_default(false, "[JSS] Insertion point is not in the DOM.") : void 0;
      return;
    }
    getHead().appendChild(style);
  }
  var getNonce = memoize(function() {
    var node = document.querySelector('meta[property="csp-nonce"]');
    return node ? node.getAttribute("content") : null;
  });
  var _insertRule = function insertRule(container, rule, index2) {
    try {
      if ("insertRule" in container) {
        container.insertRule(rule, index2);
      } else if ("appendRule" in container) {
        container.appendRule(rule);
      }
    } catch (err) {
      true ? tiny_warning_esm_default(false, "[JSS] " + err.message) : void 0;
      return false;
    }
    return container.cssRules[index2];
  };
  var getValidRuleInsertionIndex = function getValidRuleInsertionIndex2(container, index2) {
    var maxIndex = container.cssRules.length;
    if (index2 === void 0 || index2 > maxIndex) {
      return maxIndex;
    }
    return index2;
  };
  var createStyle = function createStyle2() {
    var el = document.createElement("style");
    el.textContent = "\n";
    return el;
  };
  var DomRenderer = /* @__PURE__ */ (function() {
    function DomRenderer2(sheet) {
      this.getPropertyValue = getPropertyValue;
      this.setProperty = setProperty;
      this.removeProperty = removeProperty;
      this.setSelector = setSelector;
      this.hasInsertedRules = false;
      this.cssRules = [];
      if (sheet) sheets.add(sheet);
      this.sheet = sheet;
      var _ref = this.sheet ? this.sheet.options : {}, media = _ref.media, meta = _ref.meta, element = _ref.element;
      this.element = element || createStyle();
      this.element.setAttribute("data-jss", "");
      if (media) this.element.setAttribute("media", media);
      if (meta) this.element.setAttribute("data-meta", meta);
      var nonce = getNonce();
      if (nonce) this.element.setAttribute("nonce", nonce);
    }
    var _proto = DomRenderer2.prototype;
    _proto.attach = function attach() {
      if (this.element.parentNode || !this.sheet) return;
      insertStyle(this.element, this.sheet.options);
      var deployed = Boolean(this.sheet && this.sheet.deployed);
      if (this.hasInsertedRules && deployed) {
        this.hasInsertedRules = false;
        this.deploy();
      }
    };
    _proto.detach = function detach() {
      if (!this.sheet) return;
      var parentNode = this.element.parentNode;
      if (parentNode) parentNode.removeChild(this.element);
      if (this.sheet.options.link) {
        this.cssRules = [];
        this.element.textContent = "\n";
      }
    };
    _proto.deploy = function deploy() {
      var sheet = this.sheet;
      if (!sheet) return;
      if (sheet.options.link) {
        this.insertRules(sheet.rules);
        return;
      }
      this.element.textContent = "\n" + sheet.toString() + "\n";
    };
    _proto.insertRules = function insertRules(rules, nativeParent) {
      for (var i = 0; i < rules.index.length; i++) {
        this.insertRule(rules.index[i], i, nativeParent);
      }
    };
    _proto.insertRule = function insertRule2(rule, index2, nativeParent) {
      if (nativeParent === void 0) {
        nativeParent = this.element.sheet;
      }
      if (rule.rules) {
        var parent = rule;
        var latestNativeParent = nativeParent;
        if (rule.type === "conditional" || rule.type === "keyframes") {
          var _insertionIndex = getValidRuleInsertionIndex(nativeParent, index2);
          latestNativeParent = _insertRule(nativeParent, parent.toString({
            children: false
          }), _insertionIndex);
          if (latestNativeParent === false) {
            return false;
          }
          this.refCssRule(rule, _insertionIndex, latestNativeParent);
        }
        this.insertRules(parent.rules, latestNativeParent);
        return latestNativeParent;
      }
      var ruleStr = rule.toString();
      if (!ruleStr) return false;
      var insertionIndex = getValidRuleInsertionIndex(nativeParent, index2);
      var nativeRule = _insertRule(nativeParent, ruleStr, insertionIndex);
      if (nativeRule === false) {
        return false;
      }
      this.hasInsertedRules = true;
      this.refCssRule(rule, insertionIndex, nativeRule);
      return nativeRule;
    };
    _proto.refCssRule = function refCssRule(rule, index2, cssRule) {
      rule.renderable = cssRule;
      if (rule.options.parent instanceof StyleSheet) {
        this.cssRules.splice(index2, 0, cssRule);
      }
    };
    _proto.deleteRule = function deleteRule(cssRule) {
      var sheet = this.element.sheet;
      var index2 = this.indexOf(cssRule);
      if (index2 === -1) return false;
      sheet.deleteRule(index2);
      this.cssRules.splice(index2, 1);
      return true;
    };
    _proto.indexOf = function indexOf(cssRule) {
      return this.cssRules.indexOf(cssRule);
    };
    _proto.replaceRule = function replaceRule(cssRule, rule) {
      var index2 = this.indexOf(cssRule);
      if (index2 === -1) return false;
      this.element.sheet.deleteRule(index2);
      this.cssRules.splice(index2, 1);
      return this.insertRule(rule, index2);
    };
    _proto.getRules = function getRules() {
      return this.element.sheet.cssRules;
    };
    return DomRenderer2;
  })();
  var instanceCounter = 0;
  var Jss = /* @__PURE__ */ (function() {
    function Jss2(options) {
      this.id = instanceCounter++;
      this.version = "10.10.0";
      this.plugins = new PluginsRegistry();
      this.options = {
        id: {
          minify: false
        },
        createGenerateId,
        Renderer: module_default ? DomRenderer : null,
        plugins: []
      };
      this.generateId = createGenerateId({
        minify: false
      });
      for (var i = 0; i < plugins.length; i++) {
        this.plugins.use(plugins[i], {
          queue: "internal"
        });
      }
      this.setup(options);
    }
    var _proto = Jss2.prototype;
    _proto.setup = function setup(options) {
      if (options === void 0) {
        options = {};
      }
      if (options.createGenerateId) {
        this.options.createGenerateId = options.createGenerateId;
      }
      if (options.id) {
        this.options.id = _extends({}, this.options.id, options.id);
      }
      if (options.createGenerateId || options.id) {
        this.generateId = this.options.createGenerateId(this.options.id);
      }
      if (options.insertionPoint != null) this.options.insertionPoint = options.insertionPoint;
      if ("Renderer" in options) {
        this.options.Renderer = options.Renderer;
      }
      if (options.plugins) this.use.apply(this, options.plugins);
      return this;
    };
    _proto.createStyleSheet = function createStyleSheet(styles, options) {
      if (options === void 0) {
        options = {};
      }
      var _options = options, index2 = _options.index;
      if (typeof index2 !== "number") {
        index2 = sheets.index === 0 ? 0 : sheets.index + 1;
      }
      var sheet = new StyleSheet(styles, _extends({}, options, {
        jss: this,
        generateId: options.generateId || this.generateId,
        insertionPoint: this.options.insertionPoint,
        Renderer: this.options.Renderer,
        index: index2
      }));
      this.plugins.onProcessSheet(sheet);
      return sheet;
    };
    _proto.removeStyleSheet = function removeStyleSheet(sheet) {
      sheet.detach();
      sheets.remove(sheet);
      return this;
    };
    _proto.createRule = function createRule$1(name, style, options) {
      if (style === void 0) {
        style = {};
      }
      if (options === void 0) {
        options = {};
      }
      if (typeof name === "object") {
        return this.createRule(void 0, name, style);
      }
      var ruleOptions = _extends({}, options, {
        name,
        jss: this,
        Renderer: this.options.Renderer
      });
      if (!ruleOptions.generateId) ruleOptions.generateId = this.generateId;
      if (!ruleOptions.classes) ruleOptions.classes = {};
      if (!ruleOptions.keyframes) ruleOptions.keyframes = {};
      var rule = createRule(name, style, ruleOptions);
      if (rule) this.plugins.onProcessRule(rule);
      return rule;
    };
    _proto.use = function use() {
      var _this = this;
      for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
        plugins2[_key] = arguments[_key];
      }
      plugins2.forEach(function(plugin) {
        _this.plugins.use(plugin);
      });
      return this;
    };
    return Jss2;
  })();
  var createJss = function createJss2(options) {
    return new Jss(options);
  };
  var hasCSSTOMSupport = typeof CSS === "object" && CSS != null && "number" in CSS;
  var index = createJss();
  var jss_esm_default = index;

  // node_modules/jss-plugin-global/dist/jss-plugin-global.esm.js
  var at = "@global";
  var atPrefix = "@global ";
  var GlobalContainerRule = /* @__PURE__ */ (function() {
    function GlobalContainerRule2(key, styles, options) {
      this.type = "global";
      this.at = at;
      this.isProcessed = false;
      this.key = key;
      this.options = options;
      this.rules = new RuleList(_extends({}, options, {
        parent: this
      }));
      for (var selector in styles) {
        this.rules.add(selector, styles[selector]);
      }
      this.rules.process();
    }
    var _proto = GlobalContainerRule2.prototype;
    _proto.getRule = function getRule(name) {
      return this.rules.get(name);
    };
    _proto.addRule = function addRule(name, style, options) {
      var rule = this.rules.add(name, style, options);
      if (rule) this.options.jss.plugins.onProcessRule(rule);
      return rule;
    };
    _proto.replaceRule = function replaceRule(name, style, options) {
      var newRule = this.rules.replace(name, style, options);
      if (newRule) this.options.jss.plugins.onProcessRule(newRule);
      return newRule;
    };
    _proto.indexOf = function indexOf(rule) {
      return this.rules.indexOf(rule);
    };
    _proto.toString = function toString(options) {
      return this.rules.toString(options);
    };
    return GlobalContainerRule2;
  })();
  var GlobalPrefixedRule = /* @__PURE__ */ (function() {
    function GlobalPrefixedRule2(key, style, options) {
      this.type = "global";
      this.at = at;
      this.isProcessed = false;
      this.key = key;
      this.options = options;
      var selector = key.substr(atPrefix.length);
      this.rule = options.jss.createRule(selector, style, _extends({}, options, {
        parent: this
      }));
    }
    var _proto2 = GlobalPrefixedRule2.prototype;
    _proto2.toString = function toString(options) {
      return this.rule ? this.rule.toString(options) : "";
    };
    return GlobalPrefixedRule2;
  })();
  var separatorRegExp = /\s*,\s*/g;
  function addScope(selector, scope) {
    var parts = selector.split(separatorRegExp);
    var scoped = "";
    for (var i = 0; i < parts.length; i++) {
      scoped += scope + " " + parts[i].trim();
      if (parts[i + 1]) scoped += ", ";
    }
    return scoped;
  }
  function handleNestedGlobalContainerRule(rule, sheet) {
    var options = rule.options, style = rule.style;
    var rules = style ? style[at] : null;
    if (!rules) return;
    for (var name in rules) {
      sheet.addRule(name, rules[name], _extends({}, options, {
        selector: addScope(name, rule.selector)
      }));
    }
    delete style[at];
  }
  function handlePrefixedGlobalRule(rule, sheet) {
    var options = rule.options, style = rule.style;
    for (var prop in style) {
      if (prop[0] !== "@" || prop.substr(0, at.length) !== at) continue;
      var selector = addScope(prop.substr(at.length), rule.selector);
      sheet.addRule(selector, style[prop], _extends({}, options, {
        selector
      }));
      delete style[prop];
    }
  }
  function jssGlobal() {
    function onCreateRule8(name, styles, options) {
      if (!name) return null;
      if (name === at) {
        return new GlobalContainerRule(name, styles, options);
      }
      if (name[0] === "@" && name.substr(0, atPrefix.length) === atPrefix) {
        return new GlobalPrefixedRule(name, styles, options);
      }
      var parent = options.parent;
      if (parent) {
        if (parent.type === "global" || parent.options.parent && parent.options.parent.type === "global") {
          options.scoped = false;
        }
      }
      if (!options.selector && options.scoped === false) {
        options.selector = name;
      }
      return null;
    }
    function onProcessRule(rule, sheet) {
      if (rule.type !== "style" || !sheet) return;
      handleNestedGlobalContainerRule(rule, sheet);
      handlePrefixedGlobalRule(rule, sheet);
    }
    return {
      onCreateRule: onCreateRule8,
      onProcessRule
    };
  }
  var jss_plugin_global_esm_default = jssGlobal;

  // node_modules/hyphenate-style-name/index.js
  var uppercasePattern = /[A-Z]/g;
  var msPattern = /^ms-/;
  var cache = {};
  function toHyphenLower(match) {
    return "-" + match.toLowerCase();
  }
  function hyphenateStyleName(name) {
    if (cache.hasOwnProperty(name)) {
      return cache[name];
    }
    var hName = name.replace(uppercasePattern, toHyphenLower);
    return cache[name] = msPattern.test(hName) ? "-" + hName : hName;
  }
  var hyphenate_style_name_default = hyphenateStyleName;

  // node_modules/jss-plugin-camel-case/dist/jss-plugin-camel-case.esm.js
  function convertCase(style) {
    var converted = {};
    for (var prop in style) {
      var key = prop.indexOf("--") === 0 ? prop : hyphenate_style_name_default(prop);
      converted[key] = style[prop];
    }
    if (style.fallbacks) {
      if (Array.isArray(style.fallbacks)) converted.fallbacks = style.fallbacks.map(convertCase);
      else converted.fallbacks = convertCase(style.fallbacks);
    }
    return converted;
  }
  function camelCase() {
    function onProcessStyle2(style) {
      if (Array.isArray(style)) {
        for (var index2 = 0; index2 < style.length; index2++) {
          style[index2] = convertCase(style[index2]);
        }
        return style;
      }
      return convertCase(style);
    }
    function onChangeValue2(value, prop, rule) {
      if (prop.indexOf("--") === 0) {
        return value;
      }
      var hyphenatedProp = hyphenate_style_name_default(prop);
      if (prop === hyphenatedProp) return value;
      rule.prop(hyphenatedProp, value);
      return null;
    }
    return {
      onProcessStyle: onProcessStyle2,
      onChangeValue: onChangeValue2
    };
  }
  var jss_plugin_camel_case_esm_default = camelCase;

  // node_modules/@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.5/dist/esm/Styles/PixelStreamingApplicationStyles.js
  var PixelStreamingApplicationStyle = class {
    constructor(options) {
      this.defaultLightModePalette = {
        "--color0": "#e2e0dd80",
        "--color1": "#FFFFFF",
        "--color2": "#000000",
        "--color3": "#0585fe",
        "--color4": "#35b350",
        "--color5": "#ffab00",
        "--color6": "#e1e2dd",
        "--color7": "#c3c4bf"
      };
      this.defaultDarkModePalette = {
        "--color0": "#1d1f22e0",
        "--color1": "#000000",
        "--color2": "#FFFFFF",
        "--color3": "#0585fe",
        "--color4": "#35b350",
        "--color5": "#ffab00",
        "--color6": "#1e1d22",
        "--color7": "#3c3b40"
      };
      this.defaultStyles = {
        ":root": {
          "--color0": "#1d1f22e0",
          "--color1": "#000000",
          "--color2": "#FFFFFF",
          "--color3": "#0585fe",
          "--color4": "#35b350",
          "--color5": "#ffab00",
          "--color6": "#1e1d22",
          "--color7": "#3c3b40",
          "--color8": "#41008c",
          "--color9": "#3e0070",
          "--color10": "#2e0052",
          "--color11": "rgba(65,0,139,1)"
        },
        ".noselect": {
          userSelect: "none"
        },
        "#playerUI": {
          width: "100%",
          height: "100%",
          position: "relative"
        },
        "#videoElementParent": {
          width: "100%",
          height: "100%",
          position: "absolute",
          backgroundColor: "var(--color1)"
        },
        "#uiFeatures": {
          width: "100%",
          height: "100%",
          zIndex: "30",
          position: "relative",
          color: "var(--color2)",
          pointerEvents: "none",
          overflow: "hidden"
        },
        ".UiTool .tooltiptext": {
          visibility: "hidden",
          width: "auto",
          color: "var(--color2)",
          textAlign: "center",
          borderRadius: "15px",
          padding: "0px 10px",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.75px",
          position: "absolute",
          top: "0",
          transform: "translateY(25%)",
          left: "125%",
          zIndex: "20"
        },
        ".UiTool:hover .tooltiptext": {
          visibility: "visible",
          backgroundColor: "var(--color7)"
        },
        "#connection .tooltiptext": {
          top: "125%",
          transform: "translateX(-25%)",
          left: "0",
          zIndex: "20",
          padding: "5px 10px"
        },
        "#connection": {
          position: "absolute",
          bottom: "8%",
          left: "5%",
          fontFamily: "'Michroma', sans-serif",
          height: "3rem",
          width: "3rem",
          pointerEvents: "all"
        },
        "#settings-panel .tooltiptext": {
          display: "block",
          top: "125%",
          transform: "translateX(-50%)",
          left: "0",
          zIndex: "20",
          padding: "5px 10px",
          border: "3px solid var(--color3)",
          width: "max-content",
          fallbacks: [
            {
              width: "max-content"
            },
            {
              border: "3px solid var(--color3)"
            },
            {
              padding: "5px 10px"
            },
            {
              zIndex: "20"
            },
            {
              left: "0"
            },
            {
              transform: "translateX(-50%)"
            },
            {
              top: "125%"
            },
            {
              display: "block"
            }
          ]
        },
        "#controls": {
          position: "absolute",
          top: "3%",
          left: "2%",
          fontFamily: "'Michroma', sans-serif",
          pointerEvents: "all",
          display: "block"
        },
        "#controls>*": {
          marginBottom: "0.5rem",
          borderRadius: "50%",
          display: "block",
          height: "2rem",
          lineHeight: "1.75rem",
          padding: "0.5rem"
        },
        "#controls #additionalinfo": {
          textAlign: "center",
          fontFamily: "'Montserrat', sans-serif"
        },
        "#fullscreen-btn": {
          padding: "0.6rem !important"
        },
        "#minimizeIcon": {
          display: "none"
        },
        "#settingsBtn, #statsBtn": {
          cursor: "pointer"
        },
        "#uiFeatures button": {
          backgroundColor: "var(--color7)",
          border: "1px solid var(--color7)",
          color: "var(--color2)",
          position: "relative",
          width: "3rem",
          height: "3rem",
          padding: "0.5rem",
          textAlign: "center"
        },
        "#uiFeatures button:hover": {
          backgroundColor: "var(--color3)",
          border: "3px solid var(--color3)",
          transition: "0.25s ease",
          paddingLeft: "0.55rem",
          paddingTop: "0.55rem"
        },
        "#uiFeatures button:active": {
          border: "3px solid var(--color3)",
          backgroundColor: "var(--color7)",
          paddingLeft: "0.55rem",
          paddingTop: "0.55rem"
        },
        ".btn-flat": {
          backgroundColor: "transparent",
          color: "var(--color2)",
          fontFamily: "'Montserrat'",
          fontWeight: "bold",
          border: "3px solid var(--color3)",
          borderRadius: "1rem",
          fontSize: "0.75rem",
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem",
          cursor: "pointer",
          textAlign: "center"
        },
        ".btn-flat:hover": {
          backgroundColor: "var(--color3)",
          transition: "ease 0.3s"
        },
        ".btn-flat:disabled": {
          background: "var(--color7)",
          borderColor: "var(--color3)",
          color: "var(--color3)",
          cursor: "default"
        },
        ".btn-flat:active": {
          backgroundColor: "transparent"
        },
        ".btn-flat:focus": {
          outline: "none"
        },
        "#uiFeatures img": {
          width: "100%",
          height: "100%"
        },
        ".panel-wrap": {
          position: "absolute",
          top: "0",
          bottom: "0",
          right: "0",
          height: "100%",
          minWidth: "20vw",
          maxWidth: "90vw",
          transform: "translateX(100%)",
          transition: ".3s ease-out",
          pointerEvents: "all",
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "var(--color0)"
        },
        ".panel-wrap-visible": {
          transform: "translateX(0%)"
        },
        ".panel": {
          overflowY: "auto",
          padding: "1em"
        },
        "#settingsHeading, #statsHeading": {
          display: "inline-block",
          fontSize: "2em",
          marginBlockStart: "0.67em",
          marginBlockEnd: "0.67em",
          marginInlineStart: "0px",
          marginInlineEnd: "0px",
          position: "relative",
          padding: "0 0 0 2rem"
        },
        "#settingsClose, #statsClose": {
          margin: "0.5rem",
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          paddingRight: "0.5rem",
          fontSize: "2em",
          float: "right"
        },
        "#settingsClose:after, #statsClose:after": {
          paddingLeft: "0.5rem",
          display: "inline-block",
          content: '"\\00d7"'
        },
        "#settingsClose:hover, #statsClose:hover": {
          color: "var(--color3)",
          transition: "ease 0.3s"
        },
        "#settingsContent, #statsContent": {
          marginLeft: "2rem",
          marginRight: "2rem"
        },
        ".setting": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: "0.15rem 10px 0.15rem 10px"
        },
        ".settings-text": {
          color: "var(--color2)",
          verticalAlign: "middle",
          fontWeight: "normal"
        },
        ".settings-option": {
          width: "100%",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        },
        "#connectOverlay, #playOverlay, #infoOverlay, #errorOverlay, #afkOverlay, #disconnectOverlay": {
          zIndex: "30",
          position: "absolute",
          color: "var(--color2)",
          fontSize: "1.8em",
          width: "100%",
          height: "100%",
          backgroundColor: "var(--color1)",
          alignItems: "center",
          justifyContent: "center",
          textTransform: "uppercase"
        },
        ".clickableState": {
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          cursor: "pointer"
        },
        ".textDisplayState": {
          display: "flex"
        },
        ".hiddenState": {
          display: "none"
        },
        "#playButton, #connectButton": {
          display: "inline-block",
          height: "auto",
          zIndex: "30"
        },
        "img#playButton": {
          maxWidth: "241px",
          width: "10%"
        },
        "#uiInteraction": {
          position: "fixed"
        },
        "#UIInteractionButtonBoundary": {
          padding: "2px"
        },
        "#UIInteractionButton": {
          cursor: "pointer"
        },
        ".btn-overlay": {
          verticalAlign: "middle",
          display: "inline-block"
        },
        ".tgl-switch": {
          verticalAlign: "middle",
          display: "inline-block"
        },
        ".tgl-switch .tgl": {
          display: "none"
        },
        ".tgl, .tgl:after, .tgl:before, .tgl *, .tgl *:after, .tgl *:before, .tgl+.tgl-slider": {
          "-webkit-box-sizing": "border-box",
          boxSizing: "border-box"
        },
        ".tgl::-moz-selection, .tgl:after::-moz-selection, .tgl:before::-moz-selection, .tgl *::-moz-selection, .tgl *:after::-moz-selection, .tgl *:before::-moz-selection, .tgl+.tgl-slider::-moz-selection": {
          background: "none"
        },
        ".tgl::selection, .tgl:after::selection, .tgl:before::selection, .tgl *::selection, .tgl *:after::selection, .tgl *:before::selection, .tgl+.tgl-slider::selection": {
          background: "none"
        },
        ".tgl-slider": {},
        ".tgl+.tgl-slider": {
          outline: "0",
          display: "block",
          width: "40px",
          height: "18px",
          position: "relative",
          cursor: "pointer",
          userSelect: "none"
        },
        ".tgl+.tgl-slider:after, .tgl+.tgl-slider:before": {
          position: "relative",
          display: "block",
          content: '""',
          width: "50%",
          height: "100%"
        },
        ".tgl+.tgl-slider:after": {
          left: "0"
        },
        ".tgl+.tgl-slider:before": {
          display: "none"
        },
        ".tgl-flat+.tgl-slider": {
          padding: "2px",
          "-webkit-transition": "all .2s ease",
          transition: "all .2s ease",
          background: "var(--color6)",
          border: "3px solid var(--color7)",
          borderRadius: "2em"
        },
        ".tgl-flat+.tgl-slider:after": {
          "-webkit-transition": "all .2s ease",
          transition: "all .2s ease",
          background: "var(--color7)",
          content: '""',
          borderRadius: "1em"
        },
        ".tgl-flat:checked+.tgl-slider": {
          border: "3px solid var(--color3)"
        },
        ".tgl-flat:checked+.tgl-slider:after": {
          left: "50%",
          background: "var(--color3)"
        },
        ".btn-apply": {
          display: "block !important",
          marginLeft: "auto",
          marginRight: "auto",
          width: "40%"
        },
        ".form-control": {
          backgroundColor: "var(--color7)",
          border: "2px solid var(--color7)",
          borderRadius: "4px",
          color: "var(--color2)",
          textAlign: "right",
          fontFamily: "inherit"
        },
        ".form-control:hover": {
          borderColor: "var(--color7)"
        },
        ".form-group": {
          paddingTop: "4px",
          display: "grid",
          gridTemplateColumns: "80% 20%",
          rowGap: "4px",
          paddingRight: "10px",
          paddingLeft: "10px"
        },
        ".form-group label": {
          verticalAlign: "middle",
          fontWeight: "normal"
        },
        ".settingsContainer": {
          display: "flex",
          flexDirection: "column",
          borderBottom: "1px solid var(--color7)",
          paddingTop: "10px",
          paddingBottom: "10px"
        },
        ".settingsContainer> :first-child": {
          marginTop: "4px",
          marginBottom: "4px",
          fontWeight: "bold",
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline"
        },
        ".collapse": {
          paddingLeft: "5%"
        },
        "#streamTools": {
          borderBottomRightRadius: "5px",
          borderBottomLeftRadius: "5px",
          userSelect: "none",
          position: "absolute",
          top: "0",
          right: "2%",
          zIndex: "100",
          border: "4px solid var(--color8)",
          borderTopWidth: "0px"
        },
        ".settingsHeader": {
          fontStyle: "italic"
        },
        "#streamToolsHeader": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color8)",
          backgroundColor: "var(--color7)"
        },
        ".streamTools": {
          backgroundColor: "var(--color2)",
          fontFamily: "var(--buttonFont)",
          fontWeight: "lighter",
          color: "var(--color7)"
        },
        ".streamTools-shown>#streamToolsSettings, .streamTools-shown>#streamToolsStats": {
          display: "block"
        },
        "#streamToolsToggle": {
          width: "100%"
        },
        "#qualityStatus": {
          fontSize: "37px",
          paddingRight: "4px"
        },
        ".svgIcon": {
          fill: "var(--color2)"
        },
        ".modal": {
          minWidth: "100vw",
          minHeight: "100vh",
          left: "0",
          top: "0",
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "var(--color2)"
        },
        ".innerModal": {
          position: "relative",
          width: "500px",
          height: "300px",
          backgroundColor: "var(--color0)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0.75em"
        },
        ".modalBtnContainer": {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
          paddingTop: "1em",
          paddingBottom: "1em"
        },
        ".modalTextArea": {
          textAlign: "left",
          width: "95%",
          height: "100%",
          resize: "none",
          fontSize: "1rem",
          border: "1px solid var(--color2)"
        },
        ".modalTextArea:focus-visible": {
          outline: "none !important",
          border: "1px solid var(--color3)"
        },
        ".modal .btn-flat": {
          fontSize: "1.0rem"
        }
      };
      const { customStyles, lightModePalette, darkModePalette, jssInsertionPoint } = options !== null && options !== void 0 ? options : {};
      const jssOptions = {
        // JSS has many interesting plugins we may wish to turn on
        //plugins: [functions(), template(), global(), extend(), nested(), compose(), camelCase(), defaultUnit(options.defaultUnit), expand(), vendorPrefixer(), propsSort()]
        plugins: [jss_plugin_global_esm_default(), jss_plugin_camel_case_esm_default()],
        insertionPoint: jssInsertionPoint
      };
      jss_esm_default.setup(jssOptions);
      this.customStyles = customStyles;
      this.lightModePalette = lightModePalette !== null && lightModePalette !== void 0 ? lightModePalette : this.defaultLightModePalette;
      this.darkModePalette = darkModePalette !== null && darkModePalette !== void 0 ? darkModePalette : this.defaultDarkModePalette;
    }
    applyStyleSheet() {
      jss_esm_default.createStyleSheet({
        "@global": Object.assign(Object.assign({}, this.defaultStyles), this.customStyles)
      }).attach();
    }
    applyPalette(palette) {
      const rootElement = document.documentElement;
      rootElement.style.setProperty("--color0", palette["--color0"]);
      rootElement.style.setProperty("--color1", palette["--color1"]);
      rootElement.style.setProperty("--color2", palette["--color2"]);
      rootElement.style.setProperty("--color3", palette["--color3"]);
      rootElement.style.setProperty("--color4", palette["--color4"]);
      rootElement.style.setProperty("--color5", palette["--color5"]);
      rootElement.style.setProperty("--color6", palette["--color6"]);
      rootElement.style.setProperty("--color7", palette["--color7"]);
    }
    /**
     * Update the players color variables
     * @param isLightMode - should we use a light or dark color scheme
     */
    setColorMode(isLightMode) {
      if (isLightMode) {
        this.applyPalette(this.lightModePalette);
      } else {
        this.applyPalette(this.darkModePalette);
      }
    }
  };

  // entry.mjs
  window.pixelstreaming = {
    PixelStreaming,
    Config,
    Flags,
    TextParameters,
    NumericParameters,
    OptionParameters,
    ...pixelstreamingfrontend_ui_exports
  };
  var entry_default = window.pixelstreaming;
  return __toCommonJS(entry_exports);
})();
/*! Bundled license information:

jss/dist/jss.esm.js:
  (**
   * A better abstraction over CSS.
   *
   * @copyright Oleg Isonen (Slobodskoi) / Isonen 2014-present
   * @website https://github.com/cssinjs/jss
   * @license MIT
   *)
*/
