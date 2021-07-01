const {EditorState} = require("prosemirror-state")
const {Slice, Fragment} = require("prosemirror-model")
const ist = require("ist")
const {doc, p, br} = require("./builder")
const {psToGeneralGen,
	biHrclEqual, newBiHrcl, subBiHrcl} = require("..") // TODO later from other package

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
	// }

	ist(actualResult, expectedResult, biHrclEqual)
}

function t(str, marks) {
	return doc().type.schema.text(str, marks)
}

describe("psToGeneralGen", () => {

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

	// it.only("takes the first double br occurrance as separator to split leading and trailing node groups treats any additional br of other multiple occurrances as content", () =>
	// 	apply(
	// 		doc(
	// 			p("AB",br(),"CD",br(),br(),"EF",br(),"GH",br(),br(),"IJ")
	// 		),[
	// 			newBiHrcl(0, [[t("AB")], [t("CD")]],  [[t("EF")],[t("GH")],[br(),t("IJ")]], 11)
	// 		]
	// 	)
	// )



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
