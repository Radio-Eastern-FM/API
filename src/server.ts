import { MongoClient } from 'mongodb'
import { resolvers, typeDefs } from './graphql/schema'
import { ProgramDataSource, EventDataSource, SlotDataSource }from './graphql/mongo-data-source'
import { ApolloServer } from 'apollo-server'

// TODO: Make safe
const MONGO_USERNAME = "root"
const MONGO_PASSWORD = "example"
const MONGO_PORT = 27017
const MONGO_DB = "MYDB"
const MONGO_HOST = process.env.DATABASE_HOST ?? "localhost";
// const MONGO_HOST = "db"

// const dbString = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
const dbString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
const client = new MongoClient(dbString)
client.connect()
  .then((info) => console.log('Connected to MongoDB'))
  .catch((e) => console.error("Error connecting to MongoDB:", e));

const server = new ApolloServer({
  resolvers: resolvers,
  typeDefs: typeDefs,
  csrfPrevention: true,
  dataSources: () => ({
    programs: new ProgramDataSource(client.db().collection('programs')),
    events: new EventDataSource(client.db().collection('events')),
    slots: new SlotDataSource(client.db().collection('slots')),
  })
});

// Launch server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
