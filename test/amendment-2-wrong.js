var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Amendment = require('../core/amendment');

var amTest;

describe('Amendment', function(){

  describe('2 (WRONG-UD ONE) of beta_brousouf currency', function(){

    var errCode = 0;
    // Loads amTest with its data
    before(function(done) {
      loadFromFile(amTest, __dirname + "/data/amendments/BB-AM2-WRONG-UD", function(err, am) {
        amTest = am;
        var success = amTest.verify("beta_brousouf");
        errCode = amTest.errorCode;
        done();
      });
    });

    it('should NOT be verified for beta_brousouf currency', function(){
      var verified = amTest.verify("beta_brousouf");
      assert.equal(verified, false);
    });

    it('should be version 1', function(){
      assert.equal(amTest.version, 1);
    });

    it('should have beta_brousouf currency name', function(){
      assert.equal(amTest.currency, 'beta_brousouf');
    });

    it('should be number 2', function(){
      assert.equal(amTest.number, 2);
    });

    it('should have a Universal Dividend of value 122', function(){
      assert.equal(amTest.dividend, 122);
    });

    it('should have a CoinBase Power of 0', function(){
      assert.equal(amTest.coinBase, 0);
    });

    it('should have verification error code 175 (bad coin sum)', function(){
      assert.equal(errCode, 175);
    });
  });
});

function loadFromFile(am, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    done(err, new Amendment(data));
  });
}
