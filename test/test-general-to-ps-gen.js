// const {EditorState} = require('prosemirror-state')
// const {Slice, Fragment} = require('prosemirror-model')
const ist = require('ist')
const {doc, p, br} = require('./builder')
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

// :: ([BiHrcl], Node)
// function apply2(infos, expectedDoc) {
//
// 	const ntps = expectedDoc.type.schema.nodes
//
// 	const generalToPs = generalToPsGen(ntps.hard_break, ntps.paragraph)
// 	const actualResult = generalToPs(infos) // array of p
//
// 	const expectedParray = []
// 	expectedDoc.forEach(n => expectedParray.push(n))
//
// 	ist(actualResult.length, expectedParray.length)
// 	if (actualResult.length == expectedParray.length) {
// 		for (let i=0;i<actualResult.length;i++) {
// 			// console.log('act', actualResult[i])
// 			// console.log('exp', expectedParray[i])
// 			ist(expectedParray[i].eq(actualResult[i]))
// 		}
// 	}
//
// }

function bi(depth, leading, trailing) {
	return new BiHrcl(depth, leading, trailing)
}

function t(str, marks) {
	return doc().type.schema.text(str, marks)
}

function pAttrs(node, attrs) {
	node.attrs = attrs
	return node
}

function iAttrs(biHrcl, attrs) {
	biHrcl.setLeadingAttrs(attrs)
	biHrcl.setTrailingAttrs(attrs)
	return biHrcl
}

const cases = [
	'in the flat (no hierarchy) cases',
	{	t:'only creates one leading node group if there is no br at all in the paragraph',
		d: () => doc(
			p('ABCD')
		),
		i: () => [
			bi(0, [[t('ABCD')]],  [])
		]
	},
	{	t:'splits one leading and one trailing node group if a paragraph has one br separating two nodes',
		d: () => doc(
			p('AB',br(),'CD')
		),
		i: () => [
			bi(0, [[t('AB')]],  [[t('CD')]])
		]
	},
	{	t:'takes the first br as separator and splits one leading and three trailing nodes if a paragraph has two distinct br separating three nodes',
		d: () => doc(
			p('AB',br(),'CD',br(),'EF')
		),
		i: () => [
			bi(0, [[t('AB')]],  [[t('CD')], [t('EF')]])
		]
	}
	// TODO more cases
	// TODO more topics
]

function runTest(tstFct, suffix = '') {
	for (let i=0;i<cases.length;i++) {
		const c = cases[i]
		if (typeof c == 'string') {
			const caseNo = i
			describe(c, () => {

				for (let j=caseNo+1; j<cases.length && typeof cases[j] != 'string'; j++) {
					const cs = cases[j]
					it(cs.t + suffix, () =>
						tstFct(
							cs.d(),
							cs.i(),
							cs.maxDepth ? cs.maxDepth : 3
						)
					)
					// If tstFct == apply then it looks like this:
					// it('only creates one leading node group if there is no br at all in the paragraph', () =>
					// 	apply(
					// 		doc(
					// 			p('ABCD')
					// 		),[
					// 			bi(0, [[t('ABCD')]],  [])
					// 		]
					// 	)
					// )
					// const attrs0 = {ex:true}
					// it('takes the attributes of the paragraph and assigns them to every group', () =>
					// 	apply(
					// 		doc(
					// 			pAttrs(p('AB',br(),'CD'), attrs0)
					// 		),[
					// 			iAttrs(bi(0, [[t('AB')]],  [[t('CD')]]), attrs0)
					// 		]
					// 	)
					// )
				}

			})
		}
	}
}

describe('psToGeneralGen', () => {
	runTest(apply)
})

describe('generalToPsGen', () => {
	runTest(raply, ' - reversed')
})
