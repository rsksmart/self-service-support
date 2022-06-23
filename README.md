# self-service-support

Provides APIs intended for use in self-service support tools or pages.

## Installation

Ensure that you have NodeJs v14:

```shell
node -v
# v14.17.0
```

Obtain a copy of this project and install its dependencies:

```shell
git clone	git@github.com:bguiz/self-service-support.git
cd self-service-support
npm install

```

Install global dependencies

```shell
npm install --global pm2 node-dev

```

Set up environment variables.

For development:

```shell
cp .sample.env .env
# edit .env to save with appropriate values for env vars

```

For production deployment:

```shell
less .sample.env
# set the env vars in the secret management utils used in deployment

```

## Run

You can start the server in 3 different ways.

For development (with hot-reload enabled, via `node-dev`):

```shell
npm run dev

```

For a "plain" run of the server:

```shell
npm run start

```

For a production deployment of the server:

```shell
npm run prod

```

ALternatively, use the `Dockerfile` provided.

> Note: Use `npm run` to see all the run scripts.

## APIs

### Health Check

Issue the following HTTP request:

```
GET /api/status

```

### RSK Token Bridge - Options

Issue the following HTTP request:

```
GET /api/v1/rsk-token-bridge/options?fromNetwork=ethereum-mainnet&txHash=0x3985fe2ad509a4588501494a715957506f401364112bd55090529686aa538962&walletName=metamask
Accept: application/json

```

Use a different `Accept` header of `text/html`
to get a HTML fragment instead of JSON:

```
GET /api/v1/rsk-token-bridge/options?fromNetwork=ethereum-mainnet&txHash=0x3985fe2ad509a4588501494a715957506f401364112bd55090529686aa538962&walletName=metamask
Accept: application/json

```

Query Parameters:

- `fromNetwork`: One of the following
  - `rsk-mainnet`
  - `rsk-testnet`
  - `ethereum-mainnet`
  - `ethereum-testnet`
- `txHash`: Any valid transaction hash for the selected network
- `walletName`: One of the following
  - `metamask`
  - `nifty`
  - `liquality`

### Query to work out if given addresses are users of various protocols

```
GET /api/v1/rsk-address-report/protocol-usage?address=0x8Be2E5Fe4348Ea38777a7c175Abb89050770E854&months=7
Accept: application/json

```
Query Parameters:

- `address`: RSK wallet address
- `months`: number of months back from now


## Author

[Brendan Graetz](http://bguiz.com/)

## Licence

GPL-3.0
