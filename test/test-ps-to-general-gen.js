const {EditorState} = require("prosemirror-state")
const {Slice, Fragment} = require("prosemirror-model")
const ist = require("ist")
const {doc, p, br} = require("./builder")
const {psToGeneralGen,
	biHrclEqual, BiHrcl} = require("..") // TODO later from other package

function newBiHrcl(depth, leading, trailing, nofNodes, trailingBreaks) {
	return new BiHrcl(depth, leading, trailing, nofNodes, trailingBreaks)
}

// :: (Node, [BiHrcl])
function apply(doc, expectedResult) {

	const ntps = doc.type.schema.nodes
	const maxDepth = 3

	const psToGeneral = psToGeneralGen(ntps.hard_break, maxDepth)
	const actualResult = psToGeneral(doc)

	// console.log('res', actualResult)
	// if (0 < actualResult.length) {
	// 	if (0 < actualResult[0].leading?.length) {
	// 		console.log('res [0].leading', actualResult[0].leading)
	// 	}
	// 	if (0 < actualResult[0].trailing?.length) {
	// 		console.log('res [0].trailing', actualResult[0].trailing)
	// 	}
	// 	if (0 < actualResult[0].leadingAttrs?.length) {
	// 		console.log('res [0].leadingAttrs', actualResult[0].leadingAttrs)
	// 	}
	// 	if (0 < actualResult[0].trailingAttrs?.length) {
	// 		console.log('res [0].trailingAttrs', actualResult[0].trailingAttrs)
	// 	}
	// }

	// console.log('exp', expectedResult)
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

	ist(actualResult, expectedResult, biHrclEqual)
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
					newBiHrcl(0, [[t("ABCD")]],  [], 1)
				]
			)
		)

		it("splits one leading and one trailing node group if a paragraph has one br separating two nodes", () =>
			apply(
				doc(
					p("AB",br(),"CD")
				),[
					newBiHrcl(0, [[t("AB")]],  [[t("CD")]], 3)
				]
			)
		)

		it("takes the first br as separator and splits one leading and three trailing nodes if a paragraph has two distinct br separating three nodes", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),"EF")
				),[
					newBiHrcl(0, [[t("AB")]],  [[t("CD")], [t("EF")]], 5)
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),"EF")
				),[
					newBiHrcl(0, [[t("AB")], [t("CD")]],  [[t("EF")]], 6)
				]
			)
		)

		it("takes the first multiple br occurrance as separator to split leading and trailing node groups and prepend any additional br", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),br(),br(),"EF")
				),[
					newBiHrcl(0, [[t("AB")], [t("CD")]],  [[br(),br(),t("EF")]], 8)
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups also if many on both sides", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),"EF",br(),br(),"GH",br(),"IJ",br(),"KL",br(),"MN")
				),[
					newBiHrcl(0, [[t("AB")], [t("CD")], [t("EF")]],  [[t("GH")], [t("IJ")], [t("KL")], [t("MN")]], 14)
				]
			)
		)

		it("takes the first double br occurrance as separator to split leading and trailing node groups treats any additional br of other multiple occurrances as content", () =>
			apply(
				doc(
					p("AB",br(),"CD",br(),br(),"EF",br(),"GH",br(),br(),"IJ")
				),[
					newBiHrcl(0, [[t("AB")], [t("CD")]],  [[t("EF")],[t("GH")],[br(),t("IJ")]], 11)
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
					iAttrs(newBiHrcl(0, [[t("AB")]],  [[t("CD")]], 3), attrs0)
				]
			)
		)

	})

	describe("in the hierarchical cases", () => {

		// Tests where brs are at the beginning and at the end to control hierarchy.
		// Given a leading br the function raises the following groups.
		// Given a trailing br causes the function to lower the level by one.

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
					newBiHrcl(0, [[t("A")]], [], 1),
					newBiHrcl(0, [[t("B")]], [], 1),
					// subBiHrcl(1, newBiHrcl(1, [[t("i")]], [], 1), 2),
					newBiHrcl(1, [[t("i")]], [], 2),
					newBiHrcl(1, [[t("ii")]], [], 1),
					newBiHrcl(1, [[t("iii")]], [], 2, 1), // TODO no trailingBreaks here?
					newBiHrcl(0, [[t("C")]], [], 1)
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
					newBiHrcl(0, [[t("A")]], [], 1),
					newBiHrcl(0, [[t("B")]], [], 1),
					// subBiHrcl(1, newBiHrcl(1, [[t("i")]], [], 1), 2),
					newBiHrcl(1, [[t("i")]], [], 2),
					newBiHrcl(1, [[t("ii")]], [], 2, 1), // TODO no trailingBreaks here?
					newBiHrcl(0, [[t("C")]], [], 1)
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
					newBiHrcl(0, [[t("A")]], [], 1),
					newBiHrcl(0, [[t("B")]], [], 1),
					newBiHrcl(1, [[t("i")]], [], 3, 1),
					newBiHrcl(0, [[t("C")]], [], 1)
				]
			)
		)

		// it.only("can handle more than two levels", () =>
		// 	apply(
		// 		doc(
		// 			p("A"),
		// 			p("B"),
		// 			p(br(), "i"),
		// 			p(br(), "U"),
		// 			p("V", br()),
		// 			p("ii"),
		// 			p("iii", br()),
		// 			p("C")
		// 		),[
		// 			newBiHrcl(0, [[t("A")]], [], 1),
		// 			newBiHrcl(0, [[t("B")]], [], 1),
		// 			subBiHrcl(1, newBiHrcl(1, [[t("i")]], [], 1), 2),
		// 			subBiHrcl(2, newBiHrcl(2, [[t("U")]], [], 1), 2),
		// 			newBiHrcl(2, [[t("V")]], [], 2, 1), // TODO no trailingBreaks here?
		// 			// Problem is the impl creates this instead:
		// 			// BiHrcl {
		// 		  //   depth: 2,
		// 		  //   leading: [ [Array] ],
		// 		  //   trailing: [ [] ],                                  ?
		// 		  //   leadingAttrs: [ [Object: null prototype] {} ],
		// 		  //   trailingAttrs: [ [Object: null prototype] {} ],    ?
		// 		  //   sublist: null,
		// 		  //   nofNodes: 2,
		// 		  //   trailingBreaks: 0                                  ?
		// 		  // },
		// 			// and all the remaining then are also wrong (or at the wrong level at least)
		// 			newBiHrcl(1, [[t("ii")]], [], 1),
		// 			newBiHrcl(1, [[t("iii")]], [], 2, 1), // TODO no trailingBreaks here?
		// 			newBiHrcl(0, [[t("C")]], [], 1)
		// 		]
		// 	)
		// )

		// TODO


		// TODO
		// it("splits one leading and one trailing nodes group if one paragraph is present", () =>
		// 	apply(
		// 		doc(
		// 			p("ABCD"),
		// 			p("EF",br(),"GH"),
		// 			p("IJKL"),
		// 			p("MN",br(),"OP"),
		// 			p("QRST")
		// 		),[
		// 			newBiHrcl(0, [[t("ABCD")]], [], 1),
		// 			newBiHrcl(0, [[t("EF")]], [[t("GH")]], 3),
		// 			newBiHrcl(0, [[t("IJKL")]], [], 1),
		// 			newBiHrcl(0, [[t("MN")]], [[t("OP")]], 3),
		// 			newBiHrcl(0, [[t("QRST")]], [], 1)
		// 		]
		// 	)
		// )


	})

	describe("in pathological hierarchical cases", () => {

		// TODO test br at the beginning but level is 0 - what happens?
		// it.only("a leading br in the first level shows no effect", () =>
		// 	apply(
		// 		doc(
		// 			p(br(),"AB",br(),"CD")
		// 		),[
		// 			newBiHrcl(0, [[br(), t("AB")]],  [[t("CD")]], 4)
		// 		]
		// 	)
		// )

		// TODO test br at the end of the last one - what happens?
		// TODO test / concept really many br at the beginning or the end - what happens?

	})

})
