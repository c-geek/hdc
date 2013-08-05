var async = require('async');
var sha1  = require('sha1');
var _     = require('underscore');

module.exports = function Amendment(rawAmend){

  this.version = null;
  this.currency = null;
  this.number = null;
  this.previousHash = null;
  this.dividend = null;
  this.coinMinPower = null;
  this.votersSigRoot = null;
  this.votersRoot = null;
  this.votersCount = 0;
  this.votersChanges = [];
  this.membersStatusRoot = null;
  this.membersRoot = null;
  this.membersCount = 0;
  this.membersChanges = [];
  this.hash = null;
  this.error = null;

  this.parse = function(rawAmend) {
    if(!rawAmend){
      this.error = "No amendment given";
      return false;
    }
    else{
      this.hash = sha1(unix2dos(rawAmend)).toUpperCase();
      var obj = this;
      var captures = [
        {prop: "version",           regexp: /Version: (.*)/},
        {prop: "currency",          regexp: /Currency: (.*)/},
        {prop: "number",            regexp: /Number: (.*)/},
        {prop: "previousHash",      regexp: /PreviousHash: (.*)/},
        {prop: "dividend",          regexp: /UniversalDividend: (.*)/},
        {prop: "coinMinPower",      regexp: /CoinMinimalPower: (.*)/},
        {prop: "votersSigRoot",     regexp: /VotersSignaturesRoot: (.*)/},
        {prop: "votersRoot",        regexp: /VotersRoot: (.*)/},
        {prop: "votersCount",       regexp: /VotersCount: (.*)/},
        {prop: "votersChanges",     regexp: /VotersChanges:\n([\s\S]*)MembersRoot/},
        {prop: "membersStatusRoot", regexp: /MembersStatusRoot: (.*)/},
        {prop: "membersRoot",       regexp: /MembersRoot: (.*)/},
        {prop: "membersCount",      regexp: /MembersCount: (.*)/},
        {prop: "membersChanges",    regexp: /MembersChanges:\n([\s\S]*)/}
      ];
      var crlfCleaned = rawAmend.replace(/\r\n/g, "\n");
      if(crlfCleaned.match(/\n$/)){
        captures.forEach(function (cap) {
          if(cap.prop != "membersChanges" && cap.prop != "votersChanges")
            simpleLineExtraction(obj, crlfCleaned, cap);
          else{
            this.error = multipleLinesExtraction(obj, crlfCleaned, cap);
            if(this.error)
              return false;
          }
        });
        return true;
      }
      else{
        this.error = "Bad document structure: no new line character at the end of the document.";
        return false;
      }
    }
  };

  this.verify = function(currency){
    var err = null;
    if(this.error){
      err = {code: 0, message: this.error};
    }
    if(!err){
      // Version
      if(!this.version || !this.version.match(/^1$/))
        err = {code: 100, message: "Version unknown"};
    }
    if(!err){
      // Currency
      if(!this.currency || !this.currency.match("^"+ currency + "$"))
        err = {code: 101, message: "Currency '"+ this.currency +"' not managed"};
    }
    if(!err){
      // Number
      if(!this.number || !this.number.match(/^\d+$/))
        err = {code: 102, message: "Incorrect Number field"};
    }
    if(!err){
      // Previous hash
      var isRoot = parseInt(this.number, 10) === 0;
      if(!isRoot && (!this.previousHash || !this.previousHash.match(/^[A-Z\d]{40}$/)))
        err = {code: 103, message: "PreviousHash must be provided for non-root amendment and match an uppercase SHA1 hash"};
      else if(isRoot && this.previousHash)
        err = {code: 104, message: "PreviousHash must not be provided for root amendment"};
    }
    if(!err){
      // Universal Dividend
      if(this.dividend && !this.dividend.match(/^\d+$/))
        err = {code: 105, message: "UniversalDividend must be a decimal number"};
    }
    if(!err){
      // Coin Minimal Power
      if(this.coinMinPower && !this.dividend)
        err = {code: 106, message: "CoinMinimalPower requires a valued UniversalDividend field"};
      else if(this.coinMinPower && !this.coinMinPower.match(/^\d+$/))
        err = {code: 107, message: "CoinMinimalPower must be a decimal number"};
      else if(this.coinMinPower && this.dividend.length < parseInt(this.coinMinPower, 10) + 1)
        err = {code: 108, message: "No coin can be created with this value of CoinMinimalPower and UniversalDividend"};
    }
    if(!err){
      // VotersSignaturesRoot
      if(this.previousHash && (!this.votersSigRoot || !this.votersSigRoot.match(/^[A-Z\d]{40}$/)))
        err = {code: 113, message: "VotersSignaturesRoot must be provided for non-root Amendment and match an uppercase SHA1 hash"};
    }
    if(!err){
      // VotersRoot
      if(this.previousHash && (!this.votersRoot || !this.votersRoot.match(/^[A-Z\d]{40}$/)))
        err = {code: 109, message: "VotersRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // VotersCount
      if(this.previousHash && (!this.votersCount || !this.votersCount.match(/^\d+$/)))
        err = {code: 110, message: "VotersCount must be a positive or null decimal number"};
    }
    if(!err){
      // MembersStatusRoot
      if(!this.membersStatusRoot || !this.membersStatusRoot.match(/^[A-Z\d]{40}$/))
        err = {code: 114, message: "MembersStatusRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // MembersRoot
      if(!this.membersRoot || !this.membersRoot.match(/^[A-Z\d]{40}$/))
        err = {code: 111, message: "MembersRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // MembersCount
      if(!this.membersCount || !this.membersCount.match(/^\d+$/))
        err = {code: 112, message: "MembersCount must be a positive or null decimal number"};
    }
    if(err){
      this.error = err.message;
      this.errorCode = err.code;
      return false;
    }
    return true;
  };

  this.getNewMembers = function() {
    var members = [];
    for (var i = 0; i < this.membersChanges.length; i++) {
      var matches = this.membersChanges[i].match(/^\+([\w\d]{40})$/);
      if(matches){
        members.push(matches[1]);
      }
    }
    return members;
  };

  this.getLeavingMembers = function() {
    var members = [];
    for (var i = 0; i < this.membersChanges.length; i++) {
      var matches = this.membersChanges[i].match(/^\-([\w\d]{40})$/);
      if(matches){
        members.push(matches[1]);
      }
    }
    return members;
  };

  this.getNewVoters = function() {
    var voters = [];
    for (var i = 0; i < this.votersChanges.length; i++) {
      var matches = this.votersChanges[i].match(/^\+([\w\d]{40})$/);
      if(matches){
        voters.push(matches[1]);
      }
    }
    return voters;
  };

  this.getLeavingVoters = function() {
    var voters = [];
    for (var i = 0; i < this.votersChanges.length; i++) {
      var matches = this.votersChanges[i].match(/^\-([\w\d]{40})$/);
      if(matches){
        voters.push(matches[1]);
      }
    }
    return voters;
  };

  this.getRaw = function() {
    var raw = "";
    raw += "Version: " + this.version + "\n";
    raw += "Currency: " + this.currency + "\n";
    raw += "Number: " + this.number + "\n";
    if(this.previousHash){
      raw += "PreviousHash: " + this.previousHash + "\n";
    }
    if(this.dividend){
      raw += "UniversalDividend: " + this.dividend + "\n";
    }
    if(this.coinMinPower){
      raw += "CoinMinimalPower: " + this.coinMinPower + "\n";
    }
    if(this.votersCount){
      raw += "VotersSignaturesRoot: " + this.votersSigRoot + "\n";
      raw += "VotersRoot: " + this.votersRoot + "\n";
      raw += "VotersCount: " + this.votersCount + "\n";
      raw += "VotersChanges:\n";
      for(var j = 0; j < this.votersChanges.length; j++){
        raw += this.votersChanges[j] + "\n";
      }
    }
    raw += "MembersStatusRoot: " + this.membersStatusRoot + "\n";
    raw += "MembersRoot: " + this.membersRoot + "\n";
    raw += "MembersCount: " + this.membersCount + "\n";
    raw += "MembersChanges:\n";
    for(var i = 0; i < this.membersChanges.length; i++){
      raw += this.membersChanges[i] + "\n";
    }
    return unix2dos(raw);
  };

  this.parse(rawAmend);
};



function simpleLineExtraction(am, wholeAmend, cap) {
  var fieldValue = wholeAmend.match(cap.regexp);
  if(fieldValue && fieldValue.length === 2){
    am[cap.prop] = fieldValue[1];
  }
  return;
}

function multipleLinesExtraction(am, wholeAmend, cap) {
  var fieldValue = wholeAmend.match(cap.regexp);
  am[cap.prop] = [];
  if(fieldValue && fieldValue.length == 2){
    var lines = fieldValue[1].split(/\n/);
    if(lines[lines.length - 1].match(/^$/)){
      for (var i = 0; i < lines.length - 1; i++) {
        var line = lines[i];
        var fprChange = line.match(/([+-][A-Z\d]{40})/);
        if(fprChange && fprChange.length == 2){
          am[cap.prop].push(fprChange[1]);
        }
        else{
          return "Wrong structure for line: '" + line + "'";
        }
      }
    }
    else return "Wrong structure for line: '" + line + "'";
  }
  return;
}

function trim(str){
  return str.replace(/^\s+|\s+$/g, '');
}

function unix2dos(str){
  return dos2unix(str).replace(/\n/g, '\r\n');
}

function dos2unix(str){
  return str.replace(/\r\n/g, '\n');
}
