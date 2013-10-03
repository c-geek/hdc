var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Amendment = require('../core/amendment');

var amTest;

describe('Amendment', function(){

  describe('0 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      loadFromFile(amTest, __dirname + "/data/amendments/BB-AM0-OK", done);
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

    it('should be number 0', function(){
      assert.equal(amTest.number, 0);
    });

    it('should be generated on 1380397288', function(){
      assert.equal(amTest.generated, 1380397288);
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

    it('should have no previous hash', function(){
      should.not.exist(amTest.previousHash);
    });

    it('should have no previous votes root', function(){
      should.not.exist(amTest.previousVotesRoot);
    });

    it('should have no previous votes count', function(){
      should.not.exist(amTest.previousVotesCount);
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 members hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.membersRoot);
    });

    it('should have the following 3 new members', function(){
      var newMembers = amTest.getNewMembers();
      assert.equal(newMembers.length, 3);
      assert.equal(amTest.getLeavingMembers(), 0);
      assert.equal(amTest.membersCount, 3);
      assert.equal(newMembers[0], "2E69197FAB029D8669EF85E82457A1587CA0ED9C"); // Obito Uchiwa
      assert.equal(newMembers[1], "33BBFC0C67078D72AF128B5BA296CC530126F372"); // John Snow
      assert.equal(newMembers[2], "C73882B64B7E72237A2F460CE9CAB76D19A8651E"); // LoL Cat
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 voters hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.votersRoot);
    });

    it('should have the following 3 new voters', function(){
      var newVoters = amTest.getNewVoters();
      assert.equal(newVoters.length, 3);
      assert.equal(amTest.getLeavingVoters(), 0);
      assert.equal(amTest.votersCount, 3);
      assert.equal(newVoters[0], "2E69197FAB029D8669EF85E82457A1587CA0ED9C"); // Obito Uchiwa
      assert.equal(newVoters[1], "33BBFC0C67078D72AF128B5BA296CC530126F372"); // John Snow
      assert.equal(newVoters[2], "C73882B64B7E72237A2F460CE9CAB76D19A8651E"); // LoL Cat
    });

    it('its computed hash should be 58A2700B6CE56E112238FDCD81C8DACE2F2D06DC', function(){
      assert.equal(amTest.hash, '58A2700B6CE56E112238FDCD81C8DACE2F2D06DC');
    });

    it('its manual hash should be 58A2700B6CE56E112238FDCD81C8DACE2F2D06DC', function(){
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), '58A2700B6CE56E112238FDCD81C8DACE2F2D06DC');
    });
  });
});

function loadFromFile(am, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    am.parse(data);
    done(err);
  });
}
