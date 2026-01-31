const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Base network configuration
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
    if (!PRIVATE_KEY) {
        console.error('PRIVATE_KEY not set in environment');
        process.exit(1);
    }

    console.log('Connecting to Base...');
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('Deployer address:', wallet.address);

    // Get balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
        console.error('Insufficient balance to deploy');
        process.exit(1);
    }

    console.log('\nCompiling contract...');
    const bytecode = '0x' + fs.readFileSync('./WisdomOracle bytecode.txt', 'utf8').trim();
    const abi = JSON.parse(fs.readFileSync('./WisdomOracle.abi.json', 'utf8'));

    console.log('Deploying AgentWisdomOracle...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for confirmation...');

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log('\n✅ Contract deployed successfully!');
    console.log('Contract address:', address);

    // Save deployment info
    const deploymentInfo = {
        address: address,
        txHash: contract.deploymentTransaction().hash,
        deployer: wallet.address,
        network: 'base',
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\nDeployment info saved to deployment.json');
}

main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
});
