import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FatalitydbDataSource} from '../datasources';
import {Device, DeviceRelations} from '../models';

export class DeviceRepository extends DefaultCrudRepository<
  Device,
  typeof Device.prototype.id,
  DeviceRelations
> {
  constructor(
    @inject('datasources.fatalitydb') dataSource: FatalitydbDataSource,
  ) {
    super(Device, dataSource);
  }
}
