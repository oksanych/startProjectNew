# Start Project

### Installation

Install packages from package.json

```sh
$ npm i
```

Install new package

```sh
$ npm i -D package_name
```

For using local version of gulp export change path

```sh
$ PATH=./node_modules/.bin:../node_modules/.bin:../../node_modules/.bin:$PATH
```

### Building for source

For develop

```sh
$ gulp
```


For production

```sh
$ NODE_ENV=production gulp
```
