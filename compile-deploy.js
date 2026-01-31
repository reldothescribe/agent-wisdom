const { ethers } = require('ethers');
const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

// Base network configuration
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function compile() {
    console.log('Compiling contract with solc...');

    try {
        // Try to use solc if available
        const output = execSync('solc --bin --abi WisdomOracle.sol', {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        const lines = output.split('\n');
        let bytecode = '';
        let abi = '';

        let inBin = false;
        let inAbi = false;

        for (const line of lines) {
            if (line.includes('Binary:')) {
                inBin = true;
                continue;
            }
            if (line.includes('Contract JSON ABI')) {
                inBin = false;
                inAbi = true;
                continue;
            }
            if (line.startsWith('=======') && inBin) {
                inBin = false;
                continue;
            }

            if (inBin) {
                bytecode += line.trim();
            }
            if (inAbi) {
                abi += line;
            }
        }

        // Remove trailing commas from ABI
        abi = abi.replace(/,(\s*[}\]])/g, '$1');
        // Wrap in brackets if needed
        if (!abi.startsWith('[')) {
            abi = '[' + abi + ']';
        }

        if (!bytecode.startsWith('0x')) {
            bytecode = '0x' + bytecode;
        }

        // Save ABI
        const abiJson = JSON.parse(abi);
        fs.writeFileSync('./WisdomOracle.abi.json', JSON.stringify(abiJson, null, 2));
        console.log('✓ ABI saved to WisdomOracle.abi.json');

        // Save bytecode
        fs.writeFileSync('./WisdomOracle bytecode.txt', bytecode);
        console.log('✓ Bytecode saved to WisdomOracle bytecode.txt');

        return { bytecode, abi: abiJson };
    } catch (error) {
        console.error('Compilation failed:', error.message);

        // Fallback: try to find solcjs
        console.log('\nTrying solcjs...');
        try {
            execSync('npx solc-js --version', { stdio: 'pipe' });
            console.log('solc-js is available. Please use it to compile.');
        } catch {
            console.log('solc not found. Installing solc...');
            try {
                execSync('npm install -g solc', { stdio: 'pipe' });
                console.log('solc installed. Please run this script again.');
            } catch (e) {
                console.error('Could not install solc. Please install manually:');
                console.error('  brew install solidity (macOS)');
                console.error('  npm install -g solc (any platform)');
            }
        }
        process.exit(1);
    }
}

async function deploy(bytecode, abi) {
    if (!PRIVATE_KEY) {
        console.error('\nPRIVATE_KEY not set in environment');
        console.error('Create a .env file with: PRIVATE_KEY=your_key_here');
        process.exit(1);
    }

    console.log('\nConnecting to Base...');
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('Deployer address:', wallet.address);

    // Get balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
        console.error('\nInsufficient balance to deploy');
        process.exit(1);
    }

    console.log('\nDeploying AgentWisdomOracle...');
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

    return address;
}

async function main() {
    try {
        const { bytecode, abi } = await compile();
        const address = await deploy(bytecode, abi);

        console.log('\n🎉 All done! The Agent Wisdom Oracle is live on Base!');
        console.log('\nNext steps:');
        console.log('1. Add some wisdom via ethers.js or a web interface');
        console.log('2. Explore the contract on BaseScan:', `https://basescan.org/address/${address}`);

    } catch (error) {
        console.error('\n❌ Failed:', error);
        process.exit(1);
    }
}

main();
