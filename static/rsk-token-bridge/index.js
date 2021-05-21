document.addEventListener('DOMContentLoaded', onDomLoad);

function onDomLoad() {
  const checkButton = document.querySelector('#check');
  checkButton.addEventListener('click', onCheckButtonClicked);
}

function onCheckButtonClicked() {
  const txHash = document.querySelector('#txHash').value;
  const fromNetwork = document.querySelector('#fromNetwork').value;
  const walletName = document.querySelector('#walletName').value;
  const outputArea = document.querySelector('.output-area');
  const url = `/api/v1/rsk-token-bridge/options?fromNetwork=${fromNetwork}&txHash=${txHash}&walletName=${walletName}`;
  const reqOptions = {
    url,
    method: 'get',
    headers: {
      'Accept': 'text/html',
    },
    timeout: 2000,
    responseType: 'html',
  };
  axios
    .request(reqOptions)
    .then((response) => {
      console.log(response);
      const outputHtml = response.data || response;
      outputArea.innerHTML = `<h2>Result</h2><br>${outputHtml}`;
    })
    .catch((error) => {
      console.error(error);
      outputArea.innerHTML = `<h2>Error</h2><br><pre>${error.toString()}</pre>`;
    });
}
