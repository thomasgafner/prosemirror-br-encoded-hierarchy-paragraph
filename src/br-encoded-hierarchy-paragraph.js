
// TODO General hierarchical structure as a class ? (in that package the concept could be explained)
// TODO later move BiHrcl resp. biHrclEqual to other package
// TODO conceptual: trailingBreaks = any or only br that should be in the content but are not? (see tests)

const compNodes = function(as, bs) {
	if (as.length != bs.length) return false
	for (let i=0;i<as.length;i++) {
		const aNodes = as[i]
		const bNodes = bs[i]
		if (aNodes.length != bNodes.length) return false
		for (let j=0;j<aNodes.length;j++) {
			if (aNodes[j].eq(bNodes[j]) == false) return false
		}
	}
	return true
}

const compAttrsArray = function(as, bs) {
	if (!!as != !!bs) return false
	if (as && bs) {
		if (as.length != bs.length) return false
		for (let i=0;i<as.length;i++) {
			const aAttrs = as[i]
			const bAttrs = bs[i]
			// TODO may be we have to use a deep object compare function instead:
			const aKeys = Object.keys(aAttrs)
			const bKeys = Object.keys(bAttrs)
			if (aKeys.length != bKeys.length) return false
			for (let j=0;j<aKeys.length;j++) {
				const aKey = aKeys[j]
				if (aAttrs[aKey] != bAttrs[aKey]) return false
			}
		}
	}
	return true
}

// ::- Hierarchical info of elements with two parts.
export class BiHrcl {
  // :: (int, [[Node]], [[Node]], int, int)
  // Create a hierarchical info.
  constructor(depth, leading, trailing, nofNodes, trailingBreaks = 0) {
		// :: int
	  // Number of the level
    this.depth = depth
		this.leading = leading
		this.trailing = trailing
		this.setLeadingAttrs(Object.create(null))
		this.setTrailingAttrs(Object.create(null))
		// :: int
	  // Original number of nodes including the omitted ones for raising and lowering
		// level(s) and the one or two for separating leading and trailing part
		this.nofNodes = nofNodes
		// :: int
	  // Number of trailing breaks omitted for lowering level(s)
		this.trailingBreaks = trailingBreaks
  }

	// :: (Object)
	// Set the attributes of all leading groups to the given attributes.
	setLeadingAttrs(attrs) {
		if (this.leading) {
			this.leadingAttrs = this.leading.map(nGrp => attrs)
		}
	}

	// :: (Object)
	// Set the attributes of all trailing groups to the given attributes.
	setTrailingAttrs(attrs) {
		if (this.trailing) {
			this.trailingAttrs = this.trailing.map(nGrp => attrs)
		}
	}

	// :: (BiHrcl) → bool
  // Test whether two hierarchical info objects are the same.
  eq(othr) {
		if (this.depth != othr.depth) return false
		if (!!this.leading != !!othr.leading) return false
		if (!!this.trailing != !!othr.trailing) return false
		if (this.nofNodes != othr.nofNodes) return false
		if (this.trailingBreaks != othr.trailingBreaks) return false
		if (this.leading) {
			const res = compNodes(this.leading, othr.leading)
			if (!res) return false
		}
		if (this.trailing) {
			const res = compNodes(this.trailing, othr.trailing)
			if (!res) return false
		}
		// Each group of nodes actually could have got attrs from its origin parent node.
		// In the case of a p with brs the attrs of each group are the same - the one of the p.
		// In the case of an ul/ol-li (with brs) the same holds for the li.
		// But if the node groups originated from a dl, then the attrs could be
		// individual for each group, because they originate either from a dt or dd.
		if (!compAttrsArray(this.leadingAttrs, othr.leadingAttrs)) return false
		if (!compAttrsArray(this.trailingAttrs, othr.trailingAttrs)) return false
		return true
  }
}

export function biHrclEqual(a, b) {
	if (a.length != b.length) return false
	for (let i=0;i<a.length;i++) {
		const ah = a[i]
		const bh = b[i]
		if (ah.eq(bh) == false) return false
	}
	return true
}


// :: (Type, int) → (Fragment|Node) → General
// Convert a sequence of paragraphs to general structure.
export function psToGeneralGen(lineBreakType, maxDepth = 3) {
	const psToGeneral = function(ps) {
		let lastRes;
		const tgtPs = [];
		ps.forEach(function(p){
			// console.log('-----', p.toString());
			const nodes = [];
			p.forEach(n => nodes.push(n));
			const depth = lastRes?lastRes.depth-lastRes.trailingBreaks:0;
			const dnr = (depth < maxDepth -1) == false
			// let pres;
			// if (depth < maxDepth -1) {
			// 	pres = pToGeneral(lineBreakType, maxDepth, nodes, 0, depth);
			// } else {
			// 	pres = pToGeneralFlat(lineBreakType, nodes, 0, depth);
			// }
			const pres = pToGeneral(lineBreakType, maxDepth, nodes, 0, depth, dnr);
			// console.log('tb', pres.trailingBreaks)
			pres.setLeadingAttrs(p.attrs)
			pres.setTrailingAttrs(p.attrs)
			tgtPs.push(pres);
			lastRes = pres;
		});
		return tgtPs;
	}
	return psToGeneral
}

