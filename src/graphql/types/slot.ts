import { ObjectId } from 'mongodb'
import { gql } from 'apollo-server';

export default gql`
  type Slot {
    _id: ID
    day: Int!
    hourStart: Int!
    hourEnd: Int!
    minuteStart: Int
    minuteEnd: Int
  }
  
  input SlotInput {
    _id: ID
    day: Int!
    hourStart: Int!
    hourEnd: Int!
    minuteStart: Int
    minuteEnd: Int
  }
  
  input SlotFilterInput{
    filter: SlotFilter
  }
  
  input SlotFilter{
    _id: ID
    day: Int
    hourStart: Int
    hourEnd: Int
    minuteStart: Int
    minuteEnd: Int
  }
`;

export interface SlotDocument {
  _id: ObjectId
  day: number
  hourStart: number
  hourEnd: number
  minuteStart: number
  minuteEnd: number
}
