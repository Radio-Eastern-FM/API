import { gql } from 'apollo-server'
import Program, { ProgramDocument } from './types/program'
import Slot, { SlotDocument } from './types/slot'
import Event, { EventDocument } from './types/event'
import dateScalar from './types/date'
import { DataSources, EventDataSource, ProgramDataSource, SlotDataSource } from './mongo-data-source'
import { ObjectId } from 'mongodb'

const Query = gql`
  scalar Date
  type DeleteResult {
    acknowledged: Boolean!
    deletedCount: Int!
  }
  
  type Query {
    # Gets the events occuring in a slot between two dates
    getSlotEvents(_id: ID, to: Date, from: Date) : [Event!]
    # Gets a schedule between two dates
    schedule(to: Date, from: Date) : [Event!]
    # Gets the event for a specific time
    onAt(date: Date): Event
    # Gets all programs
    programs(filter: ProgramFilterInput): [Program!]
    # Gets all slots
    slots(filter: SlotFilterInput): [Slot!]
    # Gets an event by ID
    event(_id: String!): Event
  }
  
  type Mutation {
    deleteEvent(_id: String!): DeleteResult!
    addEvent(
      programId: ID!
      slotId: ID!
      presenterName: String!
      from: Date!
      to: Date!
    ): Event
    
    addProgram(
      title: String!,
      description: String
    ): Program
    
    addSlot(
      day: Int!
      hourStart: Int!
      hourEnd: Int!
      minuteStart: Int!
      minuteEnd: Int!
    ): Slot
  }
`;

export const typeDefs = [Query, Event, Program, Slot]
export const resolvers = {
  Query: {
    // events(): async ()
    getSlotEvents: async (_:any, {slotId, to, from}:{slotId: ObjectId, to: Date, from:Date}, {dataSources}:{dataSources:DataSources}) => {
      return dataSources.events.getSlotEvents(slotId, to, from);
    },
    schedule: async (_:any, {to, from}:{to: Date, from:Date}, {dataSources}:{dataSources:DataSources}) => {
      return new Promise((resolve, reject) => 
      // Get relevant slots
        dataSources.slots.getSlotsBetween(to, from)
          .then((slots) =>
          // Get the slots' corrosponding events
            slots.map(async (slot:SlotDocument) =>
              await dataSources.events.getSlotEvents(slot._id, to, from)
            )
          )
          // return the events
          .then((events) => resolve(events))
          .catch((e) => reject(e))
      );
    },
    onAt: async (_:any, {date}:{date:Date}, {dataSources}:{dataSources:DataSources}) => {
      return dataSources.events.onAt(date);
    },
    programs: async (_:any, input:any, {dataSources}: {dataSources:DataSources}) => {
      return dataSources.programs.getPrograms(input?.filter)
    },
    slots: async (_:any, input:any, {dataSources}: {dataSources:DataSources}) => {
      return dataSources.slots.getSlots(input?.filter)
    },
    event: async (_:any, {_id}:{_id:string}, {dataSources}: {dataSources:DataSources}) => {
      return dataSources.events.getEvent(_id);
    },
    // events: async (_:any, input:any, dataSources:DataSources}) => {
    //   return dataSources.events.getEvents(input?.filter, input?.from, input?.to)
    // },
    // event: async (_:any, _id:ObjectId, dataSources:DataSources}) => {
    //   return dataSources.events.getEvent(_id)
    // },
    // program: async (_:any, _id:ObjectId, dataSources:DataSources}) => {
    //   return dataSources.programs.getProgram(_id)
    // }
  },
  Mutation: {
    deleteEvent: async (_:any, {_id}:{_id:string}, {dataSources}:{dataSources:DataSources}) => {
      return dataSources.events.deleteEvent(_id);
    },
    addEvent: async (_:any, event:EventDocument, {dataSources}:{dataSources:DataSources}) => {
      return Promise.all([
          dataSources.slots.getSlot(event.slotId),
          dataSources.programs.getProgram(event.programId)
        ])
        .then((values:[SlotDocument | null | undefined, ProgramDocument | null | undefined]) => {
          event.slot = values[0] ?? undefined;
          event.program = values[1] ?? undefined;
          return dataSources.events.addEvent(event);
        });
    },
    addProgram: async (_:any, program:ProgramDocument, {dataSources}:{dataSources:DataSources}) => {
      return dataSources.programs.addProgram(program)
    },
    addSlot: async (_:any, slot:SlotDocument, {dataSources}:{dataSources:DataSources}) => {
      return dataSources.slots.addSlot(slot)
    },
    // addEvent: async (_:any, event:EventDocument, dataSources:DataSources}) => {
    //   return dataSources.events.addEvent(event)
    // },
    // addProgram: async (_:any, program:ProgramDocument, dataSources:DataSources}) => {
    //   return dataSources.programs.addProgram(program)
    // }
  },
  Date: dateScalar
};

