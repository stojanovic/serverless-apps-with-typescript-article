# Serverless apps with TypeScript

...

## Project and TypeScript setup

We based our TypeScript at [Vacation Tracker](https://vacationtracker.io?utm_source=serverlesspub) on the setup used for the awesome [AWS Serverless Airline Booking](https://github.com/aws-samples/aws-serverless-airline-booking/tree/develop/src/backend/loyalty) by my friend [Heitor Lessa](https://twitter.com/heitor_lessa).

To start with the project, let's create a new folder and name it `serverless-library`. Then open your terminal and navigate to the folder we just created.

The next step is to initiate a new node project by running the `npm init -y` command, and install the dependencies. Beside TypeScript, we'll use Webpack and Webpack CLI for building the project and TSLint to check our syntax. All of these are dev dependencies. Let's run the following command to install the dependencies:

```bash
npm install typescript tslint webpack webpack-cli --save-dev
```

Now that we have the dependencies let's create a TypeScript config file in the project root and name it `tsconfig.json`. This file specifies the root files and the compiler options required to compile the project.

Your `tsconfig.json` file can look like the following code snippet:

```json
{
  "include": [
    "./src/**/*.ts"
  ],
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "strict": true,
    "baseUrl": "./",
    "typeRoots": [
      "node_modules/@types"
    ],
    "types": [
      "node"
    ],
    "esModuleInterop": true,
    "sourceMap": true,
    "resolveJsonModule": true
  }
}
```

We'll put the code for our Lambda functions in the `src` folder. To compile Lambda functions, we'll include all TypeScript files from that source folder by adding the `./src/**/*.ts` path to `includes` array. If you are not familiar with the `tsconfig.json` file or some of the rules we are using, see the documentation [here](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

After setting up the TypeScript config, let's set up the Webpack configuration. Create the `webpack.config.js` file in the project root.

At the beginning of the Webpack config, we need to require modules that we need for our Webpack build. These modules include `webpack`, and also `path` and `glob` that we'll use to define the paths to our source and build files. To include the modules, add the following to your `webpack.config.js` file:

```javascript
const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
```

Because our project will contain multiple Lambda functions, and each of them will have the entry file named `lambda.ts`, we need to create dynamically named outputs for wildcarded entry files. To do so, let's add the following to your `webpack.config.json` file:

```javascript
const entryArray = glob.sync('./src/**/lambda.ts')
const entryObject = entryArray.reduce((acc, item) => {
  const name = path.dirname(item.replace('./src/', ''))
  acc[name] = item
  return acc
}, {})
```

Entry object conforms with Webpack entry API, and it outputs something similar to the following code snippet:

```javascript
[
  { function1: 'function1/lambda.ts' },
  { function2: 'function2/lambda.ts' }
]
```

Finally, we want to create and export the config object. This object defines the entry files, output files, and rules. But besides the standard setup, we want to enable source maps, so we can still have the meaningful stack traces in the CloudWatch console. You can add the following code snippet to the end of your `webpack.config.js` file:

```javascript
const config = {
  entry: entryObject,
  devtool: 'source-map',
  target: 'node',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: false,
    cacheWithContext: false
  },
  output: {
    filename: '[name]/lambda.js',
    path: path.resolve(__dirname, 'build'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    libraryTarget: 'commonjs2'
  }
}

module.exports = config
```

The output generates `lambda.js` file and source map for each function in the build folder, with the following format `build/<function-name>/lambda.js`.

As the last part of the setup, we'll add the TSLint config file. While this setup does not require linter, it helps us to maintain a readable and well-formatted code of our project.

TSLint configuration depends on your personal preferences. We'll create the `tslint.json` file with the following configuration:

```json
{
    "defaultSeverity": "error",
    "extends": [ "tslint:recommended" ],
    "jsRules": {},
    "rules": {
        "quotemark": [ true, "single", "avoid-escape", "avoid-template" ],
        "semicolon": [ true, "never" ],
        "no-console": false,
        "interface-name": false,
        "max-line-length": [ true, 180 ],
        "object-literal-sort-keys": false,
        "ban-types": false,
        "one-variable-per-declaration": false,
        "max-classes-per-file": false,
        "trailing-comma": [
            true,
            {
                "multiline": {
                    "objects": "always",
                    "arrays": "always",
                    "functions": "never",
                    "typeLiterals": "ignore"
                },
                "esSpecCompliant": true
            }
        ]
    },
    "rulesDirectory": []
}
```

If you have a personal preference for TSLint, feel free to use it.

Now that we have the project setup, we'll need the first function to be able to test it. In the next section, we'll create the `ListBooks` Lambda function code, and when we finish, our code structure should look similar to the following one:

```bash
.
├── package.json
├── src
│   └── list-books
│       └── lambda.ts
├── build
│   └── list-books
|       ├── lambda.js
│       └── lambda.js.map
├── tsconfig.json
├── tslint.json
└── webpack.config.js
```

## Writing a Lambda function

...

## Deploy AWS Lambda and Amazon API Gateway using AWS CDK

...

### CDK setup

...

### Bootstrap

...

### Deploy

...

## Add DynamoDB and update Lambda functions

...

### Ports and Adapters

...

### Database adapter

...

### Deploy DynamoDB using CDK

...

## Test locally

...

## **Automated tests**

...

### Unit tests

...

### Integration tests

...

### End-to-end tests

...

## Summary

...