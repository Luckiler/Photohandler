function closestTo(comparants, compared) {
	var curr = comparants[1];
	for (let c in comparants) {
		if (Math.abs(comparants[c] - compared) < Math.abs(curr - compared)) {
			curr = comparants[c];
		}
	}
	return curr;
}
