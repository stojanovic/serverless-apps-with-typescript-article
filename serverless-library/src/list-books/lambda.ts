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
