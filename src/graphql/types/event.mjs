import { gql, UserInputError } from 'apollo-server';
import { MongoDataSource } from 'apollo-datasource-mongodb';

export const typeDef = gql`
  input EventsFilters {
    name: String
    body: String
    day: Int
    hourStart: Int
    hourEnd: Int
    minuteStart: Int
    minuteEnd: Int
  }
  
  input EventsInput{
    filter: EventsFilters
  }
  
  type TimeSpan {
    from: Date!
    to: Date!
  }
  
  type Slot {
    day: Int!
    hourStart: Int!
    hourEnd: Int!
    minuteStart: Int
    minuteEnd: Int
  }
  
  union Occurance = TimeSpan | Slot
  
  type Event{
    _id: ID
    schedule: Schedule
    name: String!
    body: String
    occurance: Occurance!
  }
`;

export const resolvers = {
  Query: {
    events: async (_, { input }, { dataSources }) => {
      return dataSources.events.getEvents(input?.filter, input?.from, input?.to)
    },
    event: async (_, { _id }, { dataSources }) => {
      return dataSources.events.getEvent(_id)
    }
  },
  Mutation: {
    addEvent: async (_, event, { dataSources }) => {
      return dataSources.events.addEvent(event)
    }
  }
};

export class Events extends MongoDataSource {
  async getEvent(_id) {
    return this.findOneById(_id)
  }
  async getEvents(filter, from, to) {
    if(from > to) throw new UserInputError("From date must occur before to date")
    let collection = this.collection.find(filter);
    return collection.toArray();
  }
  async addEvent (event) {
    if(event.from > event.to) throw new UserInputError("From date must occur before to date")
    const insertedId = (await this.collection.insertOne(event)).insertedId;
    // Fetch and return the new object
    return await this.getEvent(insertedId)
  }
}
