var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Membership = require('../core/membership');

describe('Membership request', function(){

  describe('JOIN', function(){

    var join;

    // Loads join with its data
    before(function(done) {
      join = new Membership();
      loadFromFile(join, __dirname + "/data/membership/join", done);
    });

    it('it should have no error', function(){
      should.not.exist(join.errorCode);
    });

    it('it should have error string anyway', function(){
      should.exist(join.error);
    });

    it('should be version 1', function(){
      assert.equal(join.version, 1);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(join.currency, 'beta_brousoufs');
    });

    it('should have JOIN status', function(){
      assert.equal(join.status, "JOIN");
    });

    it('should have basis 0', function(){
      assert.equal(join.basis, 0);
    });

    it('its computed hash should be 2E136EE15C5414162EC3F9B39D100A92C2A48219', function(){
      assert.equal(join.hash, '2E136EE15C5414162EC3F9B39D100A92C2A48219');
    });

    it('its manual hash should be 2E136EE15C5414162EC3F9B39D100A92C2A48219', function(){
      assert.equal(sha1(join.getRaw()).toUpperCase(), '2E136EE15C5414162EC3F9B39D100A92C2A48219');
    });
  });

  describe('ACTUALIZE', function(){

    var actu;

    // Loads actu with its data
    before(function(done) {
      actu = new Membership();
      loadFromFile(actu, __dirname + "/data/membership/actualize", done);
    });

    it('it should have no error', function(){
      should.not.exist(actu.errorCode);
    });

    it('it should have error string anyway', function(){
      should.exist(actu.error);
    });

    it('should be version 1', function(){
      assert.equal(actu.version, 1);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(actu.currency, 'beta_brousoufs');
    });

    it('should have ACTUALIZE status', function(){
      assert.equal(actu.status, "ACTUALIZE");
    });

    it('should have basis 1', function(){
      assert.equal(actu.basis, 1);
    });

    it('its computed hash should be 0B25E92CD102B512B8B1312BBE7B83210176ED46', function(){
      assert.equal(actu.hash, '0B25E92CD102B512B8B1312BBE7B83210176ED46');
    });

    it('its manual hash should be 0B25E92CD102B512B8B1312BBE7B83210176ED46', function(){
      assert.equal(sha1(actu.getRaw()).toUpperCase(), '0B25E92CD102B512B8B1312BBE7B83210176ED46');
    });
  });

  describe('LEAVE', function(){

    var leave;

    // Loads leave with its data
    before(function(done) {
      leave = new Membership();
      loadFromFile(leave, __dirname + "/data/membership/leave", done);
    });

    it('it should have no error', function(){
      should.not.exist(leave.errorCode);
    });

    it('it should have error string anyway', function(){
      should.exist(leave.error);
    });

    it('should be version 1', function(){
      assert.equal(leave.version, 1);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(leave.currency, 'beta_brousoufs');
    });

    it('should have LEAVE status', function(){
      assert.equal(leave.status, "LEAVE");
    });

    it('should have basis 2', function(){
      assert.equal(leave.basis, 2);
    });

    it('its computed hash should be 913329BD6D50394DE9B0A024374041049BC4EE6F', function(){
      assert.equal(leave.hash, '913329BD6D50394DE9B0A024374041049BC4EE6F');
    });

    it('its manual hash should be 913329BD6D50394DE9B0A024374041049BC4EE6F', function(){
      assert.equal(sha1(leave.getRaw()).toUpperCase(), '913329BD6D50394DE9B0A024374041049BC4EE6F');
    });

    it('it should be verified', function(){
      var verified = leave.verify('beta_brousoufs');
      verified.should.be.ok;
    });
  });

  describe('BAD-1', function(){

    var bad1;

    // Loads bad1 with its data
    before(function(done) {
      bad1 = new Membership();
      loadFromFile(bad1, __dirname + "/data/membership/bad-1", done);
    });

    it('should be version 1', function(){
      assert.equal(bad1.version, 1);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(bad1.currency, 'beta_brousoufs');
    });

    it('should have LAAF status', function(){
      assert.equal(bad1.status, "LAAF");
    });

    it('should have basis 0', function(){
      assert.equal(bad1.basis, 0);
    });

    it('it should not be verified', function(){
      bad1.verify('beta_brousoufs').should.not.be.ok;
      bad1.errorCode.should.equal(102);
    });
  });
});

function loadFromFile(membershipReq, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    membershipReq.parse(data);
    done(err);
  });
}
