var web3 = require('@solana/web3.js');
var splToken = require('@solana/spl-token');


(async()=>{
    // connect to solana
    const connection = new web3.Connection(
        web3.clusterApiUrl('testnet'),
        'confirmed',
      );

    // generate keypair
    var fromWallet = web3.Keypair.generate();
    // console.log(fromWallet.publicKey.toString());
    // console.log(fromWallet.secretKey);
    var toWallet = web3.Keypair.generate();
    // console.log(toWallet.publicKey.toString());
    // console.log(toWallet.secretKey);

    // get balance
    console.log(await connection.getBalance(fromWallet.publicKey));
    console.log(await connection.getBalance(toWallet.publicKey));

    // get some initial balance. Not possible in production.
    var fromAirdropSignature = await connection.requestAirdrop(
        fromWallet.publicKey,
        1000000000, // lambports
      );
    await connection.confirmTransaction(fromAirdropSignature);

    console.log(await connection.getBalance(fromWallet.publicKey));


    // transaction
    var transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: fromWallet.publicKey,
          toPubkey: toWallet.publicKey,
          lamports: 10000,
        }),
      );

      // Sign transaction, broadcast, and confirm
      var signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [fromWallet],
      );
      console.log('SIGNATURE', signature);

    console.log(await connection.getBalance(fromWallet.publicKey));
    console.log(await connection.getBalance(toWallet.publicKey));


})()