import { MongoClient } from 'mongodb'
import apollo from 'apollo-server'
import { resolvers, typeDefs } from './graphql/schema.mjs'

const { ApolloServer } = apollo

import {Schedules} from './graphql/types/schedule.mjs'
import {Events} from './graphql/types/event.mjs'
import { Programs } from './graphql/types/program.mjs'

// TODO: Make safe
const MONGO_USERNAME = "root"
const MONGO_PASSWORD = "example"
const MONGO_PORT = 27017
const MONGO_DB = "MYDB"
const MONGO_HOST = "localhost"
// const MONGO_HOST = "db"

const dbString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
const client = new MongoClient(dbString)
client.connect()

const server = new ApolloServer({
  resolvers: resolvers,
  typeDefs: typeDefs,
  csrfPrevention: true,
  dataSources: () => ({
    events: new Events(client.db().collection('events')),
    schedules: new Schedules(client.db().collection('schedules')),
    programs: new Programs(client.db().collection('programs'))
  })
});

// Launch server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
