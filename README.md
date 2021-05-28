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
npm install --global pm2

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
npm run start

```

For a "plain" run of the server:

```shell
npm run start

```

For a production deployment of the server:

```shell
npm run prod

```

> Note: Use `npm run` to see all the run scripts.


## Author

[Brendan Graetz](http://bguiz.com/)

## Licence

GPL-3.0
