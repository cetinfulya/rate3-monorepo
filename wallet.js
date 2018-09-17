/*
The code is refered from the following links
https://www.npmjs.com/package/stellar-hd-wallet for account creation
https://www.npmjs.com/package/node-forge for encryption, decryption
https://www.stellar.org/developers/guides/ for uploading accounts to testnet, transaction
*/

const stellarHDWallet = require('stellar-hd-wallet') 
const forge = require('node-forge');
const fs = require('fs');
const StellarSdk = require('stellar-sdk');

/** Returns seed phrases (mnemonic)
 */
function generateSeedPhrases() {
    return stellarHDWallet.generateMnemonic();
}

/**
 * Return an wallet generated from the seed phrases
 * @param {string} mnemonic - The string consists of seed phrases, spearated by spaces
 */
function generateWallet(mnemonic) {
    return stellarHDWallet.fromMnemonic(mnemonic)
}

/**
 * 
 * @param {int} index 0,1,2,... 
 * @param {object} wallet the wallet containing the seed phrases 
 * The key pair has to be uploaded to Stellar (testnet) 
 */
function generateKeyPair(index, wallet) {
  return wallet.getKeypair(index)
}

/**
 * This function uploads the account to stellar testnet.
 * The account object is generated by `generateWallet(mnemonic)`
 * @param {object} account 
 */
function uploadAccountToTestnet(account) {
  // The SDK does not have tools for creating test accounts, so you'll have to
  // make your own HTTP request.

  var request = require('request');
  request.get({
    url: 'https://friendbot.stellar.org',
    qs: { addr: account.publicKey() },
    json: true
  }, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('ERROR!', error || body);
    }
    else {
      console.log('SUCCESS! You have a new account :)\n', body);
    }
  });
}

/**
 * Prints the account and its balance.
 * This is to check the existence and balance of an account, not a core functionality. 
 * @param {object} account 
 */
function checkAccountBalance(account) {
  var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

  // the JS SDK uses promises for most actions, such as retrieving an account
  server.loadAccount(account.publicKey()).then(function(acc) {
    console.log('Balances for account: ' + account.publicKey());
    acc.balances.forEach(function(balance) {
      console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
    });
    console.log(account)
  });
}

/**
 * Use AES-CBC to encrypt the rawString with password, and save it.
 * @param {string} password - User's password 
 * @param {string} rawString - The string to be encrypted
 * @param {string} fileName - The name of the file that saves the encrypted string
 */
