const axios = require('axios');

const rpcUrls = {
  'rsk-mainnet': 'https://public-node.rsk.co/',
  'rsk-testnet': 'https://public-node.testnet.rsk.co/',
};

async function calcTxAge(network, txHash) {
  // get latest block number
  const getTransactionByHashRpc = jsonRpcRequest(
    network,
    'eth_getTransactionByHash',
    [txHash],
  );

  // get block number for the supplied tx hash
  const blockNumberRpc = jsonRpcRequest(
    network,
    'eth_blockNumber',
    [],
  );

  const [getTransactionByHashResponse, blockNumberResponse] =
    await Promise.all([getTransactionByHashRpc, blockNumberRpc]);

  if (!getTransactionByHashResponse.data.result) {
    throw new Error(`Transaction does not exist or hash is invalid: ${txHash}`);
  }

  const txBlockNumber = convertHexStringToNumber(
    getTransactionByHashResponse.data.result.blockNumber);
  const latestBlockNumber = convertHexStringToNumber(
    blockNumberResponse.data.result);

  // return the difference
  return latestBlockNumber - txBlockNumber;
}

function jsonRpcRequest(network, method, params) {
  const url = rpcUrls[network];
  const reqParams = {
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    },
    timeout: 1000,
    responseType: 'json',
    validateStatus: function (status) {
      return true; // override default, don't reject based on status code
    },
  }
  return axios.request(reqParams);
}

function convertHexStringToNumber(x) {
  return parseInt(Number(x), 10);
}

module.exports = calcTxAge;
