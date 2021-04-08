import {inject} from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef,
















  HttpErrors, param,


  post,




  put,




  Request, requestBody,
  response,
  RestBindings
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(RestBindings.Http.REQUEST) private request: Request,
  ) {
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @get('/users/{id}/generate-code/{perfil}')
  @response(200, {
    description: 'Generate code by user',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          includeRelations: false,
          exclude: ['id', 'perfil', 'token']
        }),
      },
    },
  })
  async generateCodeByUser(
    @param.path.string('id') id: string,
    @param.path.string('perfil') perfil: string,
  ): Promise<Object> {
    const req = await this.request;

    if (!req.headers['authorization']) {
      throw new HttpErrors.Unauthorized('Se requiere un Authorization Header');
    }
    let token = req.headers.authorization.split(' ')[1];
    return await this.userRepository.generateCode(id, perfil, token);
  }

  @post('/auth-code-fatality')
  @response(200, {
    description: 'Authenticated with code',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'code', 'exp']
        })
      }
    },
  })
  async authByCode(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'Authentication with code',
            exclude: ['id', 'perfil', 'exp', 'token'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {

    return this.userRepository.create(user);
  }
}
