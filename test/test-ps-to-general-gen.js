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

	console.log('res', actualResult)

	ist(actualResult, expectedResult, biHrclEqual)
}

function t(str, marks) {
	return doc().type.schema.text(str, marks)
}

describe("psToGeneralGen", () => {

	it("does something we want it TODO", () =>
		apply(
			doc(p("ABCD"),p("EF",br(),"GH"),p("IJKL"),p("MN",br(),"OP"),p("QRST")),
			[
				newBiHrcl(0, [[t("ABCD")]], [], 1),
				newBiHrcl(0, [[t("EF")]], [[t("GH")]], 3),
				newBiHrcl(0, [[t("IJKL")]], [], 1),
				newBiHrcl(0, [[t("MN")]], [[t("OP")]], 3),
				newBiHrcl(0, [[t("QRST")]], [], 1)
			]
		)
	)

})
