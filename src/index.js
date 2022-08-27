import { createRoot } from 'react-dom/client';
import View from './client/view/view.js';

import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(<View />);
