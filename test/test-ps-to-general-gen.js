const {EditorState} = require("prosemirror-state")
const {Slice, Fragment} = require("prosemirror-model")
const ist = require("ist")
const {doc, p, br} = require("./builder")
const {BiHrcl, biHrclsEqual} = require('@thomas.gafner/prosemirror-br-encoded-hierarchy-base')
const {psToGeneralGen} = require("..")

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

describe("psToGeneralGen", () => {

	describe("in the flat (no hierarchy) cases", () => {

		// All these cases here have no leading nor trailing br.

		it("only creates one leading node group if there is no br at all in the paragraph", () =>
			apply(
				doc(
					p("ABCD")
				),[
					bi(0, [[t("ABCD")]],  [])
				]
			)
		)

		it("splits one leading and one trailing node group if a paragraph has one br separating two nodes", () =>
			apply(
				doc(
					p("AB",br(),"CD")
				),[
					bi(0, [[t("AB")]],  [[t("CD")]])
				]
			)
		)

		it("takes the first br as separator and splits one leading and three trailing nodes if a paragraph has two distinct br separating three nodes", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),"EF")
				),[
					bi(0, [[t("AB")]],  [[t("CD")], [t("EF")]])
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),"EF")
				),[
					bi(0, [[t("AB")], [t("CD")]],  [[t("EF")]])
				]
			)
		)

		it("takes the first multiple br occurrance as separator to split leading and trailing node groups and prepend any additional br", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),br(),br(),"EF")
				),[
					bi(0, [[t("AB")], [t("CD")]],  [[br(),br(),t("EF")]])
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups also if many on both sides", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),"EF",br(),br(),"GH",br(),"IJ",br(),"KL",br(),"MN")
				),[
					bi(0, [[t("AB")], [t("CD")], [t("EF")]],  [[t("GH")], [t("IJ")], [t("KL")], [t("MN")]])
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups treats any additional br of other multiple occurrances as content", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),"EF",br(),"GH",br(),br(),"IJ")
				),[
					bi(0, [[t("AB")], [t("CD")]],  [[t("EF")],[t("GH")],[br(),t("IJ")]])
				]
			)
		)

	})

	describe("concerning attributes of the groups", () => {

		const attrs0 = {ex:true}

		it("takes the attributes of the paragraph and assigns them to every group", () =>
			apply(
				doc(
					pAttrs(p("AB",br(),"CD"), attrs0)
				),[
					iAttrs(bi(0, [[t("AB")]],  [[t("CD")]]), attrs0)
				]
			)
		)

	})

	// Tests where brs are at the beginning and at the end to control hierarchy.
	// Given a leading br the function raises the following groups.
	// Given a trailing br causes the function to lower the level by one.

	describe("in the hierarchical case with a single sublist not on the highest level", () => {

		// Test single sublist, not on highest level, of length 1, 2 and 3.

		it("handles a single sublist of three or more groups", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i"),
					p("ii"),
					p("iii", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(1, [[t("ii")]], []),
					bi(1, [[t("iii")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

		it("handles a single sublist of two groups", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i"),
					p("ii", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(1, [[t("ii")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

		it("handles a single sublist only consisting of just one group", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

	})

	describe("in the hierarchical case with a sublist on the highest level", () => {

		// Test single sublist on the highest level of length 1, 2 and 3.

		it("handles a sublist of three or more groups on highest level, when there are more than just two levels", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i"),
					p(br(), "U"),
					p("V"),
					p("W", br()),
					p("ii"),
					p("iii", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(2, [[t("U")]], []),
					bi(2, [[t("V")]], []),
					bi(2, [[t("W")]], []),
					bi(1, [[t("ii")]], []),
					bi(1, [[t("iii")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

		it("handles a sublist of two groups on highest level, when there are more than just two levels", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i"),
					p(br(), "U"),
					p("V", br()),
					p("ii"),
					p("iii", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(2, [[t("U")]], []),
					bi(2, [[t("V")]], []),
					bi(1, [[t("ii")]], []),
					bi(1, [[t("iii")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

		it("handles a sublist only consisting of just one group on highest level, when there are more than just two levels", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), "i"),
					p(br(), "U", br()),
					p("ii"),
					p("iii", br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(1, [[t("i")]], []),
					bi(2, [[t("U")]], []),
					bi(1, [[t("ii")]], []),
					bi(1, [[t("iii")]], []),
					bi(0, [[t("C")]], [])
				]
			)
		)

	})

	describe("in the hierarchical case with separating br not on the highest level", () => {

		// br as separator, double and multiple br cases on intermediate level

		it("handles a singel br as separator on a intermediate level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "I", br(), "i1", br(), "i2"),
					p("II", br(), "ii1", br(), "ii2"),
					p("III", br(), "iii1", br(), "iii2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("I")]], [[t("i1")],[t("i2")]]),
					bi(1, [[t("II")]], [[t("ii1")],[t("ii2")]]),
					bi(1, [[t("III")]], [[t("iii1")],[t("iii2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

		it("handles two br as separator on a intermediate level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "I-1", br(), "I-2", br(), br(), "i1", br(), "i2"),
					p("II-1", br(), "II-2", br(), br(), "ii1", br(), "ii2"),
					p("III-1", br(), "III-2", br(), br(), "iii1", br(), "iii2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("I-1")],[t("I-2")]], [[t("i1")],[t("i2")]]),
					bi(1, [[t("II-1")],[t("II-2")]], [[t("ii1")],[t("ii2")]]),
					bi(1, [[t("III-1")],[t("III-2")]], [[t("iii1")],[t("iii2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

		it("handles multiple br occurrance as separator on a intermediate level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "I-1", br(), "I-2", br(), br(), br(), br(), "i1", br(), "i2"),
					p("II-1", br(), "II-2", br(), br(), br(), br(), "ii1", br(), "ii2"),
					p("III-1", br(), "III-2", br(), br(), br(), br(), "iii1", br(), "iii2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("I-1")],[t("I-2")]], [[br(), br(), t("i1")],[t("i2")]]),
					bi(1, [[t("II-1")],[t("II-2")]], [[br(), br(), t("ii1")],[t("ii2")]]),
					bi(1, [[t("III-1")],[t("III-2")]], [[br(), br(), t("iii1")],[t("iii2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

	})

	describe("in the hierarchical case with separating br on the highest level", () => {

		// br as separator, double and multiple br cases on the highest level

		it("handles a singel br as separator on the highest level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "U", br(), "u1", br(), "u2"),
					p(br(), "I", br(), "i1", br(), "i2"),
					p("II", br(), "ii1", br(), "ii2"),
					p("III", br(), "iii1", br(), "iii2", br()),
					p("V", br(), "v1", br(), "v2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("U")]], [[t("u1")],[t("u2")]]),
					bi(2, [[t("I")]], [[t("i1")],[t("i2")]]),
					bi(2, [[t("II")]], [[t("ii1")],[t("ii2")]]),
					bi(2, [[t("III")]], [[t("iii1")],[t("iii2")]]),
					bi(1, [[t("V")]], [[t("v1")],[t("v2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

		it("handles two br as separator on the highest level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "U", br(), "u1", br(), "u2"),
					p(br(), "I-1", br(), "I-2", br(), br(), "i1", br(), "i2"),
					p("II-1", br(), "II-2", br(), br(), "ii1", br(), "ii2"),
					p("III-1", br(), "III-2", br(), br(), "iii1", br(), "iii2", br()),
					p("V", br(), "v1", br(), "v2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("U")]], [[t("u1")],[t("u2")]]),
					bi(2, [[t("I-1")],[t("I-2")]], [[t("i1")],[t("i2")]]),
					bi(2, [[t("II-1")],[t("II-2")]], [[t("ii1")],[t("ii2")]]),
					bi(2, [[t("III-1")],[t("III-2")]], [[t("iii1")],[t("iii2")]]),
					bi(1, [[t("V")]], [[t("v1")],[t("v2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

		it("handles multiple br occurrance as separator on the highest level", () =>
			apply(
				doc(
					p("A", br(), "a1", br(), "a2"),
					p(br(), "U", br(), "u1", br(), "u2"),
					p(br(), "I-1", br(), "I-2", br(), br(), br(), br(), "i1", br(), "i2"),
					p("II-1", br(), "II-2", br(), br(), br(), br(), "ii1", br(), "ii2"),
					p("III-1", br(), "III-2", br(), br(), br(), br(), "iii1", br(), "iii2", br()),
					p("V", br(), "v1", br(), "v2", br()),
					p("B", br(), "b1", br(), "b2")
				),[
					bi(0, [[t("A")]], [[t("a1")],[t("a2")]]),
					bi(1, [[t("U")]], [[t("u1")],[t("u2")]]),
					bi(2, [[t("I-1")],[t("I-2")]], [[br(), br(), t("i1")],[t("i2")]]),
					bi(2, [[t("II-1")],[t("II-2")]], [[br(), br(), t("ii1")],[t("ii2")]]),
					bi(2, [[t("III-1")],[t("III-2")]], [[br(), br(), t("iii1")],[t("iii2")]]),
					bi(1, [[t("V")]], [[t("v1")],[t("v2")]]),
					bi(0, [[t("B")]], [[t("b1")],[t("b2")]])
				]
			)
		)

	})

	describe("in the hierarchical case with attributes intermediate and highest level", () => {

		const attrs0 = {ex:true}

		it("takes the attributes of the paragraph and assigns them to every group also on the intermediate level", () =>
			apply(
				doc(
					p("A"),
					pAttrs(p(br(),"I",br(),"i",br()), attrs0),
					p("B")
				),[
					bi(0, [[t("A")]], []),
					iAttrs(bi(1, [[t("I")]],  [[t("i")]]), attrs0),
					bi(0, [[t("B")]], [])
				]
			)
		)

		it("takes the attributes of the paragraph and assigns them to every group also on the highest level", () =>
			apply(
				doc(
					p("A"),
					p(br(),"U"),
					pAttrs(p(br(),"I",br(),"i",br()), attrs0),
					p("V", br()),
					p("B")
				),[
					bi(0, [[t("A")]], []),
					bi(1, [[t("U")]], []),
					iAttrs(bi(2, [[t("I")]],  [[t("i")]]), attrs0),
					bi(1, [[t("V")]], []),
					bi(0, [[t("B")]], [])
				]
			)
		)

	})

	describe("in hierarchical cases with steps larger than one level", () => {

		it("handles a single sublist of level three", () =>
			apply(
				doc(
					p("A"),
					p("B"),
					p(br(), br(), br(), "i"),
					p("ii"),
					p("iii", br(), br(), br()),
					p("C")
				),[
					bi(0, [[t("A")]], []),
					bi(0, [[t("B")]], []),
					bi(3, [[t("i")]], []),
					bi(3, [[t("ii")]], []),
					bi(3, [[t("iii")]], []),
					bi(0, [[t("C")]], [])
				],
				5 // max levels
			)
		)

		it("handles a sublist, that only consists of just one group on highest level, when the level goes from second to highest and immediately back to second", () =>
			apply(
				doc(
					p("A"),
					p(br(), "i"),
					p(br(), br(), br(), "U", br(), br(), br()),
					p("ii", br()),
					p("B")
				),[
					bi(0, [[t("A")]], []),
					bi(1, [[t("i")]], []),
					bi(4, [[t("U")]], []),
					bi(1, [[t("ii")]], []),
					bi(0, [[t("B")]], [])
				],
				5 // max levels
			)
		)

	})

	describe("in pathological hierarchical cases", () => {

		it("treats trailing br in the lowest level as content", () =>
			apply(
				doc(
					p("AB",br(),"CD", br())
				),[
					bi(0, [[t("AB")]],  [[t("CD"), br()]]) // br is content
				]
			)
		)

		it("treats too many trailing br in higher level as content", () =>
			apply(
				doc(
					p("A"),
					p(br(), "i"),
					p(br(), "U", br(), br(), "u", br(), br(), br()),
					p("B")
				),[
					bi(0, [[t("A")]], []),
					bi(1, [[t("i")]], []),
					bi(2, [[t("U")]], [[t("u"), br()]]), // one br is content but the others are not
					bi(0, [[t("B")]], [])
				]
			)
		)

		it("treats a leading br on the highest level as content", () =>
			apply(
				doc(
					p("A"),
					p(br(), "i"),
					p(br(), "U"),
					p(br(), "eee"),
					p("V", br()),
					p("ii", br()),
					p("B")
				),[
					bi(0, [[t("A")]], []),
					bi(1, [[t("i")]], []),
					bi(2, [[t("U")]], []),
					bi(2, [[br(), t("eee")]], []),
					bi(2, [[t("V")]], []),
					bi(1, [[t("ii")]], []),
					bi(0, [[t("B")]], [])
				]
			)
		)

		it("treats too many leading br in the lowest level as content", () =>
			apply(
				doc(
					p(br(), br(), br(), br(), "AB",br(),"CD")
				),[
					bi(2, [[br(), br(), t("AB")]], [[t("CD")]]) // br are content
				]
			)
		)

	})

})
