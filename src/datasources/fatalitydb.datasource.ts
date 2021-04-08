import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'fatalitydb',
  connector: 'mongodb',
  url: 'mongodb+srv://api-fatality:IEBgNF1oV2Giysj4@cluster0.zxewk.mongodb.net/fatality?retryWrites=true&w=majority',
  host: '',
  port: 27017,
  user: 'api-fatality',
  password: '',
  database: 'fatality',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class FatalitydbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'fatalitydb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.fatalitydb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
