import { gql } from 'apollo-server';
import { MongoDataSource } from 'apollo-datasource-mongodb';

export const typeDef = gql`
  type Schedule {
    _id: ID
    name: String!
    events: [Event]
  }
  input SchedulesFilters {
    name: String
  }
  
  input SchedulesInput {
    filter: SchedulesFilters
  }
`;


export const resolvers = {
  Query: {
    schedules: async (_, { input }, { dataSources }) => {
      return dataSources.schedules.getSchedules(input?.filter)
    },
    schedule: async (_, { _id }, { dataSources }) => {
      return dataSources.schedules.getSchedule(_id)
    }
  },
  Mutation: {
    addSchedule: async (_, { name }, { dataSources }) => {
      return dataSources.schedules.addSchedule(name)
    }
  }
};

export class Schedules extends MongoDataSource {
  async getSchedule(_id) {
    return this.findOneById(_id)
  }
  async getSchedules(filter) {
    let collection = this.collection.find(filter);
    
    return collection.toArray();
  }
  async addSchedule (name) {
    // Insert new object
    const response = await this.collection.insertOne({name});
    
    // Fetch and return the new object
    return await this.getSchedule(response.insertedId);
  }
}
