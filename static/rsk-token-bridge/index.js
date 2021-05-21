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
  axios
    .get(url)
    .then((response) => {
      console.log(response);
      const outputObject =
        (response.data && response.data && response.data.options) ||
        response;
      const outputStr = JSON.stringify(outputObject, undefined, 2);
      outputArea.innerHTML = `<h2>Result</h2><br><pre>${JSON.stringify(response.data.options, undefined, 2)}</pre>`;
    })
    .catch((error) => {
      console.error(error);
      outputArea.innerHTML = `<h2>Error</h2><br><pre>${error.toString()}</pre>`;
    });
}
