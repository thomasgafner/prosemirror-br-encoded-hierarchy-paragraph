# prosemirror-br-encoded-hierarchy-paragraph

[ [**CHANGELOG**](https://github.com/thomasgafner/prosemirror-br-encoded-hierarchy-paragraph/blob/master/CHANGELOG.md) ]

This is a utility module for writing transformations for [ProseMirror](https://prosemirror.net).

Use this module to interpret a series of paragraphs as being in a hierarchical relation to each other.
Leading or trailing line breaks are used to indicate whether to indent or raise the hierarchical level of the paragraphs content.
Two line breaks in the middle indicate, that the content at a given position is split into two groups: A leading and a trailing one. If there are several double or multiple line breaks in the middle of a paragraphs content, only the first one is separating. The others are considered being content.

# Motivation

You want a consistent way of transforming back and forth hierarchical structures like nested lists or definition lists to paragraphs in html.

# How it is done

A series of paragraphs with leading or trailing line breaks is converted to a general structure. That structure is then used by other modules to establish the according list or definition list nodes (or any other hierarchical setup) in a ProseMirror document.

# Example

Get the general structure from a series of paragraphs in a ProseMirror document by using `psToGeneral`.


```javascript
import {psToGeneral} from "prosemirror-br-encoded-hierarchy-paragraph"

// TODO
```

# License

This code is released under an
[MIT license](https://github.com/thomasgafner/prosemirror-br-encoded-hierarchy-paragraph/tree/master/LICENSE).
