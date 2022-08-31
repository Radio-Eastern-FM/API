import { UserInputError } from 'apollo-server';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { ObjectId } from 'mongodb';
import { ProgramDocument } from './types/program';
import { EventDocument } from './types/event';
import { SlotDocument } from './types/slot';

export interface DataSources {
  events: EventDataSource
  slots: SlotDataSource
  programs: ProgramDataSource
}

export class ProgramDataSource extends MongoDataSource<ProgramDocument> {
  // Queries
  async getProgram(_id: ObjectId) {
    return this.findOneById(_id)
  }
  
  async getPrograms(filter:object): Promise<ProgramDocument[]> {
    return this.collection.find(filter).toArray();
  }
  
  // Mutations
  async addProgram (program: ProgramDocument) {
    // Insert new object
    const response = await this.collection.insertOne(program);
    
    // Fetch and return the new object
    return this.getProgram(response.insertedId);
  }
}

export class EventDataSource extends MongoDataSource<EventDocument> {
  // Queries
  async getEvent(_id: string) {
    return this.findOneById(new ObjectId(_id))
  }
  
  async onAt(d?: Date) {
    const date = d ?? new Date();
    
    const hour = date.getHours();
    const minute = date.getMinutes();
    const day = date.getDay();
    
    return this.collection.find({
        "slot.hourEnd": { $lte: hour },
        "slot.hourStart": { $gte: hour },
        "slot.minuteEnd": { $lte: minute },
        "slot.minuteStart": { $gte: minute },
        "slot.day": { $eq: day }
      }).toArray().then((events:EventDocument[]) => {
        if(events.length == 1) {
          return events[0];
        }
        else if(events.length > 1){
          return events.reduce((event, newestEvent) => 
            (EventDataSource.slotAsTimeValue(event.slot) > EventDataSource.slotAsTimeValue(newestEvent.slot)) ?
              event : newestEvent
          );
        }
        else {
          return null;
        }
      }
    );
  }
  
  static slotAsTimeValue(slot?: SlotDocument) {
    return slot ? slot.hourStart*60 + slot.minuteStart : -1;
  }
  
  async getSlotEvents(slotId: ObjectId, to: Date, from:Date) {
    if(from > to) throw new UserInputError("From date must occur before to date")
    return this.collection.find(to && from && {
      $and: [
        {
          slotId: { $eq: slotId }
        },
        {
          $or: [
            { // slot lies on the border of the requested from
              from: { $lte: from },
              to: { $gte: from }
            },
            { // slot lies between both from and to dates
              from: { $gte: from },
              to: { $lte: to }
            },
            { // slot lies on the border of the requested to
              from: { $lte: to },
              to: { $gte: to }
            }
          ]
        }
      ]
    }).toArray();
  }
  
  // Mutations
  async addEvent (event: EventDocument) {
    if(event.from >= event.to) throw new UserInputError("From date must occur before to date")
    // Fetch and return the new object
    return this.collection.insertOne(event)
      .then((response) => this.getEvent(response.insertedId.toString()));
  }
  async deleteEvent(_id: string){  
    return this.collection.deleteOne({ _id: new ObjectId(_id) });
  }
}

export class SlotDataSource extends MongoDataSource<SlotDocument> {
  // Queries
  async getSlot(_id: ObjectId) {
    return await this.findOneById(_id)
  }
  
  async getSlots(filter:object): Promise<SlotDocument[]> {
    return this.collection.find(filter).toArray();
  }
  
  async getSlotsBetween(to:Date, from:Date) {
    return this.collection.find({
      $or: [
        { // slot lies on the border of the requested from
          from: { $lte: from },
          to: { $gte: from }
        },
        { // slot lies between both from and to dates
          from: { $gte: from },
          to: { $lte: to }
        },
        { // slot lies on the border of the requested to
          from: { $lte: to },
          to: { $gte: to }
        }
      ]
    }).toArray();
  }
  
  // Mutations
  async addSlot (slot: SlotDocument) {
    SlotDataSource.validateRange(slot.hourStart, "hourStart", 0, 23);
    SlotDataSource.validateRange(slot.hourEnd, "hourEnd", 0, 23);
    SlotDataSource.validateRange(slot.minuteStart, "minuteStart", 0, 50);
    SlotDataSource.validateRange(slot.minuteEnd, "minuteEnd", 0, 59);
    
    // Check ordering
    if(slot.hourStart*60 + slot.minuteStart > slot.hourEnd*60 + slot.minuteEnd){
      // Dates are in wrong order; swap.
      const [hourStart, hourEnd, minuteStart, minuteEnd] = [slot.hourEnd, slot.hourStart, slot.minuteEnd, slot.minuteStart];
      slot.hourEnd = hourEnd;
      slot.hourStart = hourStart;
      slot.minuteEnd = minuteEnd;
      slot.minuteStart = minuteStart;
    }
    
    const response = await this.collection.insertOne(slot);
    
    // Fetch and return the new object
    return this.collection.insertOne(slot)
      .then((response) => this.getSlot(response.insertedId));
  }
  
  static validateRange(variable:number, variableName: string, min: number, max: number){
    if(variable == null || variable == undefined) throw new UserInputError(`${variableName} must not be null/undefined`);
    if(variable > max) throw new UserInputError(`${variableName} must be less than, or equal to ${max}`);
    if(variable < min) throw new UserInputError(`${variableName} must be greater than, or equal to ${min}`);
  }
}
