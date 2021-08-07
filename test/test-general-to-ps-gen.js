// const {EditorState} = require('prosemirror-state')
// const {Slice, Fragment} = require('prosemirror-model')
const ist = require('ist')
// const {doc, p, br} = require('./builder')
const {runTest} = require('./cases')
const {BiHrcl, biHrclsEqual} = require('@thomas.gafner/prosemirror-br-encoded-hierarchy-base')
const {generalToPsGen, psToGeneralGen} = require('..')

// :: (Node, [BiHrcl])
function apply(doc, expectedResult, maxDepth = 3) {

	const ntps = doc.type.schema.nodes

	const psToGeneral = psToGeneralGen(ntps.hard_break, maxDepth)
	const actualResult = psToGeneral(doc)

	// console.log('res')
	// actualResult.forEach(function(r, i){console.log(i, r)})
	// console.log('..')
	// console.log(4, actualResult[4])
	// console.log('..')

	// if (0 < actualResult.length) {
	// 	if (0 < actualResult[0].leading?.length) {
	// 		console.log('res [0].leading', actualResult[0].leading)
	// 	}
	// 	if (0 < actualResult[0].trailing?.length) {
	// 		console.log('res [0].trailing', actualResult[0].trailing)
	// 	}
	// 	// if (0 < actualResult[0].leadingAttrs?.length) {
	// 	// 	console.log('res [0].leadingAttrs', actualResult[0].leadingAttrs)
	// 	// }
	// 	// if (0 < actualResult[0].trailingAttrs?.length) {
	// 	// 	console.log('res [0].trailingAttrs', actualResult[0].trailingAttrs)
	// 	// }
	// }

	// console.log('exp')
	// expectedResult.forEach(function(r, i){console.log(i, r)})
	// if (0 < expectedResult.length) {
	// 	if (0 < expectedResult[0].leading?.length) {
	// 		console.log('exp [0].leading', expectedResult[0].leading)
	// 	}
	// 	if (0 < expectedResult[0].trailing?.length) {
	// 		console.log('exp [0].trailing', expectedResult[0].trailing)
	// 	}
	// 	if (0 < actualResult[0].leadingAttrs?.length) {
	// 		console.log('exp [0].leadingAttrs', expectedResult[0].leadingAttrs)
	// 	}
	// 	if (0 < actualResult[0].trailingAttrs?.length) {
	// 		console.log('exp [0].trailingAttrs', expectedResult[0].trailingAttrs)
	// 	}
	// }

	// if (actualResult.length == expectedResult.length) {
	// 	for (let i=0;i<actualResult.length;i++) {
	// 		const act = actualResult[i]
	// 		const exp = expectedResult[i]
	// 		console.log(i, 'act', act.leading[0], 'exp', exp.leading[0])
	// 		// console.log(i, 'act', act.trailing[0], 'exp', exp.trailing[0])
	// 	}
	// }

	ist(actualResult, expectedResult, biHrclsEqual)
}

// :: (Node, [BiHrcl])
function raply(expectedDoc, infos, maxDepth = 3) {

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

describe('psToGeneralGen', () => {
	runTest(apply)
})

describe('generalToPsGen', () => {
	runTest(raply, ' - reversed')
})
