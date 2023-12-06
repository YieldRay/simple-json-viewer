# simple-json-viewer

A simple web component to display json data

# Usage

Plain HTML

```html
<script type="module" src="https://unpkg.com/simple-json-viewer"></script>

<json-viewer data='{"some": "json", "array": [0, true, "2"] }'></json-viewer>
```

With Javascript

```js
import "https://unpkg.com/simple-json-viewer";

const jv = document.createElement("json-viewer");
// data can be any javascript variable that can stringify to json
jv.data = { some: "json", array: [0, true, "2"] };
document.body.append(jv);

// can also expand all or collpase all
jv.expandAll();
jv.collpaseAll();
```
