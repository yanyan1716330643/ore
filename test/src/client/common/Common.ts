// 定义枚举
import {Connection, Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
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