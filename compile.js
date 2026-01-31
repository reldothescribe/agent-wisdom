const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileContract() {
    console.log('Compiling AgentWisdomOracle...');

    const contractPath = path.join(__dirname, 'WisdomOracle.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'WisdomOracle.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach(err => {
            if (err.severity === 'error') {
                console.error('Error:', err.formattedMessage);
                throw new Error('Compilation failed');
            } else {
                console.warn('Warning:', err.formattedMessage);
            }
        });
    }

    const contracts = output.contracts['WisdomOracle.sol'];
    const contractName = Object.keys(contracts)[0];
    const contract = contracts[contractName];

    // Save ABI
    fs.writeFileSync('./WisdomOracle.abi.json', JSON.stringify(contract.abi, null, 2));
    console.log('✓ ABI saved to WisdomOracle.abi.json');

    // Save bytecode
    const bytecode = contract.evm.bytecode.object;
    fs.writeFileSync('./WisdomOracle bytecode.txt', bytecode);
    console.log('✓ Bytecode saved to WisdomOracle bytecode.txt');

    console.log('\n✅ Compilation successful!');
    return { bytecode: '0x' + bytecode, abi: contract.abi };
}

if (require.main === module) {
    try {
        compileContract();
    } catch (error) {
        console.error('Compilation failed:', error.message);
        process.exit(1);
    }
}

module.exports = { compileContract };
