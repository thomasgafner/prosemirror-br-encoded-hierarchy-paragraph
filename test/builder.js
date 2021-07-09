const {schema} = require("prosemirror-schema-basic")
// const {Schema} = require("prosemirror-model")
const {builders} = require("prosemirror-test-builder")

const out = builders(schema, {
  p: {nodeType: "paragraph"},
	br: {nodeType: "hard_break"}
  // pre: {nodeType: "code_block"},
  // h1: {nodeType: "heading", level: 1},
  // h2: {nodeType: "heading", level: 2},
  // h3: {nodeType: "heading", level: 3},
  // li: {nodeType: "list_item"},
  // ul: {nodeType: "bullet_list"},
  // ol: {nodeType: "ordered_list"},
  // img: {nodeType: "image", src: "img.png"},
  // hr: {nodeType: "horizontal_rule"},
  // a: {markType: "link", href: "foo"},
})

out.builders = builders

module.exports = out
