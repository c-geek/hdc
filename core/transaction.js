var async = require('async');
var sha1  = require('sha1');
var _     = require('underscore');

module.exports = function Transaction(rawTx){

  this.version = null;
  this.currency = null;
  this.sender = null;
  this.number = null;
  this.previousHash = null;
  this.recipient = null;
  this.type = null;
  this.amounts = null;
  this.comment = [];
  this.hash = null;
  this.error = null;

  this.parse = function(rawTx) {
    if(!rawTx){
      this.error = "No transaction given";
      return false;
    }
    else{
      this.hash = sha1(unix2dos(rawTx)).toUpperCase();
      var obj = this;
      var captures = [
        {prop: "version",           regexp: /Version: (.*)/},
        {prop: "currency",          regexp: /Currency: (.*)/},
        {prop: "sender",            regexp: /Sender: (.*)/},
        {prop: "number",            regexp: /Number: (.*)/},
        {prop: "previousHash",      regexp: /PreviousHash: (.*)/},
        {prop: "recipient",         regexp: /Recipient: (.*)/},
        {prop: "type",              regexp: /Type: (.*)/},
        {prop: "amounts",           regexp: /Amounts:\n([\s\S]*)Comment/},
        {prop: "comment",           regexp: /Comment:\n([\s\S]*)/}
      ];
      var crlfCleaned = rawTx.replace(/\r\n/g, "\n");
      if(crlfCleaned.match(/\n$/)){
        captures.forEach(function (cap) {
          if(cap.prop == "amounts"){
            extractAmounts(obj, crlfCleaned, cap);
          }
          else{
            simpleLineExtraction(obj, crlfCleaned, cap);
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
    var code = 150;
    var codes = {
      'BAD_VERSION': 150,
      'BAD_CURRENCY': 151,
      'BAD_NUMBER': 152,
      'BAD_SENDER': 153,
      'BAD_RECIPIENT': 154,
      'BAD_PREV_HASH_PRESENT': 156,
      'BAD_PREV_HASH_ABSENT': 157,
      'BAD_TYPE': 158,
      'BAD_TX_NEEDONECOIN': 159,
      'BAD_AMOUNTS_SORT': 170
    }
    if(!err){
      // Version
      if(!this.version || !this.version.match(/^1$/))
        err = {code: codes['BAD_VERSION'], message: "Version unknown"};
    }
    if(!err){
      // Currency
      if(!this.currency || !this.currency.match("^"+ currency + "$"))
        err = {code: codes['BAD_CURRENCY'], message: "Currency '"+ this.currency +"' not managed"};
    }
    if(!err){
      // Number
      if(!this.number || !this.number.match(/^\d+$/))
        err = {code: codes['BAD_NUMBER'], message: "Incorrect Number field"};
    }
    if(!err){
      // Sender
      if(!this.sender || !this.sender.match(/^[A-Z\d]{40}$/))
        err = {code: codes['BAD_SENDER'], message: "Sender must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // Recipient
      if(!this.recipient || !this.recipient.match(/^[A-Z\d]{40}$/))
        err = {code: codes['BAD_RECIPIENT'], message: "Recipient must be provided and match an uppercase SHA1 hash"};
    }
    if(!err){
      // Previous hash
      var isRoot = parseInt(this.number, 10) === 0;
      if(!isRoot && (!this.previousHash || !this.previousHash.match(/^[A-Z\d]{40}$/)))
        err = {code: codes['BAD_PREV_HASH_ABSENT'], message: "PreviousHash must be provided for non-root transactions and match an uppercase SHA1 hash"};
      else if(isRoot && this.previousHash)
        err = {code: codes['BAD_PREV_HASH_PRESENT'], message: "PreviousHash must not be provided for root transactions"};
    }
    if(!err){
      // Type
      if(!this.type || !this.type.match(/^(ISSUANCE|TRANSFER|CHANGE)$/))
        err = {code: codes['BAD_TYPE'], message: "Incorrect Type field"};
    }
    if(!err){
      // Amounts
      var amounts = this.getAmounts();
      if(amounts.length == 0){
        err = {code: codes['BAD_TX_NEEDONECOIN'], message: "Transaction requires at least one amount"};
      }
      // Verifying lines' order
      var amountsAsString = "";
      amounts.forEach(function(amount){
        amountsAsString += amount.origin + '-' + amount.number + ':' + amount.value + '\r\n';
      });
      var linesHash = sha1(amountsAsString).toUpperCase();
      amountsAsString = "";
      amounts.sort();
      amounts.forEach(function(amount){
        amountsAsString += amount.origin + '-' + amount.number + ':' + amount.value + '\r\n';
      });
      if (sha1(amountsAsString).toUpperCase() != linesHash) {
        err = {code: codes['BAD_AMOUNTS_SORT'], message: "Lines are not sorted the right way."};
      }
    }
    if(err){
      this.error = err.message;
      this.errorCode = err.code;
      return false;
    }
    return true;
  };

  this.getAmounts = function() {
    var amounts = [];
    for (var i = 0; i < this.amounts.length; i++) {
      var matches = this.amounts[i].match(/([A-Z\d]{40})-(\d+):(\d+)/);
      if(matches && matches.length == 4){
        amounts.push({
          origin: matches[1],
          number: parseInt(matches[2], 10),
          value: parseInt(matches[3], 10)
        });
      }
    }
    return amounts;
  };

  this.getRaw = function() {
    var raw = "";
    raw += "Version: " + this.version + "\n";
    raw += "Currency: " + this.currency + "\n";
    raw += "Sender: " + this.sender + "\n";
    raw += "Number: " + this.number + "\n";
    if(this.previousHash){
      raw += "PreviousHash: " + this.previousHash + "\n";
    }
    raw += "Recipient: " + this.recipient + "\n";
    raw += "Type: " + this.type + "\n";
    raw += "Amounts:\n";
    for(var i = 0; i < this.amounts.length; i++){
      raw += this.amounts[i] + "\n";
    }
    raw += "Comment:\n" + this.comment;
    return unix2dos(raw);
  };

  this.parse(rawTx);
};



function simpleLineExtraction(tx, rawTx, cap) {
  var fieldValue = rawTx.match(cap.regexp);
  if(fieldValue && fieldValue.length === 2){
    tx[cap.prop] = fieldValue[1];
  }
  return;
}

function extractAmounts(tx, rawTx, cap) {
  var fieldValue = rawTx.match(cap.regexp);
  tx[cap.prop] = [];
  if(fieldValue && fieldValue.length == 2){
    var lines = fieldValue[1].split(/\n/);
    if(lines[lines.length - 1].match(/^$/)){
      for (var i = 0; i < lines.length - 1; i++) {
        var line = lines[i];
        var match = line.match(/([A-Z\d]{40})-(\d+):(\d+)/);
        if(match && match.length == 4){
          tx[cap.prop].push(line);
        }
        else{
          return "Wrong structure for line: '" + line + "'";
        }
      }
    }
    else return "Wrong structure for 'Amounts' field of the transaction";
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
