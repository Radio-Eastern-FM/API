import { gql } from 'apollo-server';
import { MongoDataSource } from 'apollo-datasource-mongodb';

export const typeDef = gql`
  type Schedule {
    _id: ID
    name: String!
    isTemplate: Boolean!
    events: [Event]
    weekStarting: Date
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
    },
    setMasterSchedule: async (_, { _id }, { dataSources }) => {
      return dataSources.schedules.setMasterSchedule(_id)
    },
    addEventToSchedule: async (_, { _id, event_id }, { dataSources }) => {
      const event = dataSources.events.getEvent(event_id);
      return dataSources.schedules.addEventToSchedule(_id, event)
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
  
  async addEventToSchedule (_id, event_id) {
    console.log(event_id);
    return this.getSchedule(_id);
  }
  
  async setMasterSchedule (_id) {
    this.collection.update({ _id: { $eq: _id }}, { master: true });
    return this.getSchedule(_id)
  }
  
  async addSchedule (name) {
    // Insert new object
    const response = await this.collection.insertOne({name});
    
    // Fetch and return the new object
    return await this.getSchedule(response.insertedId);
  }
}
