import './bootstrap';
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layouts/Layout'
import { route } from 'ziggy-js'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTheme } from './lib/theme'
// import "./echo";

window.route = route;

//toasts follow the light/dark theme
function ThemedToasts() {
  const [, , resolved] = useTheme();
  return <ToastContainer position="top-right" autoClose={2000} hideProgressBar={true} theme={resolved} />;
}

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
    let page = pages[`./pages/${name}.jsx`];
    page.default.layout = page.default.layout || (page => <Layout children={page} />)
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <ThemedToasts />
      </>
    )
  },
})