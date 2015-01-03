define(
	['snap'],
	function(Snap) {
		return Snap.plugin(function(Snap, Element, Paper) {
			Paper.prototype.pictorialKey = function(xOrigin, yOrigin, width, series) {
				var paper = this;
				
				return paper.rect(xOrigin, yOrigin, width, 30)
					.addClass('fm-pictorial-key');
			}
		});
	}
);