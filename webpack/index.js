import config from 'app-config'
import commonCfg from './common'
import development from './development'
import production from './production'
import SpeedMeasurePlugin from "speed-measure-webpack-plugin"

const envCfg = ({
  'development': development,
  'production': production,
})[config.env]

/* 
* плагин для подробного вывода в консоль о затраченом 
* на сборку времени для плагинов и лоадеров
* также показывает количество модулей 
*/
const smp = new SpeedMeasurePlugin();
export default smp.wrap(envCfg(commonCfg))
