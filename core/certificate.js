var async    = require('async');
var _        = require('underscore');
var openpgp = require('../lib/openpgp').openpgp;

openpgp.init();

module.exports = function Certificate(asciiArmored){

  this.raw = asciiArmored;
  this.fingerprint = null;
  this.name = null;
  this.email = null;
  this.comment = null;

  this.parseKey = function() {
    var k = getKey(this.raw);
    this.fingerprint = k.fingerprint;
    var uid = k.uids[0];
    var extract = uid.match(/([\s\S]*) \(([\s\S]*)\) <([\s\S]*)>/);
    if(extract && extract.length === 4){
      this.name = extract[1];
      this.comment = extract[2];
      this.email = extract[3];
    }
    else{
      extract = uid.match(/([\s\S]*) <([\s\S]*)>/);
      if(extract && extract.length === 3){
        this.name = extract[1];
        this.comment = '';
        this.email = extract[2];
      }
    }
  };

  this.parseKey();

  // PRIVATE

  function getKey(asciiArmored) {
    var cert = openpgp.read_publicKey(asciiArmored)[0];
    var fpr = hexstrdump(cert.publicKeyPacket.getFingerprint()).toUpperCase();
    var uids = [];
    cert.userIds.forEach(function (uid) {
      uids.push(uid.text);
    });
    return {
      "fingerprint": fpr,
      "uids": uids,
      "raw": cert
    };
  }

  function hexstrdump(str) {
    if (str == null)
      return "";
    var r=[];
    var e=str.length;
    var c=0;
    var h;
    while(c<e){
        h=str[c++].charCodeAt().toString(16);
        while(h.length<2) h="0"+h;
        r.push(""+h);
    }
    return r.join('');
  }
};