function encryptAndSave(password, rawString, fileName) {
    // AES key and IV sizes
    const keySize = 24;
    const ivSize = 8;
   
    // get derived bytes
    const salt = forge.random.getBytesSync(8);
    const derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize/*, md*/);
    const buffer = forge.util.createBuffer(derivedBytes);
    const key = buffer.getBytes(keySize);
    const iv = buffer.getBytes(ivSize);
   
    let cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(rawString, 'binary'));
    cipher.finish();
   
    let output = forge.util.createBuffer();
   
    // if using a salt, prepend this to the output:
    if(salt !== null) {
      output.putBytes('Salted__'); // (add to match openssl tool output)
      output.putBytes(salt);
    }
    output.putBuffer(cipher.output);

    fs.writeFileSync(fileName +'.enc', output.getBytes(), {encoding: 'binary'});
    return true;
  }
   
  /**
   * Decrypt and return the original string
   * @param {string} password - User's password
   * @param {string} fileName - The name of the file that saves the encrypted string 
   */
  function decrypt(password, fileName) {
    let input = fs.readFileSync(fileName+'.enc', {encoding: 'binary'});
   
    // parse salt from input
    input = forge.util.createBuffer(input, 'binary');
    // skip "Salted__" (if known to be present)
    input.getBytes('Salted__'.length);
    // read 8-byte salt
    const salt = input.getBytes(8);
   
    // AES key and IV sizes
    const keySize = 24;
    const ivSize = 8;
   
    const derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize);
    const buffer = forge.util.createBuffer(derivedBytes);
    const key = buffer.getBytes(keySize);
    const iv = buffer.getBytes(ivSize);
   
    let decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(input);
    const result = decipher.finish(); // check 'result' for true/false
   
    return decipher.output;
  }

  function signTransaction(transaction, sourceAccount) {
    transaction.sign(sourceAccount)
    return transaction
  }

  /**
   * Sign transactions and transact
   * @param {string} from - Private key of the sender 
   * @param {string} to - Public key of the receiver 
   * @param {string} amount - The amount of XLM to send, in string format 
   * @param {string} memo_type - The type of memo 
   * @param {string} memo - the content of memo
   */
  function sendLumens(from, to, amount, memo_type, memo) {
    StellarSdk.Network.useTestNetwork();
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var sourceKeys = StellarSdk.Keypair
      .fromSecret(from);
    var destinationId = to;
    // Transaction will hold a built transaction we can resubmit if the result is unknown.
    var transaction;
    
    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    server.loadAccount(destinationId)
      // If the account is not found, surface a nicer error message for logging.
      .catch(StellarSdk.NotFoundError, function (error) {
        throw new Error('The destination account does not exist!');
      })
      // If there was no error, load up-to-date information on your account.
      .then(function() {
        return server.loadAccount(sourceKeys.publicKey());
      })
      .then(function(sourceAccount) {
        // Start building the transaction.
        transaction = new StellarSdk.TransactionBuilder(sourceAccount)
          .addOperation(StellarSdk.Operation.payment({
            destination: destinationId,
            // Because Stellar allows transaction in many currencies, you must
            // specify the asset type. The special "native" asset represents Lumens.
            asset: StellarSdk.Asset.native(),
            amount: amount
          }))
          .build();
        // Sign the transaction to prove you are actually the person sending it.
        //transaction.sign(sourceKeys);
        transaction = signTransaction(transaction, sourceKeys)
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
      })
      .then(function(result) {
        console.log('Success! Results:', result);
      })
      .catch(function(error) {
        console.error('Something went wrong!', error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
      });
    return true
  }

  /**
   * Perform telegated signing
   * @param {string} URI - The input URI, start with web+stellar:
   */
  function parseURIandSendLumen(URI) {
    //parse uri

    //send lumen
    //sendLumens(...)
    return true
  }

// exports the variables and functions above so that other modules can use them
module.exports.generateSeedPhrases = generateSeedPhrases;  
module.exports.generateWallet = generateWallet;  
module.exports.encryptAndSave = encryptAndSave;  
module.exports.decrypt = decrypt; 
module.exports.uploadAccountToTestnet = uploadAccountToTestnet; 
module.exports.checkAccountBalance = checkAccountBalance;
module.exports.sendLumens = sendLumens;

//let seed = generateSeedPhrases()
let seed = 'copper nature mechanic beach anxiety spare pond reward volcano thrive stamp devote tone phone blanket enemy swear survey when flower fade error armed book'
//console.log(seed)
let wallet = generateWallet(seed)
//console.log(wallet)
//console.log(wallet.getPublicKey(6));
//console.log(wallet.getSecret(6));
//console.log(wallet.getKeypair(6))
//uploadAccountToTestnet(wallet.getKeypair(6))
//checkAccountBalance(wallet.getKeypair(6))
sendLumens(wallet.getSecret(5), wallet.getPublicKey(6), 1, '', '')
//console.log(account.derive(`m/44'/148'/0'`))



/*
// sample usage
password = 'qwerty';
seedPhrases = generateSeedPhrases();
wallet = generateWallet(seedPhrases);
encryptAndSave(password, wallet.getSecret(0), 'privateKey');
encryptAndSave(password, seedPhrases, 'mnemonic');
decryptedPrivateKey = decrypt(password, 'privateKey');
decryptedMnemonic = decrypt(password, 'mnemonic');

console.log('seedPhrases:')
console.log(seedPhrases)
console.log('seedPhrases decrypted:')
console.log(decryptedMnemonic.data)

console.log('PrivateKey:')
console.log(wallet.getSecret(0))
console.log('PrivateKey decrypted:')
console.log(decryptedPrivateKey.data)
console.log('Generate wallet from seedPhrases:')
console.log(generateWallet(decryptedMnemonic.data).getSecret(0))
*/


