import apollo from 'apollo-server'
import {resolvers as ScheduleResolvers, typeDef as Schedule} from './types/schedule.mjs'
import {resolvers as ProgramResolvers, typeDef as Program} from './types/program.mjs'
import {resolvers as EventResolvers, typeDef as Event} from './types/event.mjs'
import dateScalar from './types/date.mjs'

const { gql } = apollo

const Query = gql`
  scalar Date
  
  type Query {
    event(_id: ID): Event
    events(input: EventsInput): [Event!]
    
    schedule(_id: ID): Schedule
    schedules(input: SchedulesInput): [Schedule!]
    
    program(_id: ID): Program
    programs(input: ProgramsInput): [Program!]
    
    presenterNames: [String!]
  }
  
  type Mutation {
    addSchedule(
      name: String!): Schedule
      
    addEventToSchedule(
      _id: ID!,
      event_id: ID!
    ) : Schedule
    
    addProgram(
      title: String!,
      presenterName: String!,
      description: String): Program
    
    addEvent(
      name: String!
      body: String
      day: Int!
      hourStart: Int!
      hourEnd: Int!
      minuteStart: Int!
      minuteEnd: Int!): Event
  }
`;

export const typeDefs = [Query, Event, Program, Schedule]
export const resolvers = [ScheduleResolvers, ProgramResolvers, EventResolvers, { Date: dateScalar }]
