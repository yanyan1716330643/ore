- 1.ore-keypair.json 每次都是同一个，这样区块链更新比较友好，除非不管旧数据(Program Id AimGt9NrjL4J4ZEYbn1iR2rcissqYLghRCxFsx4WXgVC)
- 2.ore.so 真实需要发布区块链上的so
- 3.devnet_01.json就是这个signer开发环境solana区块链上的钱包密钥数据

# 合约发布
```
solana program deploy ore.so --upgrade-authority Dbfxv94A9LPpsqdqa1gGkTkWUG4vJ5upbDesKQF9UvbJ  --keypair ./devnet_01.json
```