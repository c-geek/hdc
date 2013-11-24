var async = require('async');
var sha1  = require('sha1');
var _     = require('underscore');

module.exports = function Amendment(rawAmend){

  this.version = null;
  this.currency = null;
  this.number = null;
  this.generated = null;
  this.dividend = null;
  this.coinMinPower = null;
  this.nextVotes = null;
  this.previousHash = null;
  this.previousVotesRoot = null;
  this.previousVotesCount = null;
  this.membersRoot = null;
  this.membersCount = 0;
  this.membersChanges = [];
  this.votersRoot = null;
  this.votersCount = 0;
  this.votersChanges = [];
  this.hash = null;
  this.error = null;

  this.parse = function(rawAmend) {
    if(!rawAmend){
      this.error = "No amendment given";
      return false;
    }
    else{
      this.error = "";
      this.hash = sha1(unix2dos(rawAmend)).toUpperCase();
      var obj = this;
      var captures = [
        {prop: "version",           regexp: /Version: (.*)/},
        {prop: "currency",          regexp: /Currency: (.*)/},
        {prop: "number",            regexp: /Number: (.*)/},
        {prop: "generated",         regexp: /GeneratedOn: (.*)/},
        {prop: "dividend",          regexp: /UniversalDividend: (.*)/},
        {prop: "coinMinPower",      regexp: /CoinMinimalPower: (.*)/},
        {prop: "nextVotes",         regexp: /NextRequiredVotes: (.*)/},
        {prop: "previousHash",      regexp: /PreviousHash: (.*)/},
        {prop: "previousVotesRoot", regexp: /PreviousVotesRoot: (.*)/},
        {prop: "previousVotesCount",regexp: /PreviousVotesCount: (.*)/},
        {prop: "membersRoot",       regexp: /MembersRoot: (.*)/},
        {prop: "membersCount",      regexp: /MembersCount: (.*)/},
        {prop: "membersChanges",    regexp: /MembersChanges:\n([\s\S]*)VotersRoot/},
        {prop: "votersRoot",        regexp: /VotersRoot: (.*)/},
        {prop: "votersCount",       regexp: /VotersCount: (.*)/},
        {prop: "votersChanges",     regexp: /VotersChanges:\n([\s\S]*)/},
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
    var codes = {
      'VERSION': 150,
      'CURRENCY': 151,
      'NUMBER': 152,
      'GENERATEDON': 153,
      'UD': 154,
      'NEXT_VOTES': 156,
      'PREV_HASH': 157,
      'PREV_VOTES_ROOT': 158,
      'PREV_VOTES_COUNT': 159,
      'MEMBERS_ROOT': 160,
      'MEMBERS_COUNT': 161,
      'MEMBERS_CHANGES': 162,
      'VOTERS_ROOT': 160,
      'VOTERS_COUNT': 161,
      'VOTERS_CHANGES': 162,
      'COIN_MIN_POW_UD': 170,
      'COIN_MIN_POW_INTEGER': 171,
      'COIN_MIN_POW_TOOLOW': 172,
    }
    if(this.error){
      err = {code: 0, message: this.error};
    }
    if(!err){
      // Version
      if(!this.version || !this.version.match(/^1$/))
        err = {code: codes['VERSION'], message: "Version unknown"};
    }
    if(!err){
      // Currency
      if(!this.currency || !this.currency.match("^"+ currency + "$"))
        err = {code: codes['CURRENCY'], message: "Currency '"+ this.currency +"' not managed"};
    }
    if(!err){
      // Number
      if(!this.number || !this.number.match(/^\d+$/))
        err = {code: codes['NUMBER'], message: "Incorrect Number field"};
    }
    if(!err){
      // GeneratedOn
      if(!this.generated || !this.generated.match(/^\d+$/))
        err = {code: codes['GENERATEDON'], message: "GeneratedOn field must be a positive or zero integer"};
    }
    if(!err){
      // Universal Dividend
      if(this.dividend && !this.dividend.match(/^\d+$/))
        err = {code: codes['UD'], message: "UniversalDividend must be a positive or zero integer"};
    }
    if(!err){
      // Coin Minimal Power
      if(this.coinMinPower && !this.dividend)
        err = {code: codes['COIN_MIN_POW_UD'], message: "CoinMinimalPower requires a valued UniversalDividend field"};
      else if(this.coinMinPower && !this.coinMinPower.match(/^\d+$/))
        err = {code: codes['COIN_MIN_POW_INTEGER'], message: "CoinMinimalPower must be a positive or zero integer"};
      else if(this.coinMinPower && this.dividend.length < parseInt(this.coinMinPower, 10) + 1)
        err = {code: codes['COIN_MIN_POW_TOOLOW'], message: "No coin can be created with this value of CoinMinimalPower and UniversalDividend"};
    }
    if(!err){
      // NextRequiredVotes
      if(this.nextVotes && !this.nextVotes.match(/^\d+$/))
        err = {code: codes['NEXT_VOTES'], message: "NextRequiredVotes must be a positive or zero integer"};
    }
    if(!err){
      // Previous hash
      var isRoot = parseInt(this.number, 10) === 0;
      if(!isRoot && (!this.previousHash || !this.previousHash.match(/^[A-Z\d]{40}$/)))
        err = {code: codes['PREV_HASH'], message: "PreviousHash must be provided for non-root amendment and match an uppercase SHA1 hash"};
      else if(isRoot && this.previousHash)
        err = {code: codes['PREV_HASH'], message: "PreviousHash must not be provided for root amendment"};
    }
    if(!err){
      // PreviousVotesCount
      if(this.previousVotesCount && !this.previousVotesCount.match(/^\d+$/))
        err = {code: codes['PREV_VOTES_COUNT'], message: "PreviousVotesCount must be a positive or zero integer"};
    }
    if(!err){
      // PreviousVotesRoot
      if(this.previousVotesRoot && !this.previousVotesRoot.match(/^[A-Z\d]{40}$/))
        err = {code: codes['PREV_VOTES_ROOT'], message: "PreviousVotesRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // VotersRoot
      if(this.previousHash && (!this.votersRoot || !this.votersRoot.match(/^[A-Z\d]{40}$/)))
        err = {code: codes['VOTERS_ROOT'], message: "VotersRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // VotersCount
      if(this.previousHash && (!this.votersCount || !this.votersCount.match(/^\d+$/)))
        err = {code: codes['VOTERS_COUNT'], message: "VotersCount must be a positive or zero integer"};
    }
    if(!err){
      // MembersRoot
      if(!this.membersRoot || !this.membersRoot.match(/^[A-Z\d]{40}$/))
        err = {code: codes['MEMBERS_ROOT'], message: "MembersRoot must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // MembersCount
      if(!this.membersCount || !this.membersCount.match(/^\d+$/))
        err = {code: codes['MEMBERS_COUNT'], message: "MembersCount must be a positive or zero integer"};
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
    raw += "GeneratedOn: " + this.generated + "\n";
    if(this.dividend){
      raw += "UniversalDividend: " + this.dividend + "\n";
    }
    if(this.coinMinPower){
      raw += "CoinMinimalPower: " + this.coinMinPower + "\n";
    }
    raw += "NextRequiredVotes: " + this.nextVotes + "\n";
    if(this.previousHash){
      raw += "PreviousHash: " + this.previousHash + "\n";
    }
    if(this.previousVotesRoot){
      raw += "PreviousVotesRoot: " + this.previousVotesRoot + "\n";
    }
    if(this.previousVotesCount){
      raw += "PreviousVotesCount: " + this.previousVotesCount + "\n";
    }
    if(this.membersRoot){
      raw += "MembersRoot: " + this.membersRoot + "\n";
      raw += "MembersCount: " + this.membersCount + "\n";
      raw += "MembersChanges:\n";
      for(var i = 0; i < this.membersChanges.length; i++){
        raw += this.membersChanges[i] + "\n";
      }
    }
    raw += "VotersRoot: " + this.votersRoot + "\n";
    raw += "VotersCount: " + this.votersCount + "\n";
    raw += "VotersChanges:\n";
    for(var j = 0; j < this.votersChanges.length; j++){
      raw += this.votersChanges[j] + "\n";
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
