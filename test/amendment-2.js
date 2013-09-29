var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Amendment = require('../core/amendment');

var amTest;

describe('Amendment', function(){

  describe('2 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      loadFromFile(amTest, __dirname + "/data/amendments/BB-AM2-OK", done);
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

    it('should be generated on 1380400542', function(){
      assert.equal(amTest.generated, 1380400542);
    });

    it('should have a niversal Dividend of value 100', function(){
      assert.equal(amTest.dividend, 100);
    });

    it('should have a Minimal Coin Power of 0', function(){
      assert.equal(amTest.coinMinPower, 0);
    });

    it('should have 2 next required votes', function(){
      assert.equal(amTest.nextVotes, 2);
    });

    it('should have 5A6434BCD09400625CEA75BFE6F786829018BAD1 previous hash', function(){
      assert.equal(amTest.previousHash, '5A6434BCD09400625CEA75BFE6F786829018BAD1');
    });

    it('should have previous votes root 21DDC685FB54AB0520B091E3762845F0AA97C257', function(){
      assert.equal(amTest.previousVotesRoot, '21DDC685FB54AB0520B091E3762845F0AA97C257');
    });

    it('should have 3 previous votes count', function(){
      assert.equal(amTest.previousVotesCount, 3);
    });

    it('should have F92B6F81C85200250EE51783F5F9F6ACA57A9AFF members hash', function(){
      assert.equal(amTest.membersRoot, 'F92B6F81C85200250EE51783F5F9F6ACA57A9AFF');
    });

    it('should have the following new member', function(){
      var newMembers = amTest.getNewMembers();
      assert.equal(newMembers.length, 1);
      assert.equal(amTest.membersCount, 4);
      assert.equal(newMembers[0], "31A6302161AC8F5938969E85399EB3415C237F93"); // cgeek
    });

    it('should have DC7A9229DFDABFB9769789B7BFAE08048BCB856F voters hash', function(){
      assert.equal(amTest.votersRoot, 'DC7A9229DFDABFB9769789B7BFAE08048BCB856F');
    });

    it('should have 0 new voters', function(){
      var voters = amTest.getNewVoters();
      assert.equal(voters.length, 0);
      assert.equal(amTest.votersCount, 2);
    });

    it('should have one voter leaving', function(){
      var leavingVoters = amTest.getLeavingVoters();
      assert.equal(leavingVoters.length, 1);
      assert.equal(amTest.votersCount, 2);
    });

    it('its computed hash should be B913193383A3BF119A28CA40A664531922DE2ADC', function(){
      assert.equal(amTest.hash, 'B913193383A3BF119A28CA40A664531922DE2ADC');
    });

    it('its manual hash should be B913193383A3BF119A28CA40A664531922DE2ADC', function(){
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), 'B913193383A3BF119A28CA40A664531922DE2ADC');
    });
  });
});

function loadFromFile(am, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    am.parse(data);
    done(err);
  });
}
