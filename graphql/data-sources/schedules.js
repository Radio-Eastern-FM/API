const { MongoDataSource } = require('apollo-datasource-mongodb');

module.exports = class Schedules extends MongoDataSource {
  getSchedule(scheduleId) {
    return this.findOneById(scheduleId)
  }
}
