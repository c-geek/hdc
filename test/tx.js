var should    = require('should');
var assert    = require('assert');
var sha1      = require('sha1');
var fs        = require('fs');
var Transaction = require('../core/transaction');

describe('Transaction', function(){

  describe('1 (issuance)', function(){

    var tx1;

    // Loads tx1 with its data
    before(function(done) {
      tx1 = new Transaction();
      loadFromFile(tx1, __dirname + "/data/tx/issuance1.tx", done);
    });

    it('it should have no error', function(){
      should.not.exist(tx1.errorCode);
    });

    it('it should have error anyway', function(){
      should.exist(tx1.error);
    });

    it('should be version 1', function(){
      assert.equal(tx1.version, 1);
    });

    it('should be number 1', function(){
      assert.equal(tx1.number, 1);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(tx1.currency, 'beta_brousouf');
    });

    it('should be ISSUANCE', function(){
      assert.equal(tx1.type, 'ISSUANCE');
    });

    it('should have sender 31A6302161AC8F5938969E85399EB3415C237F93', function(){
      assert.equal(tx1.sender, "31A6302161AC8F5938969E85399EB3415C237F93");
    });

    it('should have recipient 31A6302161AC8F5938969E85399EB3415C237F93', function(){
      assert.equal(tx1.recipient, "31A6302161AC8F5938969E85399EB3415C237F93");
    });

    it('should have 4 ordered amounts', function(){
      var amounts = tx1.getAmounts();
      assert.equal(amounts.length, 4);
      [100, 40, 110, 133].forEach(function(amount, index){
        should.exist(amounts[index].origin);
        should.exist(amounts[index].number);
        should.exist(amounts[index].value);
        amounts[index].origin.should.have.length(40);
        amounts[index].number.should.be.above(-1);
        amounts[index].value.should.be.above(0);
        amounts[index].value.should.equal(amount);
      });
    });

    it('should have a comment', function(){
      should.exist(tx1.comment);
    });

    it('its computed hash should be 6792D1A97FBE5ABDB68114E0109E76CA387EE6CE', function(){
      assert.equal(tx1.hash, '6792D1A97FBE5ABDB68114E0109E76CA387EE6CE');
    });

    it('its manual hash should be 6792D1A97FBE5ABDB68114E0109E76CA387EE6CE', function(){
      assert.equal(sha1(tx1.getRaw()).toUpperCase(), '6792D1A97FBE5ABDB68114E0109E76CA387EE6CE');
    });
  });

  describe('1 (transfert)', function(){

    var tx1;

    // Loads tx1 with its data
    before(function(done) {
      tx1 = new Transaction();
      loadFromFile(tx1, __dirname + "/data/tx/transfert1.tx", done);
    });

    it('it should have no error', function(){
      should.not.exist(tx1.errorCode);
    });

    it('it should have error anyway', function(){
      should.exist(tx1.error);
    });

    it('should be version 1', function(){
      assert.equal(tx1.version, 1);
    });

    it('should be number 95', function(){
      assert.equal(tx1.number, 95);
    });

    it('should have beta_brousoufs currency name', function(){
      assert.equal(tx1.currency, 'beta_brousouf');
    });

    it('should be TRANSFERT', function(){
      assert.equal(tx1.type, 'TRANSFER');
    });

    it('should have sender 31A6302161AC8F5938969E85399EB3415C237F93', function(){
      assert.equal(tx1.sender, "31A6302161AC8F5938969E85399EB3415C237F93");
    });

    it('should have recipient 86F7E437FAA5A7FCE15D1DDCB9EAEAEA377667B8', function(){
      assert.equal(tx1.recipient, "86F7E437FAA5A7FCE15D1DDCB9EAEAEA377667B8");
    });

    it('should have 2 amounts', function(){
      assert.equal(tx1.getAmounts().length, 2);
    });

    it('should have 2 amounts to send', function(){
      var amounts = tx1.getAmounts();
      assert.equal(amounts.length, 2);
      [500, 200].forEach(function(amount, index){
        should.exist(amounts[index].origin);
        should.exist(amounts[index].number);
        should.exist(amounts[index].value);
        amounts[index].origin.should.have.length(40);
        amounts[index].number.should.be.above(-1);
        amounts[index].value.should.be.above(0);
        amounts[index].value.should.equal(amount);
      });
    });

    it('should have a comment', function(){
      should.exist(tx1.comment);
    });

    it('its computed hash should be FC1732768E62DD36A808EE23861E236E4D148B43', function(){
      assert.equal(tx1.hash, 'FC1732768E62DD36A808EE23861E236E4D148B43');
    });

    it('its manual hash should be FC1732768E62DD36A808EE23861E236E4D148B43', function(){
      assert.equal(sha1(tx1.getRaw()).toUpperCase(), 'FC1732768E62DD36A808EE23861E236E4D148B43');
    });
  });
});

function loadFromFile(tx, file, done) {
  fs.readFile(file, {encoding: "utf8"}, function (err, data) {
    tx.parse(data);
    tx.verify('beta_brousouf');
    done(err);
  });
}
