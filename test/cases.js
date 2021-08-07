
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

const attrs0 = {ex:true}

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
	},
	'concerning attributes of the groups',
	{
		t: 'takes the attributes of the paragraph and assigns them to every group',
		d: () => doc(
			pAttrs(p('AB',br(),'CD'), attrs0)
		),
		i: () => [
			iAttrs(bi(0, [[t('AB')]],  [[t('CD')]]), attrs0)
		]
	},
	'in hierarchical cases with steps larger than one level',
	{
		t: 'handles a single sublist of level three',
		d: () => doc(
			p('A'),
			p('B'),
			p(br(), br(), br(), 'i'),
			p('ii'),
			p('iii', br(), br(), br()),
			p('C')
		),
		i: () => [
			bi(0, [[t('A')]], []),
			bi(0, [[t('B')]], []),
			bi(3, [[t('i')]], []),
			bi(3, [[t('ii')]], []),
			bi(3, [[t('iii')]], []),
			bi(0, [[t('C')]], [])
		],
		maxDepth: 5
	},
	{
		t: 'handles a sublist, that only consists of just one group on highest level, when the level goes from second to highest and immediately back to second',
		d: () => doc(
			p('A'),
			p(br(), 'i'),
			p(br(), br(), br(), 'U', br(), br(), br()),
			p('ii', br()),
			p('B')
		),
		i: () => [
			bi(0, [[t('A')]], []),
			bi(1, [[t('i')]], []),
			bi(4, [[t('U')]], []),
			bi(1, [[t('ii')]], []),
			bi(0, [[t('B')]], [])
		],
		maxDepth: 5
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
