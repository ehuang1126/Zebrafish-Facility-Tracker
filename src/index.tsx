import {createRoot, Root} from 'react-dom/client';
import View from './client/view/view';

import './index.css';

const rootElement: (HTMLElement | null) = document.getElementById('root');
if(rootElement) {
    const root: Root = createRoot(rootElement);
    root.render(<View />);
}
