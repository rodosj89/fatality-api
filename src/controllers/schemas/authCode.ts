import {model, property} from '@loopback/repository';

@model()
export class AuthCode {
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
}
