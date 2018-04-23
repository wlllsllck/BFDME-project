const fs = require('fs');
const web3 = require('./web3Client.js');
const code = fs.readFileSync('Upload.sol').toString();
const solc = require('solc');
const compiledCode = solc.compile(code);
const abiDefinition = JSON.parse(compiledCode.contracts[':Upload'].interface);
const UploadContract = web3.eth.contract(abiDefinition);
const byteCode = compiledCode.contracts[':Upload'].bytecode;
const deployedContract = UploadContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000});

module.exports = deployedContract;