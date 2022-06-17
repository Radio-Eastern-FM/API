const { ApolloServer, gql } = require('apollo-server')
const types = require('./graphql/types')
const resolvers = require('./graphql/resolvers')
const { MongoClient } = require('mongodb')

const Schedules = require('./graphql/data-sources/schedules.js')
const Events = require('./graphql/data-sources/events.js')

// TODO: Make safe
const MONGO_USERNAME = "scheduler"
const MONGO_PASSWORD = "Passworde3611b4a4a174505a8e516453b679a05"
const MONGO_PORT = 27017
const MONGO_DB = "schedule"

const dbString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@db:${MONGO_PORT}/${MONGO_DB}`;

const client = new MongoClient(dbString)
client.connect()

const server = new ApolloServer({
  typeDefs: types,
  resolvers: resolvers,
  csrfPrevention: true,
  dataSources: () => ({
    events: new Events(client.db().collection('events')),
    schedules: new Schedules(client.db().collection('schedules'))
  })
});

// Launch server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
