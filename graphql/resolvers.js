const { GraphQLScalarType, Kind } = require('graphql');

// https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/#example-the-date-scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

module.exports = {
  Query: {
    events: async (_, { id }, { dataSources }) => {
      return dataSources.events.getEvent(id);
    },
    schedules: async (_, { id }, { dataSources }) => {
      return dataSources.schedules.getSchedule(id);
    }
  },
  Date: dateScalar
};
