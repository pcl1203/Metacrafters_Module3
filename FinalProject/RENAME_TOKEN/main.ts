import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js"
import * as anchor from '@project-serum/anchor'
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

export function loadWalletKey(keypairFile:string): web3.Keypair {
  const fs = require("fs");
  let seed = Uint8Array.from(fs.readFileSync(keypairFile).toString().replace('[', '').replace(']', '').split(','));
  const keyPair = web3.Keypair.fromSecretKey(seed);
  console.log(keyPair.publicKey.toBase58());
  return keyPair;
}


async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey('C:/Users/lagas/.config/solana/devnet.json');   
    const mint = new web3.PublicKey("EJB2pWUSSXQ4J5pJ188cs9ZjQicmu1paH1w7SZ3BjDEj"); // place splToken address here

    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);

    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }

    const dataV2 = {
        name: "Claws",
        symbol: "$SAC",
        uri: "https://gateway.pinata.cloud/ipfs/QmWx19qZxzscD3VeKUNQ84o3GuoxEb6b4dE7LfhFFrWBLg",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    const args = {
        createMetadataAccountArgsV2: {
            data: dataV2,
            isMutable: true
        }
    };

    const ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    
    const tx = new web3.Transaction();

    tx.add(ix);
  
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);



}
main()