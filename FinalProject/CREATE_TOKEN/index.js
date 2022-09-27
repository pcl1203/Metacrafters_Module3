import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import {readFileSync, promises as fsPromises} from 'fs';

(async () => {
    // Step 1: Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const contents = await fsPromises.readFile('C:/Users/lagas/.config/solana/devnet.json', 'utf-8');
    const secretKey = Uint8Array.from(contents.toString().replace('[', '').replace(']', '').split(','));
    const fromWallet = Keypair.fromSecretKey(secretKey);

    const toWallet = new PublicKey('D8F4HHUBmhbiWpUBQH8uaLEjiaxNUtPST6362rjVN2BW'); // Phantom wallet key

    // Step 2: Airdrop SOL into your from wallet (SOL is still needed to fund tx)
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint( // returns public key MINT address!!!!!!!!!!
      connection, 
      fromWallet, // Payer
      fromWallet.publicKey, // Mint Auth 
      null, // Freeze Auth
      9 // Decimal Precision 1 Token = 1 000 000 000
      );

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount( // returns public key of TOKEN acct!!!!!!! from the FROM account
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey // owner of this token account
    )
    console.log('splTokenAccount:', fromTokenAccount.address.toBase58());

    //Step 4: Mint a new token to the from account this means minting Token
    let signature = await mintTo(
      connection,
      fromWallet, // payer
      mint,
      fromTokenAccount.address, // who we've minting to
      fromWallet.publicKey, // authority
      1000000000000000, // ammount we want to send 1M
      []
    );
    console.log('mint tx:', signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        150000000000, // 150
        []
    );
    //console.log('transfer tx:', signature); 
    console.log("splToken", mint.toBase58(), 
    " TO ADDRESS: ", toWallet.toBase58(), 
    '\nSIGNATURE:', signature);
    
  })();