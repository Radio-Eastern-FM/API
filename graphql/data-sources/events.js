const { MongoDataSource } = require('apollo-datasource-mongodb');
const { ObjectId } = require('mongodb');

module.exports = class Events extends MongoDataSource {
  getEvent(eventId) {
    return this.findOneById(eventId)
  }
  createEvent(name, body, start, end)
  {
    return this.collection.insertOne({
      id: new ObjectId(),
      name, body, start, end
    })
  }
}