// Collect leading and trailing
function pToGeneral(lineBreakType, maxDepth, nodes, startIndex, depth, doNotRecur = false) {
	// console.log('p', depth)
	const onlyOneLeadingResult = {leading:[], trailing:[]};
	const severalLeadingResult = {leading:[], trailing:[]};
	let nbs = [];
	let lastNbs; // undefined
	let nofBreak = 0;
	let doubleBreakOnce = false;
	let isFirstDoubleBreak = false;
	let i=startIndex;
	let lastBrNode; // undefined
	while (i<nodes.length) {
		const node = nodes[i];
		// console.log('n', node.toString());
		if (node.type !== lineBreakType) {
			// prepend remainding brs
			// console.log('nofBreak', isFirstDoubleBreak?'f':' ', nofBreak)
			for (let i=isFirstDoubleBreak?2:1;i<nofBreak;i++) nbs.push(lastBrNode)
			nbs.push(node);
			nofBreak = 0;
		} else { // line break
			lastBrNode = node
			// console.log('lb:', doubleBreakOnce?'D':' ', 'b=', nofBreak, 'n=', nbs.length)
			if (0 < nbs.length || doNotRecur) {
				treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult);
			} else if (onlyOneLeadingResult.leading.length == 0) { // leading line break
				// do recurse
				let resTrailing;
				// console.log('rr', depth)
				const dnr = (depth + 1 < maxDepth - 1) == false
				resTrailing = pToGeneral(lineBreakType, maxDepth, nodes, i+1, depth+1, dnr);
				// console.log('resTrailing', resTrailing);
				resTrailing.nofNodes++
				return resTrailing
			} // all other breaks are just counted
			if (nofBreak == 1) {
				if (doubleBreakOnce == false) {
					doubleBreakOnce = true;
					isFirstDoubleBreak = true;
					// console.log('DBO')
				} else {
					isFirstDoubleBreak = false;
				}
			}
			nofBreak++;
			if (0 < nbs.length) {
				lastNbs = nbs;
			}
			nbs = [];
		}
		i++;
	}

	// console.log('nofBreak', nofBreak, 'on level', depth)
	while (depth < nofBreak) {
		lastNbs.push(lastBrNode)
		nofBreak--
	}

	// treat remaining nbs (trailing ones most of the time)
	treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult);

	// console.log('dbo', doubleBreakOnce)
	// console.log('ool', onlyOneLeadingResult)
	// console.log('svl', severalLeadingResult)

	const src = doubleBreakOnce?severalLeadingResult:onlyOneLeadingResult;
	const leading = src.leading;
	const trailing = src.trailing;

	return new BiHrcl(depth, leading, trailing, (i - startIndex), nofBreak)
}

function treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult) {
	if (0 < nbs.length) {
		if (onlyOneLeadingResult.leading.length == 0) {
			onlyOneLeadingResult.leading.push(nbs);
		} else {
			onlyOneLeadingResult.trailing.push(nbs);
		}
		if (doubleBreakOnce == false) {
			severalLeadingResult.leading.push(nbs);
		} else {
			severalLeadingResult.trailing.push(nbs);
		}
	}
}

// Collect leading and trailing ones
// function pToGeneralFlat(lineBreakType, nodes, startIndex, depth) {
// 	const leading = [];
// 	const trailing = [];
// 	let hasDoubleBreak = false;
// 	let breakIndex = -1;
// 	let nofBreak = -1;
// 	let i=startIndex;
// 	while (i<nodes.length) {
// 		const node = nodes[i];
// 		if (-1 < nofBreak && node.type === lineBreakType) {
// 			nofBreak++;
// 			if (breakIndex == -1 && nofBreak == 1) {
// 				breakIndex = i;
// 			}
// 			if (nofBreak == 2) {
// 				hasDoubleBreak = true;
// 				break;
// 			}
// 		} else {
// 			nofBreak = 0;
// 		}
// 		i++;
// 	}
// 	console.log('p flat', depth, hasDoubleBreak?'D':' ', 'b@=', breakIndex)
// 	let nbs = [];
// 	i = startIndex;
// 	while (i<nodes.length) {
// 		const node = nodes[i];
// 		console.log('n', node.toString());
// 		if (i != breakIndex) {
// 			if (node.type !== lineBreakType) {
// 				nbs.push(node);
// 			}
// 		} else {
// 			// we do not count this (these) br, since they are just for splitting
// 			leading.push(nbs)
// 			if (hasDoubleBreak) i++; // ignore one more br
// 			nbs = [];
// 		}
// 		i++;
// 	}
// 	// treat remaining nbs as trailing ones
// 	if (0 < nbs.length) {
// 		if (breakIndex < 0) {
// 			leading.push(nbs);
// 		} else {
// 			trailing.push(nbs);
// 		}
// 	}
//
// 	return new BiHrcl(depth, leading, trailing, (i - startIndex), nofBreak)
// }
