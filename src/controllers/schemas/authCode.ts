import {model, property} from '@loopback/repository';

@model()
export class AuthCode {
  @property({
    type: 'array',
    itemType: 'number'
  })
  code: number[];
}
