const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  type Schedule {
    id: ID!
    name: String!
    events: [Event]
  }

  type Event{
    id: ID!
    name: String!
    body: String
    start: Date!
    end: Date!
  }

  type Query {
    events: [Event]
    schedules: [Schedule]
  }

  type Mutation {
    createEvent(name: String!, body: String, start: Date!, end: Date!): Event
    updateEvent(id: ID!, name: String!, body: String, start: Date!, end: Date!): Event
  }
`;
