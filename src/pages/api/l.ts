import { l } from 'controllers';
import { allowCors } from 'requests/api';
// l = location
export default allowCors(l.handler);
