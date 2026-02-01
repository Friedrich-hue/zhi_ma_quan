import App from './App'
import i18n from './lang/i18n'
import store from './store'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'

// 挂载 store 到 Vue 原型，方便组件访问
Vue.prototype.$store = store

const app = new Vue({
	i18n,
	store,
	...App
})
app.$mount()
// #endif


// #ifdef VUE3
import { createSSRApp } from 'vue'

export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	app.use(store)
	return { app }
}
// #endif
