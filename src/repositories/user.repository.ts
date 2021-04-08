import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import moment from 'moment';
import {FatalitydbDataSource} from '../datasources';
import {Device, User, UserRelations} from '../models';
import {DeviceRepository} from './device.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {

  public readonly devices: HasManyRepositoryFactory<Device, typeof User.prototype.id>;

  constructor(
    @inject('datasources.fatalitydb') dataSource: FatalitydbDataSource, @repository.getter('DeviceRepository') protected deviceRepositoryGetter: Getter<DeviceRepository>,
  ) {
    super(User, dataSource);
    this.devices = this.createHasManyRepositoryFactoryFor('devices', deviceRepositoryGetter,);
    this.registerInclusionResolver('devices', this.devices.inclusionResolver);
  }

  async generateCode(id: string, perfil: string, token: string) {
    const time = 60;
    const code = [Math.floor((Math.random() * (8 - 0)) + 0), Math.floor((Math.random() * (8 - 0)) + 0), Math.floor((Math.random() * (8 - 0)) + 0)];
    const exp = moment().add(time, 's').unix();
    try {
      await this.findById(id);
      await this.updateById(id, {code, exp, token});
    } catch (error) {
      await this.create({
        id,
        perfil,
        code,
        exp,
        token
      });
    } finally {
      return {code, exp};
    }
  }
}
