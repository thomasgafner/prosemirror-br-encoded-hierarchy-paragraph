// const {EditorState} = require('prosemirror-state')
// const {Slice, Fragment} = require('prosemirror-model')
const ist = require('ist')
const {runTest} = require('./cases')
const {BiHrcl} = require('@thomas.gafner/prosemirror-br-encoded-hierarchy-base')
const {generalToPsGen} = require('..')

// :: (Node, [BiHrcl])
function apply(expectedDoc, infos, maxDepth = 3) {

	const ntps = expectedDoc.type.schema.nodes

	const generalToPs = generalToPsGen(ntps.hard_break, ntps.paragraph, maxDepth)
	const actualResult = generalToPs(infos) // array of p

	const expectedParray = []
	expectedDoc.forEach(n => expectedParray.push(n))

	ist(actualResult.length, expectedParray.length)
	if (actualResult.length == expectedParray.length) {
		for (let i=0;i<actualResult.length;i++) {
			// console.log('act', actualResult[i].content.content)
			// console.log('exp', expectedParray[i].content.content)
			ist(expectedParray[i].eq(actualResult[i]))
		}
	}

}

describe('generalToPsGen', () => {
	runTest(apply, ' - reversed')
})
