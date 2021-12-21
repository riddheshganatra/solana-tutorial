var web3 = require('@solana/web3.js');
var splToken = require('@solana/spl-token');

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time);
  })
}

(async () => {
  // connect to solana
  const connection = new web3.Connection(
    web3.clusterApiUrl('testnet'),
    'confirmed',
  );

  // generate keypair
  var fromWallet = web3.Keypair.generate();
  var toWallet = web3.Keypair.generate();

  // get some initial balance. Not possible in production.
  var fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    100000, // lambports
  );
  await connection.confirmTransaction(fromAirdropSignature);

  console.log(`from wallet airdrop done`);

  await sleep(5000)

  // multi sign transaction, eg: user A wantes to transfer to user B, and user C to fund transaction
  var feePayerWallet = web3.Keypair.generate();
  var feePayerAirdropSignature = await connection.requestAirdrop(
    feePayerWallet.publicKey,
    10000000, // lambports
  );
  await connection.confirmTransaction(feePayerAirdropSignature);

  console.log(`feepayer wallet airdrop done`);

  await sleep(5000)



  var fundedTransaction = new web3.Transaction({
    feePayer: feePayerWallet.publicKey
  }).add(
    web3.SystemProgram.transfer({
      fromPubkey: fromWallet.publicKey,
      toPubkey: toWallet.publicKey,
      lamports: 100,
    }),
  );

  // partially sign transaction
  let blockhashObj = await connection.getRecentBlockhash();
  fundedTransaction.recentBlockhash = await blockhashObj.blockhash;

  fundedTransaction.partialSign(fromWallet);

  // encoding tranaction so that we can send it to backend
  let endocdeTransction = fundedTransaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  // can be transfered over API if required
  endocdeTransction = endocdeTransction.toJSON()

  let transactionFromJson = web3.Transaction.from(Buffer.from(endocdeTransction, 'base64'));

  transactionFromJson.partialSign(feePayerWallet);

  const wireTransaction = transactionFromJson.serialize();
  const signature = await connection.sendRawTransaction(
    wireTransaction,
  );

  console.log({ signature });

})()



