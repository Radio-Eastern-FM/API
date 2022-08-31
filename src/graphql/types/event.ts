import { ObjectId } from 'mongodb'
import { gql } from 'apollo-server'
import { SlotDocument } from './slot.js';
import { ProgramDocument } from './program.js';

export default gql`
  type Event{
    _id: ID
    program: Program
    slot: Slot
    presenterName: String!
    from: Date!
    to: Date!
  }
  input EventInput{
    _id: ID
    program: ID!
    slot: ID!
    presenterName: String!
    from: Date!
    to: Date!
  }
`;

export interface EventDocument {
  _id: ObjectId
  program?: ProgramDocument
  programId: ObjectId
  slot?: SlotDocument
  slotId: ObjectId
  presenterName: string
  from: Date
  to: Date
}
