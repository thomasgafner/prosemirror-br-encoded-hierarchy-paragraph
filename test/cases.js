
const {doc, p, br} = require('./builder')
const {BiHrcl} = require('@thomas.gafner/prosemirror-br-encoded-hierarchy-base')

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

module.exports = {
	runTest
}
