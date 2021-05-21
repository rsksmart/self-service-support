const axios = require('axios');

const infuraProjectId = process.env.INFURA_PROJECT_ID || '';

const rpcUrls = {
  'rsk-mainnet': 'https://public-node.rsk.co/',
  'rsk-testnet': 'https://public-node.testnet.rsk.co/',
  'ethereum-mainnet': `https://mainnet.infura.io/v3/${infuraProjectId}`,
  'ethereum-kovan': `https://kovan.infura.io/v3/${infuraProjectId}`,
};

async function calcTxInfo(network, txHash) {
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

  const tx =
    getTransactionByHashResponse.data && getTransactionByHashResponse.data.result;
  if (!tx) {
    throw new Error(`Transaction does not exist or hash is invalid: ${txHash}`);
  }

  const txBlockNumber = convertHexStringToNumber(
    tx.blockNumber);
  const latestBlockNumber = convertHexStringToNumber(
    blockNumberResponse.data.result);

  // calculate age of transaction in number of blocks
  const txAge = (latestBlockNumber - txBlockNumber);

  return {
    tx,
    meta: {
      txAge,
    },
  };
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

module.exports = calcTxInfo;
