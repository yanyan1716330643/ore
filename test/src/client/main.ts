import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction, Blockhash,
} from '@solana/web3.js';
// @ts-ignore
import fs from 'mz/fs';
// @ts-ignore
import path from 'path';



const PROGRAM_KEYPAIR_PATH = path.join(
  path.resolve(__dirname, '../../../deploy'),
  'ore-keypair.json'
);

const USER_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../../deploy'),
    'devnet_01.json'
);

const USER_KEYPAIR_PATH2 = path.join(
    path.resolve(__dirname, '../../../deploy'),
    'devnet_02.json'
);
async function getRecentBlockhash( connection:Connection) {
  const { blockhash } = await connection.getLatestBlockhash();
  return blockhash;
}

async function main() {
  console.log("=======","00","demo start");


  console.log("=======","10","start program keypair loading");
  const secretKeyString = await fs.readFile(PROGRAM_KEYPAIR_PATH, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const programKeypair = Keypair.fromSecretKey(secretKey);
  let programId: PublicKey = programKeypair.publicKey;
  console.log("=======","10","program publicKey is",programId.toBase58());

  console.log("=======","20","start user keypair loading");
  const userKeyString = await fs.readFile(USER_KEYPAIR_PATH, {encoding: 'utf8'});
  const userSecretKey = Uint8Array.from(JSON.parse(userKeyString));
  const userKeypair = Keypair.fromSecretKey(userSecretKey);
  let userPublicKey: PublicKey = userKeypair.publicKey;
  console.log("=======","20","userPublicKey is",userPublicKey.toBase58());

  console.log("=======","21","start user keypair loading");
  const userKeyString2 = await fs.readFile(USER_KEYPAIR_PATH2, {encoding: 'utf8'});
  const userSecretKey2 = Uint8Array.from(JSON.parse(userKeyString2));
  const userKeypair2 = Keypair.fromSecretKey(userSecretKey2);
  let userPublicKey2: PublicKey = userKeypair2.publicKey;
  console.log("=======","21","userPublicKey is",userPublicKey2.toBase58());

  console.log("=======","30","start network init(devnet) and get recent block");
  let connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  let blockhash= await getRecentBlockhash(connection);
  console.log("=======","30","recent block is",blockhash);


  console.log("=======","40","start userPublicKey sol balance query",userPublicKey.toBase58());
  let sol_balance = await connection.getBalance(userPublicKey).then(r => {return r;})
  console.log("=======","40","userPublicKey sol balance is",userPublicKey.toBase58(),sol_balance);

  if (sol_balance<5*1000000000){
    console.log("=======","41","start airdrop for userPublicKey",userPublicKey.toBase58());
    let airdropErr = null;
    try {
      //1 SOL = 10^9 Lamports
      const airdropRequest = await connection.requestAirdrop(userKeypair.publicKey, LAMPORTS_PER_SOL);
      //该方法已废弃，后面需要替换最新的方法实现
      await connection.confirmTransaction(airdropRequest).then(r=>{
        console.error("=======","41","airdrop back inner",r);
      }).catch(e=>{
        console.error("=======","41","airdrop err inner",e);
      });
    }catch (e){
      airdropErr = e;
    }
    if (airdropErr){
      console.error("=======","41","airdrop err",airdropErr);
    }else {
      console.log("=======","41","airdrop for userPublicKey success");
    }

  }

  // 假设的 bump 值
  const cmd = Buffer.from("d");
  // const bus_0_bump = Buffer.from("0");
  // const bus_1_bump = Buffer.from("1");
  // const bus_2_bump = Buffer.from("2");
  // const bus_3_bump = Buffer.from("3");
  // const bus_4_bump = Buffer.from("4");
  // const bus_5_bump = Buffer.from("5");
  // const bus_6_bump = Buffer.from("6");
  // const bus_7_bump = Buffer.from("7");
  // const config_bump = Buffer.from("8");
  // const metadata_bump = Buffer.from("9");
  // const mint_bump = Buffer.from("a");
  // const treasury_bump = Buffer.from("b");
  // const data = Buffer.concat([cmd,bus_0_bump, bus_1_bump, bus_2_bump, bus_3_bump, bus_4_bump, bus_5_bump, bus_6_bump, bus_7_bump, config_bump, metadata_bump, mint_bump, treasury_bump])
  const data = Buffer.concat([cmd])
  console.log("=======","50","start program ping");
  const instruction = new TransactionInstruction({
    // @ts-ignore
    recentBlockhash: blockhash,
    keys: [{pubkey: userKeypair.publicKey, isSigner: true, isWritable: true},{pubkey: userKeypair2.publicKey, isSigner: false, isWritable: true}],
    programId,
    data: data,
    //data: Buffer.from("0XXXXXXXXX"), 48 88 88 ...
    // User
    // Claim = 0,
    // Close = 1,
    // Mine = 2,
    // Open = 3,
    // Reset = 4,
    // Stake = 5,
    // Update = 6,
    // Upgrade = 7,
    //
    // // Admin
    // Initialize = 100,
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [userKeypair],
  ).then(r=>{
    console.log("=======","50","program ping success",r);
  }).catch(e=>{
    console.log("=======","50","program ping err",e);
  })
}


main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);

let back =
    {
      signature: '',
      transactionMessage: 'Transaction simulation failed: Error processing Instruction 0: incorrect program id for instruction',
      transactionLogs: [
        'Program 2ZXWmYTKTi1hWH1PuA6pZHcj7RCU4JKtRUPUDQPPkzZX invoke [1]',
        'Program log: step1 _o_ 2ZXWmYTKTi1hWH1PuA6pZHcj7RCU4JKtRUPUDQPPkzZX _o_ [AccountInfo { key: Dbfxv94A9LPpsqdqa1gGkTkWUG4vJ5upbDesKQF9UvbJ, owner: 11111111111111111111111111111111, is_signer: true, is_writable: true, executable: false, rent_epoch: 18446744073709551615, lamports: 5096086839, data.len: 0, .. }] _o_ [] ',
        'Program 2ZXWmYTKTi1hWH1PuA6pZHcj7RCU4JKtRUPUDQPPkzZX consumed 28632 of 200000 compute units',
        'Program 2ZXWmYTKTi1hWH1PuA6pZHcj7RCU4JKtRUPUDQPPkzZX failed: incorrect program id for instruction'
      ]
    }


