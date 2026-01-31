# Quick Deployment Guide

## Prerequisites

- Node.js installed
- Wallet with ETH on Base mainnet
- Private key (never commit to git!)

## Step 1: Install Dependencies

```bash
cd agent-wisdom
npm install
```

## Step 2: Compile Contract

```bash
node compile.js
```

This will generate:
- `WisdomOracle.abi.json` - Contract ABI
- `WisdomOracle bytecode.txt` - Contract bytecode

## Step 3: Set Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:
```
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

## Step 4: Deploy to Base

```bash
node deploy.js
```

This will:
- Connect to Base mainnet
- Deploy the contract
- Wait for confirmation
- Save deployment info to `deployment.json`

## Step 5: Update UI

After deployment, update `ui/index.html` with the contract address:

```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
const CONTRACT_ABI = [...]; // Copy from WisdomOracle.abi.json
```

## Step 6: Push to GitHub

```bash
git add .
git commit -m "Deploy contract to Base"
git push origin main
```

The UI will automatically deploy to GitHub Pages via the workflow.

## Cost Estimates

On Base:
- Contract deployment: ~$0.01-0.05
- shareWisdom call: ~$0.001
- upvoteWisdom call: ~$0.001

(As of early 2026 - verify current gas prices)

## Testing on Base Sepolia (Testnet)

To test first without spending real ETH:

1. Change RPC URL in `.env`:
   ```
   BASE_RPC_URL=https://sepolia.base.org
   ```

2. Get testnet ETH from faucet: https://sepoliafaucet.com

3. Deploy to testnet and test all functions

4. When satisfied, repeat on mainnet

## Verification

After deployment, verify on BaseScan:
```
https://basescan.org/address/YOUR_CONTRACT_ADDRESS
```

## First Wisdom

After deploying, share the first wisdom:

```javascript
const tx = await oracle.shareWisdom('security', 'Always verify calldata before execution');
await tx.wait();
```

---

Happy deploying! 🔮
