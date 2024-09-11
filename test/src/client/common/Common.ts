const { getAccount, TOKEN_PROGRAM_ID,getAssociatedTokenAddress,createAssociatedTokenAccountInstruction} = require('@solana/spl-token');
// 定义枚举
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction
} from "@solana/web3.js";
// @ts-ignore
import fs from "mz/fs";
// @ts-ignore
import path from "path";

export const OreInstruction = {
    Claim: { name: 'Claim', value: 0 },
    Close: { name: 'Close', value: 1 },
    Mineexport: { name: 'Mineexport', value: 2 },
    Openexport: { name: 'Mineexport', value: 3 },
    Resetexport: { name: 'Resetexport', value: 4 },
    Update: { name: 'Update', value: 5 },
    Upgrade: { name: 'Upgrade', value: 6 },
    Initialize: { name: 'Initialize', value: 100 },
};


export const FTPublicKey = {
    Yanyan01: { name: '严研01 挖矿号',value: "DWGbimNkfY6Lws5wyr9xvCMJqDvpmGMGsbb5KS4QhgDY",json:"[81,226,125,10,211,43,100,210,169,207,185,247,196,18,97,4,168,184,184,14,220,177,152,27,199,243,221,66,203,238,252,129,185,203,185,87,234,194,49,196,62,184,1,215,66,87,141,190,9,178,44,1,85,30,213,81,128,179,184,190,210,167,128,35]" },
    Longqing01: { name: '赵龙青01', value: "6ZRaHZDvujdXedXB7EoTpa3eJs6xmtwXnAfrAe3jfD6k" },
};

export async function getRecentBlockhash( connection:Connection) {
    const { blockhash } = await connection.getLatestBlockhash();
    return blockhash;
}

export async function loadProgramId() {
    const secretKeyString = await fs.readFile(path.join(path.resolve(__dirname, '../../../../deploy'), 'ore-keypair.json'), {encoding: 'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const programKeypair = Keypair.fromSecretKey(secretKey);
    return programKeypair.publicKey;
}

export async function loadInitKeyPair() {
    const userKeyString = await fs.readFile(path.join(path.resolve(__dirname, '../../../../deploy'), 'devnet_01.json'), {encoding: 'utf8'});
    const userSecretKey = Uint8Array.from(JSON.parse(userKeyString));
    return Keypair.fromSecretKey(userSecretKey);
}

export async function airdrop(userPublicKey:PublicKey,connection:Connection) {
    let sol_balance = await connection.getBalance(userPublicKey).then(r => {return r;})
    if (sol_balance<5*1000000000){
        console.log("sol_balance<5*1000000000")
    }else {
        console.log("sol_balance>=5*1000000000")
    }
    let airdropErr = null;
    try {
        //1 SOL = 10^9 Lamports
        const airdropRequest = await connection.requestAirdrop(userPublicKey, LAMPORTS_PER_SOL);
        //该方法已废弃，后面需要替换最新的方法实现
        await connection.confirmTransaction(airdropRequest)
    }catch (e){
        airdropErr = e;
    }
    if (airdropErr){
        console.error("=======","airdrop err",airdropErr.toString());
    }else {
        console.log("=======","airdrop for userPublicKey success");
    }
}



export async function getMintBalance(connection: Connection, publicKey: PublicKey,mintPublicKey: PublicKey) {
    try {
        return await connection.getParsedTokenAccountsByOwner(publicKey,
            // filter => mint: PublicKey|programId: PublicKey;
            {
                // mint:new PublicKey("4gYoPEcS8KCRWhfovkaQ9CpPVR8hBqN3oJQn3BMxem9r")
                mint:mintPublicKey
            }).then(data=>{
            //console.log(JSON.stringify(data, null, 2))
            // const a_mint_base64 = "4gYoPEcS8KCRWhfovkaQ9CpPVR8hBqN3oJQn3BMxem9r";
            let a_spl_balance = undefined;
            data.value.forEach(parsedTokenAccount => {
                // if (a_mint_base64 === parsedTokenAccount.account.data.parsed.info.mint) {
                    a_spl_balance = parsedTokenAccount.account.data.parsed.info.tokenAmount.amount
                // }
            })

            return a_spl_balance
        })

    } catch (error) {
        console.error('查询SPL Token余额失败:', error);
        return null;
    }
}


export async function getTokenAccount(connection:Connection, tokenMintAddress :PublicKey, payer:Keypair, ownerPublicKey:PublicKey) {
    // const ownerAddress = payer.publicKey
    // const payerPublickKey = payer.publicKey
    // 计算关联的 Token 账户地址
    const associatedTokenAddress = await getAssociatedTokenAddress(tokenMintAddress, ownerPublicKey);
    // 获取账户信息
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress);

    // 如果账户不存在，则创建它
    if (!accountInfo) {
        console.log(`Creating associated token account ${associatedTokenAddress}`);

        // 创建关联 Token 账户的指令
        const createATACIx = createAssociatedTokenAccountInstruction(
            payer, // payer
            ownerPublicKey, // user's wallet address
            ownerPublicKey, // owner of the token account
            tokenMintAddress // token mint address
        );

        // 构建交易
        const transaction = new Transaction().add(createATACIx);

        // 发送交易
        const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
        console.log(`Transaction signature: ${signature}`);
    } else {
        console.log(`Associated token account already exists: ${associatedTokenAddress}`);
    }
    return [associatedTokenAddress,accountInfo];


}