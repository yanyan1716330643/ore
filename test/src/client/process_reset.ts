import {
  ComputeBudgetProgram,
  Connection,
  PublicKey, sendAndConfirmTransaction, Transaction,
  TransactionInstruction,
} from '@solana/web3.js';


import {
  OreInstruction,
  loadProgramId,
  loadInitKeyPair,
} from './common/Common';




async function process_initialize() {
  //获取合约公钥
  let programId = await loadProgramId();
  //获取初始化用户密钥对(最高权限的那个账户)
  let userKeypair = await loadInitKeyPair();
  let userPublicKey: PublicKey = userKeypair.publicKey;
  //网络
  let connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  //空投
  // await airdrop(userPublicKey,connection);
  //data
  const data = Buffer.alloc(1);
  //bumps
  let bumps = new Array(1);
  //account
  let keys = new Array(14);
  //
  let signer = [];
  //操作
  let func = OreInstruction.Resetexport;


  // 填充keys
  for (let i = 0; i < keys.length; i++) {
    //
    //signer account
    if (i==0){
      keys[i]={pubkey: userKeypair.publicKey, isSigner: true, isWritable: true}
      bumps[i] =  func.value;
      signer.push(userKeypair)
    }

    //bus0~7 account pda
    if (i>=1&&i<=8){
      const seeds = Buffer.from([98, 117, 115, i-1])
      const [pda, bump] = await PublicKey.findProgramAddress([seeds], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      console.log(pda.toBase58(),bump,"pda bus"+(i-1))
    }

    //config account pda
    if (i==9){
      let config_seed = Buffer.from("config")
      const [pda, bump] = await PublicKey.findProgramAddress([config_seed], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      console.log(pda.toBase58(),bump,"pda config")
    }


    //mint account pda
    if (i==10){
      let mint_seed = Buffer.from("mint")
      // const mint_seed = Buffer.from([109, 105, 110, 116]);
      const noise = Buffer.from([89, 157, 88, 232, 243, 249, 197, 132, 199, 49, 19, 234, 91, 94, 150, 41].slice());
      const [pda, bump] = await PublicKey.findProgramAddress([mint_seed, noise], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      console.log(pda.toBase58(),bump,"pda mint")
    }

    //treasury account pda
    if (i==11){
      let treasury_seed = Buffer.from("treasury")
      const [pda, bump] = await PublicKey.findProgramAddress([treasury_seed], programId);
      keys[i] = {pubkey: pda, isSigner: false, isWritable: true}
      console.log(pda.toBase58(),bump,"pda treasury")
    }
    // treasury_tokens, 通过TREASURY_TOKENS_ADDRESS复杂的方式算出来的
    if (i==12){
      keys[i]={pubkey: new PublicKey("DnFwu1LKF7WqnKvrYAVKLoqQ8M1Asz2BN8CRqbYXKATF"), isSigner: false, isWritable: true}
      console.log(keys[i].pubkey.toBase58(),"TREASURY_TOKENS_ADDRESS")
    }
    //token_program account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    if (i==13){
      keys[i]={pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: true}
      console.log(keys[i].pubkey.toBase58(),"TREASURY_TOKENS_ADDRESS")
    }

  }

  // 使用 bumps 填充剩余的缓冲区
  for (let i = 0; i < bumps.length; i++) {
    data.writeUInt8(bumps[i], i); // 将 bump 值写入缓冲区
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


