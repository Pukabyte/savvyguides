// .vitepress/theme/index.js
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Documate from '@documate/vue'
import '@documate/vue/dist/style.css'
import './styles.css/'
import ImageModal from './ImageModal.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('ImageModal', ImageModal)
  },
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h(Documate, {
        endpoint: '',
      }),
    })
  },
}
