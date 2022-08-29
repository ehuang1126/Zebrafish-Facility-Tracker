import { createRoot, Root } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import View from './client/view/view';

const rootElement: (HTMLElement | null) = document.getElementById('root');
if(rootElement) {
    const root: Root = createRoot(rootElement);
    root.render(
        <ChakraProvider>
            <View />
        </ChakraProvider>
    );
}
