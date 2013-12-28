var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Amendment = require('../core/amendment');

var amTest;

describe('Amendment', function(){

  describe('1 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      loadFromFile(amTest, __dirname + "/data/amendments/BB-AM1-OK", done);
    });

    it('should be verified for beta_brousouf currency', function(){
      var verified = amTest.verify("beta_brousouf");
      assert.equal(verified, true);
    });

    it('should be version 1', function(){
      assert.equal(amTest.version, 1);
    });

    it('should have beta_brousouf currency name', function(){
      assert.equal(amTest.currency, 'beta_brousouf');
    });

    it('should be number 1', function(){
      assert.equal(amTest.number, 1);
    });

    it('should be generated on 1380398542', function(){
      assert.equal(amTest.generated, 1380398542);
    });

    it('should have no Universal Dividend', function(){
      should.not.exist(amTest.dividend);
    });

    it('should have no Minimal Coin Power', function(){
      should.not.exist(amTest.coinMinPower);
    });

    it('should have 2 next required votes', function(){
      assert.equal(amTest.nextVotes, 2);
    });

    it('should have 58A2700B6CE56E112238FDCD81C8DACE2F2D06DC previous hash', function(){
      assert.equal(amTest.previousHash, '58A2700B6CE56E112238FDCD81C8DACE2F2D06DC');
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 members hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.membersRoot);
    });

    it('should have the following 0 new members', function(){
      assert.equal(amTest.getNewMembers(), 0);
      assert.equal(amTest.getLeavingMembers(), 0);
      assert.equal(amTest.membersCount, 3);
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 voters hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.votersRoot);
    });

    it('should have the following 0 new voters', function(){
      assert.equal(amTest.getNewVoters(), 0);
      assert.equal(amTest.getLeavingVoters(), 0);
      assert.equal(amTest.votersCount, 3);
    });

    it('its computed hash should be F07D0B6DBB7EA99E5208752EABDB8B721C0010E9', function(){
      assert.equal(amTest.hash, 'F07D0B6DBB7EA99E5208752EABDB8B721C0010E9');
    });

    it('its manual hash should be F07D0B6DBB7EA99E5208752EABDB8B721C0010E9', function(){
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), 'F07D0B6DBB7EA99E5208752EABDB8B721C0010E9');
    });
  });
});

function loadFromFile(am, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    am.parse(data);
    done(err);
  });
}
