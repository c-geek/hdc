var should      = require('should');
var assert      = require('assert');
var sha1        = require('sha1');
var fs          = require('fs');
var Certificate = require('../core/certificate');

var catFile    = __dirname + '/data/lolcat.pub';
var snowFile   = __dirname + '/data/snow.pub';
var uchihaFile = __dirname + '/data/uchiha.pub';

describe('Certificate of', function(){

  describe('LoLCat', function(){

    var cert;

    before(function(done) {
      var raw = fs.readFile(catFile, {encoding: 'utf8'}, function (err, data) {
        cert = new Certificate(data);
        done(err);
      });
    });

    it('should have FPR C73882B64B7E72237A2F460CE9CAB76D19A8651E', function(){
      assert.equal(cert.fingerprint, "C73882B64B7E72237A2F460CE9CAB76D19A8651E");
    });

    it('should have name "LoL Cat"', function(){
      assert.equal(cert.name, "LoL Cat");
    });

    it('should have comment "udid2"', function(){
      assert.equal(cert.comment, "udid2;c;CAT;LOL;2000-04-19;e+43.70-079.42;0;");
    });

    it('should have email "cem.moreau@gmail.com"', function(){
      assert.equal(cert.email, "cem.moreau@gmail.com");
    });

    it('should have raw data', function(){
      should.exist(cert.raw);
      cert.raw.should.match(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      cert.raw.should.match(/-----END PGP PUBLIC KEY BLOCK-----[\r\n]*$/);
    });
  });

  describe('John Snow', function(){

    var cert;

    before(function(done) {
      var raw = fs.readFile(snowFile, {encoding: 'utf8'}, function (err, data) {
        cert = new Certificate(data);
        done(err);
      });
    });

    it('should have FPR 33BBFC0C67078D72AF128B5BA296CC530126F372', function(){
      assert.equal(cert.fingerprint, "33BBFC0C67078D72AF128B5BA296CC530126F372");
    });

    it('should have name "Snowy"', function(){
      assert.equal(cert.name, "Snowy");
    });

    it('should have comment "udid2"', function(){
      assert.equal(cert.comment, "udid2;c;SNOW;JOHN;1980-07-13;e+40.71-074.01;0;");
    });

    it('should have email "cem.moreau@gmail.com"', function(){
      assert.equal(cert.email, "cem.moreau@gmail.com");
    });

    it('should have raw data', function(){
      should.exist(cert.raw);
      cert.raw.should.match(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      cert.raw.should.match(/-----END PGP PUBLIC KEY BLOCK-----[\r\n]*$/);
    });
  });

  describe('Uchiha Obito', function(){

    var cert;

    before(function(done) {
      var raw = fs.readFile(uchihaFile, {encoding: 'utf8'}, function (err, data) {
        cert = new Certificate(data);
        done(err);
      });
    });

    it('should have FPR 2E69197FAB029D8669EF85E82457A1587CA0ED9C', function(){
      assert.equal(cert.fingerprint, "2E69197FAB029D8669EF85E82457A1587CA0ED9C");
    });

    it('should have name "Tobi Uchiwa"', function(){
      assert.equal(cert.name, "Tobi Uchiwa");
    });

    it('should have comment "udid2"', function(){
      assert.equal(cert.comment, "udid2;c;UCHIWA;OBITO;2000-09-30;e+35.69+139.69;0");
    });

    it('should have email "cem.moreau@gmail.com"', function(){
      assert.equal(cert.email, "cem.moreau@gmail.com");
    });

    it('should have raw data', function(){
      should.exist(cert.raw);
      cert.raw.should.match(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      cert.raw.should.match(/-----END PGP PUBLIC KEY BLOCK-----[\r\n]*$/);
    });
  });
});