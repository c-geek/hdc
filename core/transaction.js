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
        {prop: "type",              regexp: /Type: (.*)/},
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
      'BAD_TYPE': 158,
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
      // Recipient = Sender for ISSUANCE and CHANGE
      if(this.type != 'TRANSFER' && this.sender != this.recipient){
        err = {code: codes['BAD_RECIPIENT_OF_NONTRANSFERT'], message: "Recipient must be equal to Sender on ISSUANCE and CHANGE transactions"};
      }
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
      // Coins
      var coins = this.getCoins();
      if(coins.length == 0){
        err = {code: codes['BAD_TX_NEEDONECOIN'], message: "Transaction requires at least one coin"};
      }
      if(this.type == 'TRANSFER'){
        coins.forEach(function (coin, index) {
          if(!err && !coin.transaction){
            err = {code: codes['BAD_TX_NULL'], message: "Coin in a TRANSFER transaction must have a transaction link"};
          }
        })
      }
      if(this.type == 'ISSUANCE'){
        coins.forEach(function (coin, index) {
          if(!err && coin.transaction){
            err = {code: codes['BAD_TX_NOTNULL'], message: "Coin in an ISSUANCE transaction must NOT have a transaction link"};
          }
        });
        if(!err){
          var amNumber = '';
          coins.forEach(function (coin, index) {
            amNumber = amNumber || coin.originNumber;
            if(!err && coin.originNumber != amNumber){
              err = {code: codes['BAD_COINS_OF_VARIOUS_AM'], message: "Coin in an ISSUANCE transaction must ALL target the SAME amendment number"};
            }
          });
        }
      }
      if(this.type == 'CHANGE'){
        var resultingCoins = [];
        var materialCoins = [];
        var isFirstPart = true;
        coins.forEach(function(coin, index){
          // First coins (resulting coins) must be without transaction ID,
          // while following coins are ALL considered material transaction
          // AND provide transaction ID
          isFirstPart = isFirstPart && !coin.transaction;
          if (isFirstPart) {
            resultingCoins.push(coin);
          } else {
            materialCoins.push(coin);
          }
        });
        resultingCoins.forEach(function (coin, index) {
          if (!err) {
            var coin_origin = coin.originType + "-" + coin.originNumber;
            if(!coin_origin.match(/^C-\d+$/)){
              err = {code: codes['BAD_CHANGE_COIN'], message: "Coin[" + index + "] of CHANGE transaction has bad origin"};
            }
          }
        });
        materialCoins.forEach(function (coin, index) {
          if (!err) {
            if(!coin.transaction){
              err = {code: codes['BAD_CHANGE_COIN'], message: "Coin[" + index + "] of CHANGE transaction must provide transaction ID"};
            }
          }
        });
        if (!err) {
          var changeSum = 0;
          var materialSum = 0;
          resultingCoins.forEach(function (coin, index) {
            changeSum += coin.base * Math.pow(10, coin.power);
          });
          materialCoins.forEach(function (coin, index) {
            materialSum += coin.base * Math.pow(10, coin.power);
          });
          if(materialSum != changeSum){
            err = {code: codes['BAD_CHANGE_SUM'], message: "Bad change sum (material coins sums " + materialSum + ' but change coins sums ' + changeSum + ')'};
          }
        }
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
      var matches = this.coins[i].match(/([A-Z\d]{40})-(\d+)-(\d)-(\d+)-(A|C)-(\d+)(, ([A-Z\d]{40})-(\d+))?/);
      if(matches && matches.length == 10){
        coins.push({
          issuer: matches[1],
          number: parseInt(matches[2], 10),
          base: parseInt(matches[3], 10),
          power: parseInt(matches[4], 10),
          originType: matches[5],
          originNumber: matches[6],
          transaction: matches[7] && {
            sender: matches[8],
            number: matches[9]
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
    raw += "Type: " + this.type + "\n";
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
        var fprChange = line.match(/([A-Z\d]{40})-(\d+)-(\d)-(\d+)-(A|C)-(\d+)(, ([A-Z\d]{40})-(\d+))?/);
        if(fprChange && fprChange.length == 10){
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
