# Serverless apps with TypeScript

...

## Project and TypeScript setup

We based our TypeScript at [Vacation Tracker](https://vacationtracker.io?utm_source=serverlesspub) on the setup used for the awesome [AWS Serverless Airline Booking](https://github.com/aws-samples/aws-serverless-airline-booking/tree/develop/src/backend/loyalty) by my friend [Heitor Lessa](https://twitter.com/heitor_lessa).

To start with the project, let's create a new folder and name it `serverless-library`. Then open your terminal and navigate to the folder we just created.

The next step is to initiate a new node project by running the `npm init -y` command, and install the dependencies. Beside TypeScript, we'll use Webpack and Webpack CLI for building the project, TypeScript loader for Webpack, and TSLint to check our syntax. All of these are dev dependencies. Let's run the following command to install the dependencies:

```bash
npm install typescript tslint webpack webpack-cli ts-loader --save-dev
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

An API Gateway event will trigger our first Lambda function. To add types, we'll need to install the `aws-lambda` module and its types, `@types/aws-lambda`, from the npm.  We'll also need type definitions for node.js. To install required dependencies, navigate to the project folder in your terminal, and run the following command:

```bash
npm i aws-lambda @types/aws-lambda @types/node --save
```

After we installed the dependencies, we can create our first function. Create the `src` folder in your project root, and `list-books` folder inside it. Finally, create an empty `lambda.ts` file in the `src/list-books` folder.

Our `lambda.ts` file represents a Lambda function. It should export a function called `handler` that accepts an API Gateway proxy event and returns a simple API response in a format required by the Amazon API Gateway.

At the top of the `lambda.ts` file, we should import `APIGatewayProxyEvent` from `aws-lambda` module that we installed. We can do that by adding the following line:

```typescript
import { APIGatewayProxyEvent } from 'aws-lambda'
```

Then, we can create our handler function that returns an HTTP status 200 with 'OK' text. To do so, we'll add the following function to our `lambda.ts` file:

```typescript
export function handler(event: APIGatewayProxyEvent) {
  console.log('EVENT', JSON.stringify(event))
  return {
    statusCode: 200,
    body: 'OK',
    headers: {
      'Content-Type': 'text/plain'
    },
    isBase64Encoded: false
  }
}
```

At the top of our handler function, we stringify the event, because it's an object, and log it. This log helps us to test our function locally, but we'll talk about that a bit later.

To return a valid response to the Amazon API Gateway, we return an object containing status code, body, headers, and tell API Gateway if the response is base64 encoded.

As you can see, generating an API Gateway response is the most significant part of our function, and we'll need to do something similar with all the functions we create. However, we want to focus on more exciting things, so we'll install use a small library, called API Gateway HTTP response, to generate these API Gateway responses. To do so, run the following command from your terminal:

```bash
npm i @vacationtracker/api-gateway-http-response --save
```

Then, we'll import the library at the top of our `lambda.ts` file by adding the following line:

```typescript
import httpResponse from '@vacationtracker/api-gateway-http-response'
```

And we'll replace an object we are returning with the following line:

```typescript
return httpResponse('OK')
```

That makes our code more readable. And the last thing we want to do is to return a static list of the books. For example, we can use the following array of serverless books:

```json
[
    {
      "isbn": "978-1617294723",
      "name": "Serverless Applications with Node.js: Using AWS Lambda and Claudia.js",
      "link": "https://www.amazon.com/Serverless-Applications-Node-js-Lambda-Claudia-js/dp/1617294721",
      "authors": [
        "Aleksandar Simović",
        "Slobodan Stojanović"
      ],
      "publishDate": "2019-02-18",
      "publisher": "Manning Publications"
    },
    {
      "isbn": "978-0993088155",
      "name": "Running Serverless: Introduction to AWS Lambda and the Serverless Application Model",
      "link": "https://www.amazon.com/Running-Serverless-Introduction-Lambda-Application/dp/0993088155",
      "authors": [
        "Gojko Adzic"
      ],
      "publishDate": "2019-07-01",
      "publisher": "Neuri Consulting Llp"
    }
  ]
```

To make things simple, we can add this list directly in the code. Create the `books` array with this array of books, then return it by changing `return httpResponse('OK')` to `return httpResponse(books)`.

At the end, our `lambda.ts` file should look similar to the following code snippet:

```typescript
import httpResponse from '@vacationtracker/api-gateway-http-response'
import { APIGatewayProxyEvent } from 'aws-lambda'

export function handler(event: APIGatewayProxyEvent) {
  console.log('EVENT', JSON.stringify(event))
  const books = [
    {
      isbn: '978-1617294723',
      name: 'Serverless Applications with Node.js: Using AWS Lambda and Claudia.js',
      link: 'https://www.amazon.com/Serverless-Applications-Node-js-Lambda-Claudia-js/dp/1617294721',
      authors: [
        'Aleksandar Simović',
        'Slobodan Stojanović',
      ],
      publishDate: '2019-02-18',
      publisher: 'Manning Publications',
    },
    {
      isbn: '978-0993088155',
      name: 'Running Serverless: Introduction to AWS Lambda and the Serverless Application Model',
      link: 'https://www.amazon.com/Running-Serverless-Introduction-Lambda-Application/dp/0993088155',
      authors: [
        'Gojko Adzic',
      ],
      publishDate: '2019-07-01',
      publisher: 'Neuri Consulting Llp',
    },
  ]
  return httpResponse(books)
}
```

To build the project in production mode, add the following line to the scripts section of our `package.json` file:

```json
"build": "NODE_ENV=prod webpack --mode=production --progress"
```

This command builds our TypeScript files and shows the progress in percentage in the terminal.

We can also add another line that watches for file changes and build the project in the development mode. That's useful during development, especially in combination with running a function locally. To do so, add the following line to the scripts section of our `package.json` file:

```json
"watch": "NODE_ENV=dev webpack --watch --mode=development"
```

To confirm that everything worked, run the `npm run build` from the project folder in the terminal. This command should output something similar to the following:

```bash
Hash: 1ed67eacf832d1627963
Version: webpack 4.41.2
Time: 1271ms
Built at: 2019-11-03 17:56:54
                   Asset      Size  Chunks                   Chunk Names
    list-books/lambda.js  5.79 KiB       0  [emitted]        list-books
list-books/lambda.js.map   6.2 KiB       0  [emitted] [dev]  list-books
Entrypoint list-books = list-books/lambda.js list-books/lambda.js.map
[0] ./src/list-books/lambda.ts 1.36 KiB {0} [built]
    + 1 hidden module
```

And you should see the `build` folder with the `list-books` folder inside it. The `list-books` folder should contain `lambda.js` and `lambda.js.map` files.

But to test if our Lambda function works as it should, we need to deploy it.

## Deploy AWS Lambda and Amazon API Gateway using AWS CDK

There are many ways to deploy a Lambda function.

You can create a zip archive of your code and upload it directly to the [AWS Web Console](http://console.aws.amazon.com/), as we all did in the early days of serverless. But then you need to set permissions and an API Gateway trigger manually. Using the AWS Web Console feels like a cave art compared to the new state-of-the-art tools.

You can, of course, automate your deployment using AWS CLI or AWS API. However, it's much better if you use one of the popular deployment frameworks and libraries as they automated and tested that process a long time ago. There are many great deployment frameworks and libraries today, such as [Serverless Framework](https://serverless.com), [Claudia.js](https://claudiajs.com), and [Architect](https://arc.codes).

AWS step up their deployment game at some point. In most cases, [AWS CloudFormation](https://aws.amazon.com/cloudformation/) has everything you need to deploy a modern serverless application. But, soon after adding a few dozen of resources, your CloudFormation template starts looking as beautiful as an average [Brutalist_architecture](https://en.wikipedia.org/wiki/Brutalist_architecture).

Fortunately, you can use various tools built on top of AWS CloudFormation, such as the [AWS Serverless Application Model (AWS SAM)](https://aws.amazon.com/serverless/sam/), an open-source framework for building serverless applications. AWS SAM makes your CloudFormation YAML more human-friendly, and its CLI tool brings excellent tooling around it, including SAM local, for local testing, but it has its quirks.

But as we are using TypeScript, probably the most exciting tool is a new kid in town - the [AWS Cloud Development Kit (AWS CDK)](https://aws.amazon.com/cdk/).

### The AWS Cloud Development Kit (AWS CDK)

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