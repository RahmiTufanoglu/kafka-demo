import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientKafka, EventPattern, Transport } from "@nestjs/microservices";
import { AppService } from './app.service';

// bin/zookeeper-server-start.sh config/zookeeper.properties
// bin/kafka-server-start.sh config/server.properties
// ?
// sh kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'kafkaSample',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'my-kafka-consumer',
      },
    }
  })
  client: ClientKafka;

  async onModuleInit() {
    this.client.subscribeToResponseOf('item-create');
    await this.client.connect();
  }

  @Get('/hello/:name')
  getHello(@Param('name') name: string) {
    // fire event to kafka
    // this.client.emit<string>('entity-created', 'some entity ' + new Date());
    console.log(name);
    return this.client.send('item-create', name);
    // return this.appService.getHello();
  }

  @EventPattern('entity-created')
  async handleEntityCreated(payload: any) {
    console.log(JSON.stringify(payload) + ' created');
  }
}
