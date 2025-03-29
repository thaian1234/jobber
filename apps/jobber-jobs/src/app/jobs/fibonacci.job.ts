import { KafkaClient } from '@jobber/kafka';
import { Job } from '../decorators/job.decorators';
import { AbstractJob } from './abstract.job';

@Job({
    name: 'Fibonacci',
    description: 'Generate a Fibonacci sequence and store it in the DB.',
})
export class FibonacciJob extends AbstractJob {
    constructor(kafkaClient: KafkaClient) {
        super(kafkaClient);
    }
    protected process(data: object): Promise<any> {
        return Promise.resolve();
    }
}
