import { stats } from 'controllers';
import { allowCors } from '../../../requests/api';

export default allowCors(stats.handler);
