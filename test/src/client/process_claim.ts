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
   getAtaAndAccountByPayer, getBalance
} from './common/Common';




async function process_initialize() {
  //获取合约公钥
  let programId = await loadProgramId();
  // //获取初始化用户密钥对(最高权限的那个账户)
  // let userKeypair = await loadInitKeyPair();
  // let userPublicKey: PublicKey = userKeypair.publicKey;
  //网络
  let connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  //网络块
  let blockhash= await getRecentBlockhash(connection);
  //空投
  // await airdrop(userPublicKey,connection);
  //data
  const data = Buffer.alloc(9);
  //bumps
  let bumps = new Array(2);
  //account
  let keys = new Array(6);
  //
  let signer = [];
  //操作
  let func = OreInstruction.Claim;

  // 填充keys
  for (let i = 0; i < keys.length; i++) {
    //signer account 目前用devnet_12.json
    if (i==0){
      const beneficiaryString = await fs.readFile(path.join(path.resolve(__dirname, '../../../deploy'), 'devnet_03.json'), {encoding: 'utf8'});
      const beneficiarySecretKey = Uint8Array.from(JSON.parse(beneficiaryString));
      const beneficiaryKeypair = Keypair.fromSecretKey(beneficiarySecretKey);
      keys[i] = {pubkey: beneficiaryKeypair.publicKey, isSigner: false, isWritable: true}
      bumps[i] =  func.value;
      signer.push(beneficiaryKeypair)
    }

    // beneficiary_info, 收款人 目前用devnet_12.json
    if (i==1){
      const beneficiaryString = await fs.readFile(path.join(path.resolve(__dirname, '../../../deploy'), 'devnet_03.json'), {encoding: 'utf8'});
      const beneficiarySecretKey = Uint8Array.from(JSON.parse(beneficiaryString));
      const beneficiaryKeypair = Keypair.fromSecretKey(beneficiarySecretKey);
      let [beneficiaryATA,account] = await getAtaAndAccountByPayer(connection,programId,beneficiaryKeypair)
      let lamport = await getBalance(connection,beneficiaryKeypair.publicKey)
      keys[i] = {pubkey: beneficiaryATA, isSigner: false, isWritable: true}
      console.log(keys[i].pubkey.toBase58(),"beneficiary 收款账户","ore lamport:",lamport)
    }

    // proof_info,
    if (i==2){
      //todo 这里理论上需要是需要矿机挖矿的，这里合约调试用不校验只要就给
      let temp_seeds = Buffer.from("temp_proof")
      const [pda, bump] = await PublicKey.findProgramAddress([temp_seeds], programId);
      keys[i] = {pubkey:pda, isSigner: false, isWritable: true}
      // let num = 22;
      // // 创建一个长度为 4 的 Buffer 来存放 32 位整数
      // const buffer = Buffer.alloc(4);
      //
      // // 将数字 123456789 以小端序的形式写入 Buffer
      // buffer.writeUInt32LE(1234567890, 0);
      // bumps[1] = buffer
      bumps[1] = 255 //todo这里目前只是占位用
      console.log(keys[i].pubkey.toBase58(),"挖矿证明",bumps[1])
    }

    //treasury account pda
    if (i==3){
      let treasury_seed = Buffer.from("treasury")
      const [pda, bump] = await PublicKey.findProgramAddress([treasury_seed], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      console.log(pda.toBase58(),bump,"pda treasury")
    }

    // treasury_tokens, 通过TREASURY_TOKENS_ADDRESS复杂的方式算出来的
    if (i==4){
      keys[i]={pubkey: new PublicKey("DnFwu1LKF7WqnKvrYAVKLoqQ8M1Asz2BN8CRqbYXKATF"), isSigner: false, isWritable: true}
      console.log(keys[i].pubkey.toBase58(),"TREASURY_TOKENS_ADDRESS")
    }

    //token_program account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    if (i==5){
      keys[i]={pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: true}
      console.log(keys[i].pubkey.toBase58(),"token_program")
    }

  }

  // 使用 bumps 填充剩余的缓冲区
  for (let i = 0; i < bumps.length; i++) {
    data.writeUInt8(bumps[i], i);
  }


  console.log(signer[0].publicKey.toBase58(),"signer")


  const instruction = new TransactionInstruction({keys: keys, programId, data: data,});

  console.log("=======","ready to",func.name);
  // await sendAndConfirmTransaction(
  //     connection,
  //     new Transaction().add(instruction).add(ComputeBudgetProgram.setComputeUnitLimit({ units: 18_00_000 })),
  //     signer,
  // ).then(r=>{
  //   console.log("=======",func.name,"success",r);
  // }).catch(e=>{
  //   console.log("=======",func.name,"err",e);
  // })
}


process_initialize().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);


