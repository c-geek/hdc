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
  this.coins = null;
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
        {prop: "coins",             regexp: /Coins:\n([\s\S]*)Comment/},
        {prop: "comment",           regexp: /Comment:\n([\s\S]*)/}
      ];
      var crlfCleaned = rawTx.replace(/\r\n/g, "\n");
      if(crlfCleaned.match(/\n$/)){
        captures.forEach(function (cap) {
          if(cap.prop == "coins"){
            extractCoins(obj, crlfCleaned, cap);
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
      'BAD_RECIPIENT_OF_NONTRANSFERT': 155,
      'BAD_PREV_HASH_PRESENT': 156,
      'BAD_PREV_HASH_ABSENT': 157,
      'BAD_TX_NEEDONECOIN': 159,
      'BAD_TX_NULL': 160,
      'BAD_TX_NOTNULL': 161,
      'BAD_COINS_OF_VARIOUS_AM': 164,
      'BAD_CHANGE_COIN': 165,
      'BAD_CHANGE_SUM': 166
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
      // Coins
      var coins = this.getCoins();
      if(coins.length == 0){
        err = {code: codes['BAD_TX_NEEDONECOIN'], message: "Transaction requires at least one coin"};
      }
    }
    if(err){
      this.error = err.message;
      this.errorCode = err.code;
      return false;
    }
    return true;
  };

  this.getCoins = function() {
    var coins = [];
    for (var i = 0; i < this.coins.length; i++) {
      var matches = this.coins[i].match(/([A-Z\d]{40})-(\d+)-(\d+)(:([A-Z\d]{40})-(\d+))?/);
      if(matches && matches.length == 7){
        coins.push({
          issuer: matches[1],
          amNumber: parseInt(matches[2], 10),
          coinNumber: parseInt(matches[3], 10),
          transaction: matches[4] && {
            sender: matches[5],
            number: matches[6]
          }
        });
      }
    }
    return coins;
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
    raw += "Coins:\n";
    for(var i = 0; i < this.coins.length; i++){
      raw += this.coins[i] + "\n";
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

function extractCoins(tx, rawTx, cap) {
  var fieldValue = rawTx.match(cap.regexp);
  tx[cap.prop] = [];
  if(fieldValue && fieldValue.length == 2){
    var lines = fieldValue[1].split(/\n/);
    if(lines[lines.length - 1].match(/^$/)){
      for (var i = 0; i < lines.length - 1; i++) {
        var line = lines[i];
        var fprChange = line.match(/([A-Z\d]{40})-(\d+)-(\d+)(:([A-Z\d]{40})-(\d+))?/);
        if(fprChange && fprChange.length == 7){
          tx[cap.prop].push(line);
        }
        else{
          return "Wrong structure for line: '" + line + "'";
        }
      }
    }
    else return "Wrong structure for 'Coins' field of the transaction";
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
