import { gql } from 'apollo-server';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { ObjectId } from 'mongodb';

export const typeDef = gql`
  type Event{
    name: String!
    body: String
    Program: Program
    start: Date!
    end: Date!
  }
`;

// export const resolvers = {
//   Query: {
//     getEvents: () =>
//       [{}, {}, {}]
//   }
// };

export class Events extends MongoDataSource {
  getEvent(eventId) {
    return this.findOneById(eventId)
  }
  createEvent(name, body, start, end)
  {
    return this.collection.insertOne({
      id: new ObjectId(),
      name, body, start, end
    })
  }
}
