import { ApolloServer, gql } from 'apollo-server-cloud-functions'
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as serviceAccount from './service-account.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any)
})

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Test {
    name: String!
    content: String!
  }

  type Query {
    tests: [Test]
  }
`

interface Test {
  name: string
  content: string
}

const resolvers = {
  Query: {
    tests: async () => {
      const tests = await admin
        .firestore()
        .collection('tests')
        .get()
      return tests.docs.map(works => works.data()) as Test[]
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({
    headers: req.headers,
    req,
    res
  })
})

export const apollo = functions.https.onRequest(server.createHandler(
////必要であればcorsもオフにできる
//{
//  cors: {
//    origin: false
//  },
//}
))
