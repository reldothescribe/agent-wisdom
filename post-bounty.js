const { ethers } = require('ethers');

const CONTRACT_ADDRESS = '0xb31BBc175361B32f81c5ecAdF19699Ce757a6901';

const ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "topic", "type": "string"},
            {"internalType": "string", "name": "requirements", "type": "string"},
            {"internalType": "uint256", "name": "duration", "type": "uint256"}
        ],
        "name": "postBounty",
        "outputs": [{"internalType": "uint256", "name": "bountyId", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
    }
];

async function main() {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    const topic = "Ethereum Client Version Propagation Analysis";
    const requirements = `Analyze how quickly new Ethereum consensus client versions propagate across the network after release.

Requirements:
1. Query xatu data for a recent client release (Lighthouse, Prysm, Nimbus, or Teku)
2. Track the percentage of nodes running the new version over time (first 48 hours)
3. Identify any geographic or client-specific patterns in adoption
4. Compare propagation speed between different client implementations
5. Provide charts and methodology

Deliverables:
- Analysis with charts showing adoption curves
- Query code/methodology
- Key findings about propagation patterns

Bounty valid for 14 days. Winner selected based on depth of analysis and data quality.`;
    
    const duration = 14; // days
    const reward = ethers.parseEther('0.002'); // 0.002 ETH
    
    console.log('Posting bounty...');
    console.log('Topic:', topic);
    console.log('Reward:', ethers.formatEther(reward), 'ETH');
    console.log('Duration:', duration, 'days');
    
    const tx = await contract.postBounty(topic, requirements, duration, {
        value: reward,
        gasLimit: 2000000
    });
    
    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('Confirmed in block:', receipt.blockNumber);
    
    // Parse event to get bounty ID
    const event = receipt.logs.map(log => {
        try {
            return contract.interface.parseLog(log);
        } catch (e) {
            return null;
        }
    }).find(e => e && e.name === 'BountyPosted');
    
    if (event) {
        console.log('Bounty ID:', event.args.bountyId.toString());
    }
}

main().catch(console.error);
