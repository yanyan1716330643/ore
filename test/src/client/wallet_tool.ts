import {
    Keypair,
    Connection,
    PublicKey,
    TransactionInstruction,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    type Signer,
    type Commitment, type ConfirmOptions,
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
     getMintBalance, getTokenAccount
} from './common/Common';
import {createTransferInstruction, getOrCreateAssociatedTokenAccount} from "@solana/spl-token";



async function tool_transfer() {
    //网络
    let connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    //获取我的钱包
    const userIdJsonString = await fs.readFile(path.join(path.resolve(__dirname, '../../../deploy'), 'devnet_03.json'), {encoding: 'utf8'});
    const userSecretKey = Uint8Array.from(JSON.parse(userIdJsonString));
    const userKeypair = Keypair.fromSecretKey(userSecretKey);
    //通过公钥查询我的钱包sol和spl余额
    let sol_lamport = await connection.getBalance(userKeypair.publicKey).then(r => {
        return r;
    })
    let mintPublicKey = new PublicKey("4gYoPEcS8KCRWhfovkaQ9CpPVR8hBqN3oJQn3BMxem9r")
    let spl_lamport = await getMintBalance(connection, userKeypair.publicKey, mintPublicKey)
    console.log("=======",userKeypair.publicKey.toBase58(), '当前sol:', sol_lamport, '当前spl:', spl_lamport);
    //转账sol/spl到指定公钥
    const userIdJsonString2 = await fs.readFile(path.join(path.resolve(__dirname, '../../../deploy'), 'devnet_01.json'), {encoding: 'utf8'});
    const userSecretKey2 = Uint8Array.from(JSON.parse(userIdJsonString2));
    const userKeypair2 = Keypair.fromSecretKey(userSecretKey2);
    //创建sol转账交易
    const transactionSol = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: userKeypair.publicKey,
            toPubkey: userKeypair2.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL, // 转账 0.1 SOL
        })
    );

    // 签名并发送sol交易
    const signatureSol = await sendAndConfirmTransaction(
        connection,
        transactionSol,
        [userKeypair]
    );

    console.log("=======", 'sol 转账成功，交易签名:', signatureSol);

    // 获取或创建发送者和接收者的关联 spl Token 帐户
    let [userATA,userAccount] = await getTokenAccount(
        connection,
        mintPublicKey,
        userKeypair,//payer
        userKeypair.publicKey
    )
    let [toATA,toAccount] = await getTokenAccount(
        connection,
        mintPublicKey,
        userKeypair,//payer
        userKeypair2.publicKey
    )
    // 创建转账spl指令
    // let programId = await loadProgramId()
    let programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")//TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    // let programId = TOKEN_PROGRAM_ID;
    let amount = 0.001 * 10 ** 11
    const transferInstructionSpl = createTransferInstruction(
        userATA, // 来源 Token 帐户
        toATA,   // 目标 Token 帐户
        userKeypair.publicKey,     // 发送者的钱包
        amount,             // 转账数量 (注意代币精度, 这里假设精度为11)
        [userKeypair],
        programId          // SPL Token Program ID
    );

    // 创建并发送交易
    const transactionSpl = new Transaction().add(transferInstructionSpl);
    const signatureSpl = await sendAndConfirmTransaction(
        connection,
        transactionSpl,
        [userKeypair]
    );

    console.log('spl 转账成功，交易签名:', signatureSpl);

}


tool_transfer().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);


