import { MongoDataSource } from 'apollo-datasource-mongodb';
import { gql } from 'apollo-server';

export const typeDef = gql`
  input ProgramsFilters {
    title: String
    presenterName: String
    description: String
  }

  input ProgramsInput {
    filter: ProgramsFilters
  }
  
  input NewProgram{
    title: String!
    presenterName: String!
    description: String
  }
  
  type Program{
    _id: ID
    title: String!
    presenterName: String!
    description: String
  }
`;

export const resolvers = {
  Query: {
    programs: async (_, { input }, { dataSources }) => {
      return dataSources.programs.getPrograms(input?.filter)
    },
    program: async (_, { _id }, { dataSources }) => {
      return dataSources.programs.getProgram(_id)
    },
    presenterNames: async (_, __, { dataSources }) => {
      return dataSources.programs.getPresenterNames()
    }
  },
  Mutation: {
    addProgram: async (_, program, { dataSources }) => {
      return dataSources.programs.addProgram(program)
    }
  }
};

export class Programs extends MongoDataSource {
  async getProgram(_id) {
    return this.findOneById(_id)
  }
  async getPrograms(filter) {
    let collection = this.collection.find(filter);
    return collection.toArray();
  }
  async getPresenterNames(filter) {
    let collection = this.collection.find(filter).map(x => x.presenterName);
    return collection.toArray();
  }
  async addProgram (program) {
    // Insert new object
    const response = await this.collection.insertOne(program);
    
    // Fetch and return the new object
    return await this.getProgram(response.insertedId)
  }
}
