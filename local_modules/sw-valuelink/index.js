import Link from 'valuelink'


// this.state = { foo: '', bar: '' }  =>   Link.all(this, 'foo', 'bar')
Link.allFields = (component) => Link.all(component, ...Object.keys(component.state))


export { Input, NumberInput, Checkbox, Radio, TextArea, Select } from './tags'

export default Link
