define(
	['snap'],
	function(Snap) {
		return Snap.plugin(function(Snap, Element, Paper) {
			Paper.prototype.pictorialKey = function(xOrigin, yOrigin, width, series) {
				var paper = this;
				
				var key = paper.group().addClass('fm-pictorial-key');
				
				var backgroundRectangle = paper.rect(xOrigin, yOrigin, width, 30);
					
				var borderTop = paper.line(xOrigin, yOrigin, xOrigin + width, yOrigin);
					
				key.append(backgroundRectangle);
				key.append(borderTop);
				
				return key;
			}
		});
	}
);