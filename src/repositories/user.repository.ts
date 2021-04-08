import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
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
    let code = undefined;
    do {
      code = `[${Math.floor((Math.random() * (8 - 0)) + 0)},${Math.floor((Math.random() * (8 - 0)) + 0)},${Math.floor((Math.random() * (8 - 0)) + 0)}]`;
    } while (await this.findOne({where: {code, exp: {gt: moment().unix()}}}));

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
      return {code: JSON.parse(code), exp};
    }
  }

  async authWithCode(code: number[]) {
    const user = await this.findOne({where: {code: JSON.stringify(code)}});
    if (!user)
      throw new HttpErrors.NotAcceptable('El codigo no existe, pruebe con ingresar otro');
    if (user && user.exp < moment().add(5, 's').unix())
      throw new HttpErrors.PreconditionFailed('El tiempo ha expirado');
    //console.log('tiempo restante', (user.exp - moment().add(5, 's').unix()), 'segundos');
    //this.deleteById(user.id);
    return new User({token: user.token, perfil: user.perfil});
  }
}
