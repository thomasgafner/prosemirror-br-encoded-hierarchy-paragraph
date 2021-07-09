
import {BiHrcl} from '@thomas.gafner/prosemirror-br-encoded-hierarchy-base'

// :: (Type, int) → (Fragment|Node) → General
// Convert a sequence of paragraphs to general structure.
export function psToGeneralGen(lineBreakType, maxDepth = 3) {
	const psToGeneral = function(ps) {
		let lastRes
		const tgtPs = []
		ps.forEach(function(p){
			// console.log('-----', p.toString())
			const nodes = []
			p.forEach(n => nodes.push(n))
			const depth = lastRes?lastRes.biHrcl.depth-lastRes.trailingBreaks:0
			const dnr = (depth < maxDepth -1) == false
			// let pres
			// if (depth < maxDepth -1) {
			// 	pres = pToGeneral(lineBreakType, maxDepth, nodes, 0, depth)
			// } else {
			// 	pres = pToGeneralFlat(lineBreakType, nodes, 0, depth)
			// }
			const pres = pToGeneral(lineBreakType, maxDepth, nodes, 0, depth, dnr)
			const biHrcl = pres.biHrcl
			// console.log('tb', pres.trailingBreaks)
			biHrcl.setLeadingAttrs(p.attrs)
			biHrcl.setTrailingAttrs(p.attrs)
			tgtPs.push(biHrcl)
			lastRes = pres
		})
		return tgtPs
	}
	return psToGeneral
}

// Collect leading and trailing
function pToGeneral(lineBreakType, maxDepth, nodes, startIndex, depth, doNotRecur = false) {
	// console.log('p', depth)
	const onlyOneLeadingResult = {leading:[], trailing:[]}
	const severalLeadingResult = {leading:[], trailing:[]}
	let nbs = []
	let lastNbs // undefined
	let nofBreak = 0
	let doubleBreakOnce = false
	let isFirstDoubleBreak = false
	let i=startIndex
	let lastBrNode // undefined
	let nofLeadingContentBr = 0
	while (i<nodes.length) {
		const node = nodes[i]
		// console.log('n', node.toString())
		if (node.type !== lineBreakType) {
			if (0 < onlyOneLeadingResult.leading.length) {
				// prepend remainding brs
				// console.log('nofBreak', isFirstDoubleBreak?'f':' ', nofBreak)
				for (let i=isFirstDoubleBreak?2:1;i<nofBreak;i++) nbs.push(lastBrNode)
			}
			nbs.push(node)
			nofBreak = 0
		} else { // line break
			lastBrNode = node
			// console.log('lb:', doubleBreakOnce?'D':' ', 'b=', nofBreak, 'n=', nbs.length)
			// console.log('doNotRecur', doNotRecur)
			if (0 < nbs.length || doNotRecur) {
				if (onlyOneLeadingResult.leading.length == 0 && nbs.length == 0) {
					nofLeadingContentBr++
				}
				treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult)
			} else if (onlyOneLeadingResult.leading.length == 0) { // leading line break
				// do recurse
				// console.log('rr', depth)
				const dnr = (depth + 1 < maxDepth - 1) == false
				return pToGeneral(lineBreakType, maxDepth, nodes, i+1, depth+1, dnr)
			} // all other breaks are just counted
			if (nofBreak == 1 && 0 < onlyOneLeadingResult.leading.length) {
				if (doubleBreakOnce == false) {
					doubleBreakOnce = true
					isFirstDoubleBreak = true
					// console.log('DBO')
				} else {
					isFirstDoubleBreak = false
				}
			}
			nofBreak++
			if (0 < nbs.length) {
				lastNbs = nbs
			}
			nbs = []
		}
		i++
	}

	// console.log('nofBreak', nofBreak, 'on level', depth)
	while (depth < nofBreak) {
		lastNbs.push(lastBrNode)
		nofBreak--
	}

	// treat remaining nbs (trailing ones most of the time)
	treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult)

	// console.log('dbo', doubleBreakOnce)
	// console.log('ool', onlyOneLeadingResult)
	// console.log('svl', severalLeadingResult)

	const src = doubleBreakOnce?severalLeadingResult:onlyOneLeadingResult

	if (0 < src.leading.length) {
		// console.log('nofLeadingContentBr', nofLeadingContentBr)
		while (0 < nofLeadingContentBr--) src.leading[0].splice(0, 0, lastBrNode)
	}

	const leading = src.leading
	const trailing = src.trailing

	return {biHrcl: new BiHrcl(depth, leading, trailing), trailingBreaks: nofBreak}
}

function treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult) {
	if (0 < nbs.length) {
		if (onlyOneLeadingResult.leading.length == 0) {
			onlyOneLeadingResult.leading.push(nbs)
		} else {
			onlyOneLeadingResult.trailing.push(nbs)
		}
		if (doubleBreakOnce == false) {
			severalLeadingResult.leading.push(nbs)
		} else {
			severalLeadingResult.trailing.push(nbs)
		}
	}
}

// Collect leading and trailing ones
// function pToGeneralFlat(lineBreakType, nodes, startIndex, depth) {
// 	const leading = []
// 	const trailing = []
// 	let hasDoubleBreak = false
// 	let breakIndex = -1
// 	let nofBreak = -1
// 	let i=startIndex
// 	while (i<nodes.length) {
// 		const node = nodes[i]
// 		if (-1 < nofBreak && node.type === lineBreakType) {
// 			nofBreak++
// 			if (breakIndex == -1 && nofBreak == 1) {
// 				breakIndex = i
// 			}
// 			if (nofBreak == 2) {
// 				hasDoubleBreak = true
// 				break
// 			}
// 		} else {
// 			nofBreak = 0
// 		}
// 		i++
// 	}
// 	console.log('p flat', depth, hasDoubleBreak?'D':' ', 'b@=', breakIndex)
// 	let nbs = []
// 	i = startIndex
// 	while (i<nodes.length) {
// 		const node = nodes[i]
// 		console.log('n', node.toString())
// 		if (i != breakIndex) {
// 			if (node.type !== lineBreakType) {
// 				nbs.push(node)
// 			}
// 		} else {
// 			// we do not count this (these) br, since they are just for splitting
// 			leading.push(nbs)
// 			if (hasDoubleBreak) i++ // ignore one more br
// 			nbs = []
// 		}
// 		i++
// 	}
// 	// treat remaining nbs as trailing ones
// 	if (0 < nbs.length) {
// 		if (breakIndex < 0) {
// 			leading.push(nbs)
// 		} else {
// 			trailing.push(nbs)
// 		}
// 	}
//
// 	return new BiHrcl(depth, leading, trailing, (i - startIndex), nofBreak)
// }
