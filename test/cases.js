
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
	// All these cases here have no leading nor trailing br.
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
	{	t:'takes the first double br occurrance as separator to split leading and trailing node groups',
		d: () => doc(
					p('AB',br(),'CD',br(),br(),'EF')
				),
		i: () => [
					bi(0, [[t('AB')], [t('CD')]],  [[t('EF')]])
				]
	},
	{	t:'takes the first multiple br occurrance as separator to split leading and trailing node groups and prepend any additional br',
		d: () => doc(
					p('AB',br(),'CD',br(),br(),br(),br(),'EF')
				),
		i: () => [
					bi(0, [[t('AB')], [t('CD')]],  [[br(),br(),t('EF')]])
				]
	},
	{	t:'takes the first double br occurrance as separator to split leading and trailing node groups also if many on both sides',
		d: () => doc(
					p('AB',br(),'CD',br(),'EF',br(),br(),'GH',br(),'IJ',br(),'KL',br(),'MN')
				),
		i: () => [
					bi(0, [[t('AB')], [t('CD')], [t('EF')]],  [[t('GH')], [t('IJ')], [t('KL')], [t('MN')]])
				]
	},
	{	t:'takes the first double br occurrance as separator to split leading and trailing node groups treats any additional br of other multiple occurrances as content',
		d: () => doc(
					p('AB',br(),'CD',br(),br(),'EF',br(),'GH',br(),br(),'IJ')
				),
		i: () => [
					bi(0, [[t('AB')], [t('CD')]],  [[t('EF')],[t('GH')],[br(),t('IJ')]])
				]
	},

	'concerning attributes of the groups',
	{	t:'takes the attributes of the paragraph and assigns them to every group',
		d: () => doc(
					pAttrs(p('AB',br(),'CD'), attrs0)
				),
		i: () => [
					iAttrs(bi(0, [[t('AB')]],  [[t('CD')]]), attrs0)
				]
	},

	// Tests where brs are at the beginning and at the end to control hierarchy.
	// Given a leading br the function raises the following groups.
	// Given a trailing br causes the function to lower the level by one.

	'in the hierarchical case with a single sublist not on the highest level',
		// Test single sublist, not on highest level, of length 1, 2 and 3.
	{	t:'handles a single sublist of three or more groups',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i'),
					p('ii'),
					p('iii', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(1, [[t('ii')]], []),
					bi(1, [[t('iii')]], []),
					bi(0, [[t('C')]], [])
				]
	},
	{	t:'handles a single sublist of two groups',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i'),
					p('ii', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(1, [[t('ii')]], []),
					bi(0, [[t('C')]], [])
				]
	},
	{	t:'handles a single sublist only consisting of just one group',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(0, [[t('C')]], [])
				]
	},

	'in the hierarchical case with a sublist on the highest level',
		// Test single sublist on the highest level of length 1, 2 and 3.
	{	t:'handles a sublist of three or more groups on highest level, when there are more than just two levels',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i'),
					p(br(), 'U'),
					p('V'),
					p('W', br()),
					p('ii'),
					p('iii', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(2, [[t('U')]], []),
					bi(2, [[t('V')]], []),
					bi(2, [[t('W')]], []),
					bi(1, [[t('ii')]], []),
					bi(1, [[t('iii')]], []),
					bi(0, [[t('C')]], [])
				]
	},
	{	t:'handles a sublist of two groups on highest level, when there are more than just two levels',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i'),
					p(br(), 'U'),
					p('V', br()),
					p('ii'),
					p('iii', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(2, [[t('U')]], []),
					bi(2, [[t('V')]], []),
					bi(1, [[t('ii')]], []),
					bi(1, [[t('iii')]], []),
					bi(0, [[t('C')]], [])
				]
	},
	{	t:'handles a sublist only consisting of just one group on highest level, when there are more than just two levels',
		d: () => doc(
					p('A'),
					p('B'),
					p(br(), 'i'),
					p(br(), 'U', br()),
					p('ii'),
					p('iii', br()),
					p('C')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(0, [[t('B')]], []),
					bi(1, [[t('i')]], []),
					bi(2, [[t('U')]], []),
					bi(1, [[t('ii')]], []),
					bi(1, [[t('iii')]], []),
					bi(0, [[t('C')]], [])
				]
	},

	'in the hierarchical case with separating br not on the highest level',
		// br as separator, double and multiple br cases on intermediate level
	{	t:'handles a singel br as separator on a intermediate level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'I', br(), 'i1', br(), 'i2'),
					p('II', br(), 'ii1', br(), 'ii2'),
					p('III', br(), 'iii1', br(), 'iii2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('I')]], [[t('i1')],[t('i2')]]),
					bi(1, [[t('II')]], [[t('ii1')],[t('ii2')]]),
					bi(1, [[t('III')]], [[t('iii1')],[t('iii2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},
	{	t:'handles two br as separator on a intermediate level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'I-1', br(), 'I-2', br(), br(), 'i1', br(), 'i2'),
					p('II-1', br(), 'II-2', br(), br(), 'ii1', br(), 'ii2'),
					p('III-1', br(), 'III-2', br(), br(), 'iii1', br(), 'iii2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('I-1')],[t('I-2')]], [[t('i1')],[t('i2')]]),
					bi(1, [[t('II-1')],[t('II-2')]], [[t('ii1')],[t('ii2')]]),
					bi(1, [[t('III-1')],[t('III-2')]], [[t('iii1')],[t('iii2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},
	{	t:'handles multiple br occurrance as separator on a intermediate level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'I-1', br(), 'I-2', br(), br(), br(), br(), 'i1', br(), 'i2'),
					p('II-1', br(), 'II-2', br(), br(), br(), br(), 'ii1', br(), 'ii2'),
					p('III-1', br(), 'III-2', br(), br(), br(), br(), 'iii1', br(), 'iii2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('I-1')],[t('I-2')]], [[br(), br(), t('i1')],[t('i2')]]),
					bi(1, [[t('II-1')],[t('II-2')]], [[br(), br(), t('ii1')],[t('ii2')]]),
					bi(1, [[t('III-1')],[t('III-2')]], [[br(), br(), t('iii1')],[t('iii2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},

	'in the hierarchical case with separating br on the highest level',
		// br as separator, double and multiple br cases on the highest level
	{	t:'handles a singel br as separator on the highest level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'U', br(), 'u1', br(), 'u2'),
					p(br(), 'I', br(), 'i1', br(), 'i2'),
					p('II', br(), 'ii1', br(), 'ii2'),
					p('III', br(), 'iii1', br(), 'iii2', br()),
					p('V', br(), 'v1', br(), 'v2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('U')]], [[t('u1')],[t('u2')]]),
					bi(2, [[t('I')]], [[t('i1')],[t('i2')]]),
					bi(2, [[t('II')]], [[t('ii1')],[t('ii2')]]),
					bi(2, [[t('III')]], [[t('iii1')],[t('iii2')]]),
					bi(1, [[t('V')]], [[t('v1')],[t('v2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},
	{	t:'handles two br as separator on the highest level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'U', br(), 'u1', br(), 'u2'),
					p(br(), 'I-1', br(), 'I-2', br(), br(), 'i1', br(), 'i2'),
					p('II-1', br(), 'II-2', br(), br(), 'ii1', br(), 'ii2'),
					p('III-1', br(), 'III-2', br(), br(), 'iii1', br(), 'iii2', br()),
					p('V', br(), 'v1', br(), 'v2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('U')]], [[t('u1')],[t('u2')]]),
					bi(2, [[t('I-1')],[t('I-2')]], [[t('i1')],[t('i2')]]),
					bi(2, [[t('II-1')],[t('II-2')]], [[t('ii1')],[t('ii2')]]),
					bi(2, [[t('III-1')],[t('III-2')]], [[t('iii1')],[t('iii2')]]),
					bi(1, [[t('V')]], [[t('v1')],[t('v2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},
	{	t:'handles multiple br occurrance as separator on the highest level',
		d: () => doc(
					p('A', br(), 'a1', br(), 'a2'),
					p(br(), 'U', br(), 'u1', br(), 'u2'),
					p(br(), 'I-1', br(), 'I-2', br(), br(), br(), br(), 'i1', br(), 'i2'),
					p('II-1', br(), 'II-2', br(), br(), br(), br(), 'ii1', br(), 'ii2'),
					p('III-1', br(), 'III-2', br(), br(), br(), br(), 'iii1', br(), 'iii2', br()),
					p('V', br(), 'v1', br(), 'v2', br()),
					p('B', br(), 'b1', br(), 'b2')
				),
		i: () => [
					bi(0, [[t('A')]], [[t('a1')],[t('a2')]]),
					bi(1, [[t('U')]], [[t('u1')],[t('u2')]]),
					bi(2, [[t('I-1')],[t('I-2')]], [[br(), br(), t('i1')],[t('i2')]]),
					bi(2, [[t('II-1')],[t('II-2')]], [[br(), br(), t('ii1')],[t('ii2')]]),
					bi(2, [[t('III-1')],[t('III-2')]], [[br(), br(), t('iii1')],[t('iii2')]]),
					bi(1, [[t('V')]], [[t('v1')],[t('v2')]]),
					bi(0, [[t('B')]], [[t('b1')],[t('b2')]])
				]
	},

	'in the hierarchical case with attributes intermediate and highest level',
	{	t:'takes the attributes of the paragraph and assigns them to every group also on the intermediate level',
		d: () => doc(
					p('A'),
					pAttrs(p(br(),'I',br(),'i',br()), attrs0),
					p('B')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					iAttrs(bi(1, [[t('I')]],  [[t('i')]]), attrs0),
					bi(0, [[t('B')]], [])
				]
	},
	{	t:'takes the attributes of the paragraph and assigns them to every group also on the highest level',
		d: () => doc(
					p('A'),
					p(br(),'U'),
					pAttrs(p(br(),'I',br(),'i',br()), attrs0),
					p('V', br()),
					p('B')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(1, [[t('U')]], []),
					iAttrs(bi(2, [[t('I')]],  [[t('i')]]), attrs0),
					bi(1, [[t('V')]], []),
					bi(0, [[t('B')]], [])
				]
	},

	'in hierarchical cases with steps larger than one level',
	{	t:'handles a single sublist of level three',
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
	{	t:'handles a sublist, that only consists of just one group on highest level, when the level goes from second to highest and immediately back to second',
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
	},

	'in pathological hierarchical cases',
	{	t:'treats trailing br in the lowest level as content',
		d: () => doc(
					p('AB',br(),'CD', br())
				),
		i: () => [
					bi(0, [[t('AB')]],  [[t('CD'), br()]]) // br is content
				]
	},
	{	t:'treats too many trailing br in higher level as content',
		d: () => doc(
					p('A'),
					p(br(), 'i'),
					p(br(), 'U', br(), br(), 'u', br(), br(), br()),
					p('B')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(1, [[t('i')]], []),
					bi(2, [[t('U')]], [[t('u'), br()]]), // one br is content but the others are not
					bi(0, [[t('B')]], [])
				]
	},
	{	t:'treats a leading br on the highest level as content',
		d: () => doc(
					p('A'),
					p(br(), 'i'),
					p(br(), 'U'),
					p(br(), 'eee'),
					p('V', br()),
					p('ii', br()),
					p('B')
				),
		i: () => [
					bi(0, [[t('A')]], []),
					bi(1, [[t('i')]], []),
					bi(2, [[t('U')]], []),
					bi(2, [[br(), t('eee')]], []),
					bi(2, [[t('V')]], []),
					bi(1, [[t('ii')]], []),
					bi(0, [[t('B')]], [])
				]
	},
	{	t:'treats too many leading br in the lowest level as content',
		d: () => doc(
					p(br(), br(), br(), br(), 'AB',br(),'CD')
				),
		i: () => [
					bi(2, [[br(), br(), t('AB')]], [[t('CD')]]) // br are content
				]
	}


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
