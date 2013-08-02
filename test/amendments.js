var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var Amendment = require('../core/amendment');

var amTest;

describe('Amendment', function(){

  describe('0 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      amTest.loadFromFile(__dirname + "/data/amendments/BB-AM0-OK", done);
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

    it('should have no Universal Dividend', function(){
      should.not.exist(amTest.dividend);
    });

    it('should have no Minimal Coin Power', function(){
      should.not.exist(amTest.coinMinPower);
    });

    it('should have no previous hash', function(){
      should.not.exist(amTest.previousHash);
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 members hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.membersRoot);
    });

    it('should have F5ACFD67FC908D28C0CFDAD886249AC260515C90 voters hash', function(){
      assert.equal('F5ACFD67FC908D28C0CFDAD886249AC260515C90', amTest.votersRoot);
    });

    it('should have the following 3 new members', function(){
      var newMembers = amTest.getNewMembers();
      assert.equal(newMembers.length, 3);
      assert.equal(amTest.membersCount, 3);
      assert.equal(newMembers[0], "2E69197FAB029D8669EF85E82457A1587CA0ED9C"); // Obito Uchiwa
      assert.equal(newMembers[1], "33BBFC0C67078D72AF128B5BA296CC530126F372"); // John Snow
      assert.equal(newMembers[2], "C73882B64B7E72237A2F460CE9CAB76D19A8651E"); // LoL Cat
    });

    it('should have the following 3 new voters', function(){
      var newVoters = amTest.getNewVoters();
      assert.equal(newVoters.length, 3);
      assert.equal(amTest.votersCount, 3);
      assert.equal(newVoters[0], "2E69197FAB029D8669EF85E82457A1587CA0ED9C");
      assert.equal(newVoters[1], "33BBFC0C67078D72AF128B5BA296CC530126F372");
      assert.equal(newVoters[2], "C73882B64B7E72237A2F460CE9CAB76D19A8651E");
    });

    it('its hash should be EE6046B38C5B496F2C3A96FBE2C28A29AE49CD9F', function(){
      assert.equal(amTest.hash, 'EE6046B38C5B496F2C3A96FBE2C28A29AE49CD9F');
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), 'EE6046B38C5B496F2C3A96FBE2C28A29AE49CD9F');
    });
  });

  describe('1 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      amTest.loadFromFile(__dirname + "/data/amendments/BB-AM1-OK", done);
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

    it('should have no Universal Dividend', function(){
      should.not.exist(amTest.dividend);
    });

    it('should have no Minimal Coin Power', function(){
      should.not.exist(amTest.coinMinPower);
    });

    it('should have EE6046B38C5B496F2C3A96FBE2C28A29AE49CD9F previous hash', function(){
      assert.equal(amTest.previousHash, 'EE6046B38C5B496F2C3A96FBE2C28A29AE49CD9F');
    });

    it('should have 0 new members', function(){
      var newMembers = amTest.getNewMembers();
      assert.equal(newMembers.length, 0);
      assert.equal(amTest.membersCount, 3);
    });

    it('should have 0 new voters', function(){
      var newVoters = amTest.getNewVoters();
      assert.equal(newVoters.length, 0);
      assert.equal(amTest.votersCount, 3);
    });

    it('its -self-computed- hash should be 0F45DFDA214005250D4D2CBE4C7B91E60227B0E5', function(){
      assert.equal(amTest.hash, '0F45DFDA214005250D4D2CBE4C7B91E60227B0E5');
    });

    it('its -manually-computed- should be 0F45DFDA214005250D4D2CBE4C7B91E60227B0E5', function(){
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), '0F45DFDA214005250D4D2CBE4C7B91E60227B0E5');
    });
  });

  describe('2 of beta_brousouf currency', function(){

    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      amTest.loadFromFile(__dirname + "/data/amendments/BB-AM2-OK", done);
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

    it('should have a niversal Dividend of value 100', function(){
      assert.equal(amTest.dividend, 100);
    });

    it('should have a Minimal Coin Power of 0', function(){
      assert.equal(amTest.coinMinPower, 0);
    });

    it('should have 0F45DFDA214005250D4D2CBE4C7B91E60227B0E5 previous hash', function(){
      assert.equal(amTest.previousHash, '0F45DFDA214005250D4D2CBE4C7B91E60227B0E5');
    });

    it('should have F92B6F81C85200250EE51783F5F9F6ACA57A9AFF members hash', function(){
      assert.equal(amTest.membersRoot, 'F92B6F81C85200250EE51783F5F9F6ACA57A9AFF');
    });

    it('should have DC7A9229DFDABFB9769789B7BFAE08048BCB856F voters hash', function(){
      assert.equal(amTest.votersRoot, 'DC7A9229DFDABFB9769789B7BFAE08048BCB856F');
    });

    it('should have the following new member', function(){
      var newMembers = amTest.getNewMembers();
      assert.equal(newMembers.length, 1);
      assert.equal(amTest.membersCount, 4);
      assert.equal(newMembers[0], "31A6302161AC8F5938969E85399EB3415C237F93"); // cgeek
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

    it('its -self-computed- hash should be 8E825DA77C1C2A7C655132C04389DF5411601923', function(){
      assert.equal(amTest.hash, '8E825DA77C1C2A7C655132C04389DF5411601923');
    });

    it('its -manually-computed- should be 8E825DA77C1C2A7C655132C04389DF5411601923', function(){
      assert.equal(sha1(amTest.getRaw()).toUpperCase(), '8E825DA77C1C2A7C655132C04389DF5411601923');
    });
  });

  describe('2 (WRONG-UD ONE) of beta_brousouf currency', function(){

    var errCode = 0;
    // Loads amTest with its data
    before(function(done) {
      amTest = new Amendment();
      amTest.loadFromFile(__dirname + "/data/amendments/BB-AM2-WRONG-UD", function(err) {
        amTest.verify("beta_brousouf", function(err, code) {
          errCode = code;
          done();
        });
      });
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

    it('should have a niversal Dividend of value 122', function(){
      assert.equal(amTest.dividend, 122);
    });

    it('should have a Minimal Coin Power of 3', function(){
      assert.equal(amTest.coinMinPower, 3);
    });

    it('should have verification error code 108', function(){
      assert.equal(errCode, 108);
    });
  });
});