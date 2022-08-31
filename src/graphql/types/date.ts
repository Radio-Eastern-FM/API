import { Kind, GraphQLScalarType } from "graphql";

// https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/#example-the-date-scalar
export default new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value:any) : number {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value: any): Date|null {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});
