var async = require('async');
var sha1  = require('sha1');
var _     = require('underscore');

module.exports = function Membership(rawMembership){

  this.version = null;
  this.currency = null;
  this.status = null;
  this.basis = null;

  this.hash = null;
  this.error = null;

  this.parse = function(rawMembership) {
    if(!rawMembership){
      this.error = "No joining request given";
      return false;
    }
    else{
      this.hash = sha1(unix2dos(rawMembership)).toUpperCase();
      var obj = this;
      var captures = [
        {prop: "version",   regexp: /Version: (.*)/},
        {prop: "currency",  regexp: /Currency: (.*)/},
        {prop: "status",    regexp: /Status: (.*)/},
        {prop: "basis",     regexp: /Basis: (.*)/}
      ];
      var crlfCleaned = rawMembership.replace(/\r\n/g, "\n");
      if(crlfCleaned.match(/\n$/)){
        captures.forEach(function (cap) {
          simpleLineExtraction(obj, crlfCleaned, cap);
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
    if(this.error && this.errorCode){
      err = {code: this.errorCode, message: this.error};
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
      // Status
      if(!this.status || !this.status.match(/^(JOIN|ACTUALIZE|LEAVE)$/))
        err = {code: 102, message: "Incorrect Status field"};
    }
    if(!err){
      // Basis
      if(!this.basis || !this.basis.match(/^\d+$/))
        err = {code: 103, message: "Incorrect Basis field"};
    }
    if(err){
      this.error = err.message;
      this.errorCode = err.code;
      return false;
    }
    return true;
  };

  this.getRaw = function() {
    var raw = "";
    raw += "Version: " + this.version + "\n";
    raw += "Currency: " + this.currency + "\n";
    raw += "Status: " + this.status + "\n";
    raw += "Basis: " + this.basis + "\n";
    return unix2dos(raw);
  };

  this.parse(rawMembership);
};



function simpleLineExtraction(am, wholeMembership, cap) {
  var fieldValue = wholeMembership.match(cap.regexp);
  if(fieldValue && fieldValue.length === 2){
    am[cap.prop] = fieldValue[1];
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
