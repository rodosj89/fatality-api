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

  async generateCode(id: string, perfil: string, token: string, ip: string) {
    const time = 60;
    let code = undefined;
    do {
      code = `[${Math.floor((Math.random() * (8 - 0)) + 0)},${Math.floor((Math.random() * (8 - 0)) + 0)},${Math.floor((Math.random() * (8 - 0)) + 0)}]`;
    } while (await this.findOne({where: {code, exp: {gt: moment().unix()}}}));

    const exp = moment().add(time, 's').unix();
    try {
      await this.findById(id);
      await this.updateById(id, {
        code,
        exp,
        token,
        ip: ip.length == 0 ? undefined : ip
      });
    } catch (error) {
      await this.create({
        id,
        perfil,
        code,
        exp,
        token,
        ip: ip.length == 0 ? undefined : ip
      });
    } finally {
      return {code: JSON.parse(code), exp};
    }
  }

  async authWithCode(code: number[], ip: string) {
    const userIp = await this.findOne({where: {ip}});
    const user = code[0] != 9 ? await this.findOne({where: {code: JSON.stringify(code)}}) : userIp;
    if (!user)
      throw new HttpErrors.NotAcceptable('El codigo no existe, pruebe con ingresar otro');
    if (user && user.exp < moment().add(5, 's').unix())
      throw new HttpErrors.PreconditionFailed('El tiempo ha expirado');
    this.deleteById(user.id);
    if (code[0] == 9)
      console.log(`Authenticated with IP:`, ip);
    else
      console.log(`Authenticated with CODE:`, code);
    return new User({token: user.token, perfil: user.perfil});
  }
}
