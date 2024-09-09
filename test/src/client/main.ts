import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  Transaction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction, Blockhash,
} from '@solana/web3.js';
// @ts-ignore
import fs from 'mz/fs';
// @ts-ignore
import path from 'path';


// 定义枚举
const OreInstruction = {
  Claim: 0,
  Close: 1,
  Mine: 2,
  Open: 3,
  Reset: 4,
  Stake: 5,
  Update: 6,
  Upgrade: 7,
  Initialize: 100
};


const PROGRAM_KEYPAIR_PATH = path.join(
  path.resolve(__dirname, '../../../deploy'),
  'ore-keypair.json'
);

const USER_KEYPAIR_PATH = path.join(
    path.resolve(__dirname, '../../../deploy'),
    'devnet_01.json'
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

  const data = Buffer.alloc(13);
  let bumps = new Array(13);
  let keys = new Array(19);
  let singers = new Array(9);

  // 计算每个种子的 PDA 和 bump 值
  for (let i = 0; i < bumps.length; i++) {
    if (i==0){
      bumps[i] =  OreInstruction.Initialize;
    }
    if (i>=1&&i<=8){//bus0~7
      const seeds = Buffer.from([98, 117, 115, i-1])
      const [pda, bump] = await PublicKey.findProgramAddress([seeds], programId);

      bumps[i] = bump;
    }
    if (i==9){//config
      let config_seed = Buffer.from("config")
      const [pda, bump] = await PublicKey.findProgramAddress([config_seed], programId);
      bumps[i] = bump;
    }
    if (i==10){//metadata
      let metadata_seed = Buffer.from("metadata")
      const [pda, bump] = await PublicKey.findProgramAddress([metadata_seed], programId);
      bumps[i] = bump;
    }
    if (i==11){//mint
      // let mint_seed = Buffer.from("mint")
      const mint_seed = Buffer.from([109, 105, 110, 116]);
      const noise = Buffer.from([89, 157, 88, 232, 243, 249, 197, 132, 199, 49, 19, 234, 91, 94, 150, 41].slice());
      const [pda, bump] = await PublicKey.findProgramAddress([mint_seed, noise], programId);
      bumps[i] = bump;
    }
    if (i==12){//treasury
      let treasury_seed = Buffer.from("treasury")
      const [pda, bump] = await PublicKey.findProgramAddress([treasury_seed], programId);
      bumps[i] = bump;
    }
  }

  // 使用 bumps 填充剩余的缓冲区
  for (let i = 0; i < bumps.length; i++) {
    data.writeUInt8(bumps[i], i); // 将 bump 值写入缓冲区
  }

  // let keys = []; 设置每个账户
  for (let i = 0; i < 19; i++) {


    if (i==0){//signer account
      keys[i]={pubkey: userKeypair.publicKey, isSigner: true, isWritable: true}
    }

    // if (i>=1&&i<=8){//bus0~7 account
    if (i>=1&&i<=19){//bus0~7 account+others
      const formattedNumber = (i + 1).toString().padStart(2, '0');
      const temp_path = path.join(
          path.resolve(__dirname, '../../../deploy'),
          `devnet_${formattedNumber}.json`
      );
      const userKeyStringTemp = await fs.readFile(temp_path, {encoding: 'utf8'});
      const userSecretKeyTemp = Uint8Array.from(JSON.parse(userKeyStringTemp));
      const userKeypairTemp = Keypair.fromSecretKey(userSecretKeyTemp);

      let userPublicKeyTemp: PublicKey = userKeypairTemp.publicKey;
      if (i>=1&&i<=8){//bus
        singers[i] = userKeypairTemp;
        keys[i]={pubkey: userKeypairTemp.publicKey, isSigner: false, isWritable: true}
      }else {//others
        keys[i]={pubkey: userKeypairTemp.publicKey, isSigner: false, isWritable: true}
      }
    }

    // if (i==9){//config account
    //
    // }
    // if (i==10){//metadata account
    //
    // }
    // if (i==11){//mint account
    //
    // }
    // if (i==12){//treasury account
    //
    // }
    // if (i==13){//treasury_tokens account
    //
    // }
    if (i==14){//system_program account 11111111111111111111111111111111
      keys[i]={pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: true}
    }
    if (i==15){//token_program account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
      keys[i]={pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: true}
    }
    if (i==16){//associated_token account ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
      keys[i]={pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: true}
    }
    if (i==17){//metadata_program account
      keys[i]={pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: true}
    }
    if (i==18){//rent_sysvar account
      keys[i]={pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: true}
    }
  }
  console.log("=======","50","start program ping");
  const instruction = new TransactionInstruction({
    // @ts-ignore
    recentBlockhash: blockhash,
    keys: keys,
    programId,
    data: data,
  });
  singers[0] = userKeypair;
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction).add(ComputeBudgetProgram.setComputeUnitLimit({ units: 18_00_000 })),
      [singers[0]],
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


