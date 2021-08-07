// const {EditorState} = require('prosemirror-state')
// const {Slice, Fragment} = require('prosemirror-model')
const ist = require('ist')
const {doc, p, br} = require('./builder')
const {BiHrcl} = require('@thomas.gafner/prosemirror-br-encoded-hierarchy-base')
const {generalToPsGen} = require('..')

// :: ([BiHrcl], Node)
function apply(infos, expectedDoc) {

	const ntps = expectedDoc.type.schema.nodes

	const generalToPs = generalToPsGen(ntps.hard_break, ntps.paragraph)
	const actualResult = generalToPs(infos) // array of p

	const expectedParray = []
	expectedDoc.forEach(n => expectedParray.push(n))

	ist(actualResult.length, expectedParray.length)
	if (actualResult.length == expectedParray.length) {
		for (let i=0;i<actualResult.length;i++) {
			// console.log('act', actualResult[i])
			// console.log('exp', expectedParray[i])
			ist(expectedParray[i].eq(actualResult[i]))
		}
	}

}

function bi(depth, leading, trailing) {
	return new BiHrcl(depth, leading, trailing)
}

function t(str, marks) {
	return doc().type.schema.text(str, marks)
}

// function pAttrs(node, attrs) {
// 	node.attrs = attrs
// 	return node
// }
//
// function iAttrs(biHrcl, attrs) {
// 	biHrcl.setLeadingAttrs(attrs)
// 	biHrcl.setTrailingAttrs(attrs)
// 	return biHrcl
// }

describe('generalToPsGen', () => {

	describe('in the flat (no hierarchy) cases', () => {

		// All these cases here have no leading nor trailing br.

		it('if there is only one leading node group, there is no br at all in the paragraph', () =>
			apply(
				[
					bi(0, [[t('ABCD')]],  [])
				],
				doc(
					p('ABCD')
				)
			)
		)

		// TODO more cases

	})

	// TODO more topics

})
