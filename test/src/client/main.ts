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
// 从 tokenType.ts 文件中导入 TokenType 枚举

import {
  OreInstruction,
  getRecentBlockhash,
  loadProgramId,
  loadInitKeyPair,
  airdrop
} from './common/Common';




async function main() {
  //获取合约公钥
  let programId = await loadProgramId();
  //获取初始化用户密钥对(最高权限的那个账户)
  let userKeypair = await loadInitKeyPair();
  let userPublicKey: PublicKey = userKeypair.publicKey;
  //网络
  let connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  //网络块
  let blockhash= await getRecentBlockhash(connection);
  //空投
  airdrop(userPublicKey,connection);
  //data
  const data = Buffer.alloc(13);
  //bumps
  let bumps = new Array(13);
  //account
  let keys = new Array(19);


  // 填充keys
  for (let i = 0; i < keys.length; i++) {
    //signer account
    if (i==0){
      keys[i]={pubkey: userKeypair.publicKey, isSigner: true, isWritable: true}
      bumps[i] =  OreInstruction.Initialize;
    }

    //bus0~7 account pda
    if (i>=1&&i<=8){
      const formattedNumber = (i + 1).toString().padStart(2, '0');
      const temp_path = path.join(path.resolve(__dirname, '../../../deploy'), `devnet_${formattedNumber}.json`);
      const userKeyStringTemp = await fs.readFile(temp_path, {encoding: 'utf8'});
      const userSecretKeyTemp = Uint8Array.from(JSON.parse(userKeyStringTemp));
      const userKeypairTemp = Keypair.fromSecretKey(userSecretKeyTemp);
      keys[i]={pubkey: userKeypairTemp.publicKey, isSigner: false, isWritable: true}
      const seeds = Buffer.from([98, 117, 115, i-1])
      const [pda, bump] = await PublicKey.findProgramAddress([seeds], programId);
      bumps[i] = bump;
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
    }

    //config account pda
    if (i==9){
      let config_seed = Buffer.from("config")
      const [pda, bump] = await PublicKey.findProgramAddress([config_seed], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      bumps[i] = bump;
      console.log(pda.toBase58(),bump)
    }

    //metadata account pda
    if (i==10){
      // let metadata_seed = Buffer.from("metadata");
      let b1 = Buffer.from([109, 101, 116, 97, 100, 97, 116, 97]);
      let MPL_TOKEN_METADATA_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      //这里计算比较复杂，直接取物理值先用着
      let b3 = Buffer.from([54, 180, 171, 27, 40, 119, 119, 169, 119, 124, 188, 174, 91, 175, 134, 209, 249, 252, 152, 237, 82, 113, 155, 244, 180, 232, 229, 177, 219, 40, 53, 105])
      const [pda, bump] = await PublicKey.findProgramAddress([b1,MPL_TOKEN_METADATA_ID.toBytes(),b3], MPL_TOKEN_METADATA_ID);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      bumps[i] = bump;
      console.log(pda.toBase58(),bump)
    }

    //mint account pda
    if (i==11){
      // let mint_seed = Buffer.from("mint")
      const mint_seed = Buffer.from([109, 105, 110, 116]);
      const noise = Buffer.from([89, 157, 88, 232, 243, 249, 197, 132, 199, 49, 19, 234, 91, 94, 150, 41].slice());
      const [pda, bump] = await PublicKey.findProgramAddress([mint_seed, noise], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      bumps[i] = bump;
      console.log(pda.toBase58(),bump)
    }

    //treasury account pda
    if (i==12){
      let treasury_seed = Buffer.from("treasury")
      const [pda, bump] = await PublicKey.findProgramAddress([treasury_seed], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      bumps[i] = bump;
      console.log(pda.toBase58(),bump)
    }

    if (i==13){
      keys[i]={pubkey: new PublicKey("DnFwu1LKF7WqnKvrYAVKLoqQ8M1Asz2BN8CRqbYXKATF"), isSigner: false, isWritable: true}
    }
    //system_program account 11111111111111111111111111111111
    if (i==14){
      keys[i]={pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: true}
    }
    //token_program account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    if (i==15){
      keys[i]={pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: true}
    }
    //associated_token account ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
    if (i==16){
      keys[i]={pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: true}
    }
    //metadata_program account
    if (i==17){
      keys[i]={pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: true}
    }
    //rent_sysvar account
    if (i==18){
      keys[i]={pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: true}
    }
  }



  // 使用 bumps 填充剩余的缓冲区
  for (let i = 0; i < bumps.length; i++) {
    data.writeUInt8(bumps[i], i); // 将 bump 值写入缓冲区
  }



  const instruction = new TransactionInstruction({keys: keys, programId, data: data,});

  console.log("=======","ready to init");
  await sendAndConfirmTransaction(
      connection,
      new Transaction().add(instruction).add(ComputeBudgetProgram.setComputeUnitLimit({ units: 18_00_000 })),
      [userKeypair],
  ).then(r=>{
    console.log("=======","50","program init success",r);
  }).catch(e=>{
    console.log("=======","50","program init err",e);
  })
}


main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);


