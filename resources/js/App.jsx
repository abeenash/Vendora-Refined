import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layouts/layout'
import { route } from 'ziggy-js'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

window.route = route;

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
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={true} />
      </>
    )
  },
})