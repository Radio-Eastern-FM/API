import apollo from 'apollo-server'
import {resolvers as ScheduleResolvers, typeDef as Schedule} from './types/schedule.mjs'
import {resolvers as ProgramResolvers, typeDef as Program} from './types/program.mjs'
import {typeDef as Event} from './types/event.mjs'
import dateScalar from './types/date.mjs'

const { gql } = apollo

const Query = gql`
  scalar Date
  
  type Query {
    events: [Event!]
    
    schedules(input: SchedulesInput): [Schedule!]
    schedule(_id: ID): Schedule
    
    program(_id: ID): Program
    programs(input: ProgramsInput): [Program]
    
    presenterNames: [String!]
  }
  
  type Mutation {
    addSchedule(name: String!): Schedule
    addProgram(title: String!, presenterName: String!, description: String): Program
  }
`;

export const typeDefs = [Query, Event, Program, Schedule]
export const resolvers = [ScheduleResolvers, ProgramResolvers, { Date: dateScalar }]
