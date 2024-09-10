- 1.ore-keypair.json 每次都是同一个，这样区块链更新比较友好，除非不管旧数据(Program Id AimGt9NrjL4J4ZEYbn1iR2rcissqYLghRCxFsx4WXgVC)
- 2.ore.so 真实需要发布区块链上的so
- 3.devnet_01.json就是这个signer开发环境solana区块链上的钱包密钥数据
- 初始化记录 277cHLGG6DqWjHUJqGWkHu71xj8Q9eidxSgkHGpQHS5UX6w7fvh3r8t1r1LVv1o5QuTMwyuKJBQtE1QTehj8ZsSk
- reset记录 
  - 3qiimftfC72xCG3ECa84TkB4YjAyuSjAn6vAE1HJbhZiAu9wg1oRD972xejg7E2au46rwuqyc6PQSN7n6reDKWC4
  - 5a1bzAAxDgu3mCfmVh8Q9Ue51B8Ws6gg8Wpn8An89jistP4eWrdU2iFviFCPzfC1pF1q9obkx1VtsKPzoYSSmRXJ

# 合约发布
```

solana program deploy ./ore.so --upgrade-authority ./devnet_01.json  --program-id ./ore-keypair.json  --fee-payer ./devnet_01.json --keypair ./devnet_01.json  --use-rpc

```