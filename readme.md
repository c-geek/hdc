# HDC

HDC module aims to implement [HDC Messages Format](https://github.com/c-geek/nodecoind/blob/master/doc/HDC.md), which is a standard description of messages used by [NodeCoin project](https://github.com/c-geek/nodecoind).

## Usage

### Certificates

To handle certificates data, just:

```js
var Certificate = require('hdc').Certificate;

var data = fs.readFileSync('/path/to/lolcat.pub', 'utf8');
var cert = new Certificate(data);
```
Then, several data maybe extracted:

```js
console.log(cert.fingerprint);
// => C73882B64B7E72237A2F460CE9CAB76D19A8651E

console.log(cert.name);
// => LoL Cat

console.log(cert.email);
// => email@example.com

console.log(cert.comment);
// => udid2;c;CAT;LOL;2000-04-19;e+43.70-079.42;0;
```

### Amendments

To handle certificates data, just:

```js
var Amendment = require('hdc').Amendment;

var data = fs.readFileSync('/path/to/amendment', 'utf8');
var am = new Amendment(data);
if(am.error){
  // Some error happened while parsing data
  console.log(am.error);
}
```
Then, several data maybe extracted:

```js
console.log(am.version);
// => 1

console.log(am.currency);
// => beta_brousoufs

console.log(am.number);
// => 2

console.log(am.previousHash);
// => 0F45DFDA214005250D4D2CBE4C7B91E60227B0E5

console.log(am.dividend);
// => 100

console.log(am.getNewMembers());
// => ["31A6302161AC8F5938969E85399EB3415C237F93"]

...
```

# License

This software is provided under [MIT license](https://raw.github.com/c-geek/merkle/master/LICENSE).
