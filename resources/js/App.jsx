import '../css/app.css';
import '../css/mobileScreen.css';
import '../css/tabletScreen.css';
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';

createInertiaApp({
    //tell inertia how to load component
    resolve: name => {
        //receive page name,return component
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name.replace('.', '/')}.jsx`]
    },
    //Receive everything needed to initialize the client side framework
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
    progress: {
        color: '#4B5563',
    },
})
