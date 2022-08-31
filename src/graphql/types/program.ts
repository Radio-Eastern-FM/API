import { ObjectId } from 'mongodb'
import { gql } from 'apollo-server';

export default gql`
  type Program{
    _id: ID
    title: String!
    description: String
  }
  
  input NewProgram{
    title: String!
    description: String
  }
  
  input ProgramInput{
    _id: ID
    title: String
    description: String
  }
  
  input ProgramFilterInput{
    filter: ProgramFilter
  }
  
  input ProgramFilter{
    _id: ID
    title: String
    description: String
  }
`;

export interface ProgramDocument {
  _id: ObjectId
  title: string
  description: string
}
