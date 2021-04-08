import {Entity, hasMany, model, property} from '@loopback/repository';
import {Device} from './device.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'array',
    itemType: 'number'
  })
  code?: number[];

  @property({
    type: 'number',
  })
  exp?: Number;

  @hasMany(() => Device)
  devices: Device[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
