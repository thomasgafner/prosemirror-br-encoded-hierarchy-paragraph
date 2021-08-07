
// import {BiHrcl} from '@thomas.gafner/prosemirror-br-encoded-hierarchy-base'

function attrsAllOrNull(biHrcl) {
	let first = null
	if (0 < biHrcl.leadingAttrs.length) {
		first = biHrcl.leadingAttrs[0]
	} else if (0 < biHrcl.trailingAttrs.length) {
		first = biHrcl.trailingAttrs[0]
	}
	if (!first) return first // all are null or mixed - so return null
	for (let i=0;i<biHrcl.leadingAttrs.length;i++) {
		if (biHrcl.leadingAttrs[i] != first) {
			return null
		}
	}
	for (let i=0;i<biHrcl.trailingAttrs.length;i++) {
		if (biHrcl.trailingAttrs[i] != first) {
			return null
		}
	}
	return first
}

// :: (Type, Type, int) → ([BiHrcl] → [Node])
// Creates a function, that converts an array of general hierarchical elements to an array of paragraphs.
export function generalToPsGen(lineBreakType, paragraphType, maxDepth = 3) {
	const generalToPs = function(gs) {
		// Return an array of paragraph.
		const lb = lineBreakType.create()
		let d = 0
		const res = []
		for (let j=0;j<gs.length;j++) {
			const g = gs[j]

			// g of BiHrcl
			const content = []

			// Add brs that are increasing hierarchy markers
			let depth = g.depth<maxDepth?g.depth:maxDepth
			for (let i=d;i<depth;i++) {
				content.push(lb)
			}

			// Only if all g.leadingAttrs and all g.trailingAttrs are === apply them
			// also to the paragraph.
			let attrs = attrsAllOrNull(g)
			g.leading.forEach(function(ns, i) {
				if (0<i) {
					content.push(lb)
				}
				content.push.apply(content, ns)
			})
			if (0 < g.trailing.length) {
				content.push(lb) // br between leading and trailing
				if (1 < g.leading.length) {
					content.push(lb) // make it a double br
				}
			}
			g.trailing.forEach(function(ns, i) {
				if (0<i) {
					content.push(lb)
				}
				content.push.apply(content, ns)
			})

			// Add brs that are decreasing hierarchy markers
			let nextDepth = depth // maxDepth already checked
			if (j < gs.length-1) {
				nextDepth = gs[j+1].depth
				if (nextDepth < 0) nextDepth = 0
				if (maxDepth < nextDepth) nextDepth = maxDepth
			}
			for (let i=depth;nextDepth<i;i--) {
				content.push(lb)
			}
			d = depth

			// create the paragraph
			const para = paragraphType.create(attrs, content) // no marks
			res.push(para)
		}
		return res
	}
	return generalToPs
}
