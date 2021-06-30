
// TODO General hierarchical structure as a class ? (in that package the concept could be explained)
// TODO later move BiHrcl resp. newBiHrcl and subBiHrcl to other package

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

// ::- Hierarchical info of elements wit h two parts.
class BiHrcl {
  // :: (int, [[Nodes]], [[Nodes]], [BiHrcl], int, int)
  // Create a hierarchical info.
  constructor(depth, leading, trailing, sublist, nofNodes, trailingBreaks) {
    this.depth = depth
		this.leading = leading
		this.trailing = trailing
		this.sublist = sublist
		this.nofNodes = nofNodes
		this.trailingBreaks = trailingBreaks
  }

	// :: (BiHrcl) → bool
  // Test whether two hierarchical info objects are the same.
  eq(othr) {
		if (this.depth != othr.depth) return false
		if (!!this.sublist != !!othr.sublist) return false
		if (!!this.leading != !!othr.leading) return false
		if (!!this.trailing != !!othr.trailing) return false
		if (this.leading) {
			const res = compNodes(this.leading, othr.leading)
			if (!res) return false
		}
		if (this.trailing) {
			const res = compNodes(this.trailing, othr.trailing)
			if (!res) return false
		}
		if(this.sublist) {
			return biHrclEqual(this.sublist, othr.sublist)
		}
  }
}

export function newBiHrcl(depth, leading, trailing, nofNodes, trailingBreaks = 0) {
	return new BiHrcl(depth, leading, trailing, null, nofNodes, trailingBreaks)
}

export function subBiHrcl(depth, sublist, nofNodes, trailingBreaks = 0) {
	return new BiHrcl(depth, null, null, sublist, nofNodes, trailingBreaks)
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
			// console.log('p', p.toString());
			const nodes = [];
			p.forEach(n => nodes.push(n));
			const depth = lastRes?lastRes.depth-lastRes.trailingBreaks:0;
			let pres;
			if (depth < maxDepth -1) {
				pres = pToGeneral(lineBreakType, maxDepth, nodes, 0, depth);
			} else {
				pres = pToGeneralFlat(lineBreakType, nodes, 0, depth);
			}
			tgtPs.push(pres);
			lastRes = pres;
		});
		return tgtPs;
	}
	return psToGeneral
}

// Collect leading and trailing
function pToGeneral(lineBreakType, maxDepth, nodes, startIndex, depth) {
	const onlyOneLeadingResult = {leading:[], trailing:[]};
	const severalLeadingResult = {leading:[], trailing:[]};
	let nbs = [];
	let nofBreak = 0;
	let doubleBreakOnce = false;
	let i=startIndex;
	while (i<nodes.length) {
		const node = nodes[i];
		// console.log('n', node.toString());
		if (node.type !== lineBreakType) {
			nbs.push(node);
			nofBreak = 0;
		} else { // line break
			if (0 < nbs.length) {
				treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult);
				if (doubleBreakOnce == false && 0 < nofBreak) {
					doubleBreakOnce = true;
				}
			} else if (onlyOneLeadingResult.leading.length == 0) { // leading line break
				// do recurse
				let resTrailing;
				if (depth + 1 < maxDepth - 1) {
					resTrailing = pToGeneral(lineBreakType, maxDepth, nodes, i+1, depth+1);
				} else {
					resTrailing = pToGeneralFlat(lineBreakType, nodes, i+1, depth+1);
				}
				// console.log('resTrailing', resTrailing);
				if (resTrailing.sublist) {
					resTrailing.nofNodes++;
					return resTrailing;
				} else {
					return subBiHrcl(depth+1, resTrailing, resTrailing.nofNodes+1)
				}
			} // all other breaks are just counted
			nofBreak++;
			nbs = [];
		}
		i++;
	}

	// treat remaining nbs (trailing ones most of the time)
	treatNbs(nbs, doubleBreakOnce, onlyOneLeadingResult, severalLeadingResult);

	const src = doubleBreakOnce?severalLeadingResult:onlyOneLeadingResult;
	const leading = src.leading;
	const trailing = src.trailing;

	return newBiHrcl(depth, leading, trailing, (i - startIndex), nofBreak )
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
function pToGeneralFlat(lineBreakType, nodes, startIndex, depth) {
	const leading = [];
	const trailing = [];
	let hasDoubleBreak = false;
	let breakIndex = -1;
	let nofBreak = -1;
	let i=startIndex;
	while (i<nodes.length) {
		const node = nodes[i];
		// console.log('n', node.toString());
		if (-1 < nofBreak && node.type === lineBreakType) {
			nofBreak++;
			if (breakIndex == -1 && nofBreak == 1) {
				breakIndex = i;
			}
			if (nofBreak == 2) {
				hasDoubleBreak = true;
				break;
			}
		} else {
			nofBreak = 0;
		}
		i++;
	}
	let nbs = [];
	i = startIndex;
	while (i<nodes.length) {
		const node = nodes[i];
		// console.log('n', node.toString());
		if (i != breakIndex) {
			nbs.push(node);
		} else {
			// we do not count this (these) br, since they are just for splitting
			leading.push(nbs)
			if (hasDoubleBreak) i++; // ignore one more br
			nbs = [];
		}
		i++;
	}
	// treat remaining nbs as trailing ones
	trailing.push(nbs);

	return newBiHrcl(depth, leading, trailing, (i - startIndex))
}
