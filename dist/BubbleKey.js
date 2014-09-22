define(['config', 'key'],
  function(Config, Key) {

    function BubbleKey(paper, x, y, width, columnWidth, values, maxValues, maxValueLength, scaleSettings) {

      Key.call(this, paper, x, y, width, 1, columnWidth, false, values, maxValues, maxValueLength);

      this._scaleSettings = scaleSettings;

      this.state = {
        "fixed": null,
        "hover": null
      };

    }

    BubbleKey.prototype = Object.create(Key.prototype);

    /**
     * Hides the text labels on the bubble scale group
     */
    BubbleKey.prototype._hideScaleLabels = function() {
      this.node.selectAll(".fm-key-scale-maxbubble text, .fm-key-scale-midbubble text, .fm-key-scale-minbubble text").forEach(function _hideScaleLabels(text) {
        text.attr("display", "none");
      });
    };

    /**
     * Shoes the text labels on the bubble scale group
     */
    BubbleKey.prototype._showScaleLabels = function() {
      this.node.selectAll(".fm-key-scale-maxbubble text, .fm-key-scale-midbubble text, .fm-key-scale-minbubble text").forEach(function _hideScaleLabels(text) {
        text.attr("display", "block");
      });
    };

    /**
     * @constructor
     */
    BubbleKey.prototype.constructor = BubbleKey;

    /**
     * Renders the key and the bubble scale group
     */
    BubbleKey.prototype.render = function() {

      Key.prototype.render.apply(this);

      var paper = this._paper;
      var offsetY = 0;
      var maxCircleRadius = 0;
      var midCircleRadius = 0;
      var minCircleRadius = 0;
      var styleEmptyCircle = {
        "fill": "none",
        "stroke": "#8D8E8D",
        "stroke-dasharray": "4,4"
      };
      var styleEmptyText = {
        "fill": "#8D8E8D",
        "font-family": Config.FONT_FAMILY,
        "font-size": Config.TEXT_SIZE_SMALL,
        "text-anchor": "middle"
      };
      var circleTextMidY = parseInt(Config.TEXT_SIZE_SMALL, 10) / 2;
      var scaleSettings = this._scaleSettings;

      var bubbleScaleGroup = paper.g().attr("class", "fm-key-scale");

      // Render the title
      var bubbleScaleTitle = paper.text(0, 0, scaleSettings.title).attr({
        "font-family": Config.FONT_FAMILY,
        "font-size": Config.TEXT_SIZE_MEDIUM,
        "text-anchor": "middle"
      });

      var bubbleScaleGroupBubbles = paper.g().attr("class", "fm-key-scale-bubblegroup");
      bubbleScaleGroupBubbles.transform("t0," + bubbleScaleTitle.getBBox().height);

      // Render the bubble scales
      maxCircleRadius = getRadiusFromArea(scaleSettings.maxArea);
      midCircleRadius = getRadiusFromArea(scaleSettings.minArea + (scaleSettings.maxArea - scaleSettings.minArea) / 2);
      minCircleRadius = getRadiusFromArea(scaleSettings.minArea);


      // Maximum
      var maxBubble = paper.g().attr("class", "fm-key-scale-maxbubble");
      maxBubble.append(paper.text(0, offsetY + (maxCircleRadius - midCircleRadius) + circleTextMidY, scaleSettings.maxValue).attr(styleEmptyText));
      offsetY += maxCircleRadius;
      maxBubble.append(paper.circle(0, offsetY, maxCircleRadius).attr(styleEmptyCircle));


      // Middle
      var middleBubble = paper.g().attr("class", "fm-key-scale-midbubble");
      offsetY += (maxCircleRadius - midCircleRadius);
      middleBubble.append(paper.text(0, offsetY - midCircleRadius + (midCircleRadius - minCircleRadius) + circleTextMidY, scaleSettings.minValue + (scaleSettings.maxValue - scaleSettings.minValue) / 2).attr(styleEmptyText));
      middleBubble.append(paper.circle(0, offsetY, midCircleRadius).attr(styleEmptyCircle));


      // Minimum
      offsetY += (midCircleRadius - minCircleRadius);
      var minBubble = paper.g().attr("class", "fm-key-scale-minbubble");
      minBubble.append(paper.text(0, offsetY - minCircleRadius + circleTextMidY + minCircleRadius, scaleSettings.minValue).attr(styleEmptyText));
      minBubble.append(paper.circle(0, offsetY, minCircleRadius).attr(styleEmptyCircle));

      // Appendage
      bubbleScaleGroupBubbles.append(maxBubble);
      bubbleScaleGroupBubbles.append(middleBubble);
      bubbleScaleGroupBubbles.append(minBubble);

      bubbleScaleGroup.append(bubbleScaleTitle);
      bubbleScaleGroup.append(bubbleScaleGroupBubbles);

      var keyGroup = this.node.select(".fm-key");
      var keyGroupBBox = keyGroup.getBBox();
      var bubbleKeyBBox = bubbleScaleGroup.getBBox();
      var scaleOffsetY = 10;
      keyGroup.append(bubbleScaleGroup);

      bubbleScaleGroup.transform(
        "t" + (keyGroupBBox.x + keyGroupBBox.width - bubbleKeyBBox.width/2 - Config.KEY_SIDE_PADDING ) +
        "," + (keyGroupBBox.y + Config.TEXT_SIZE_MEDIUM + scaleOffsetY)
      );

    };

    /**
     * Sets the fixed bubble on the scale
     * @param {Snap.Element} bubble
     */
    BubbleKey.prototype.setScaleFixed = function(bubble) {

      if (bubble === null) {
        this.state.fixed.remove();
        this.state.fixed = null;
        this.setScaleHover(null);
        this._showScaleLabels();
        return;
      }

      if (this.state.hover !== null) {
        this.state.fixed = this.state.hover;
        this.state.hover = null;
        this.state.fixed.attr("class", "fm-key-scale-fixed");
        return;
      }

      this.setScaleHover(bubble);
      this.setScaleFixed(bubble);

    };

    /**
     * Sets the hover bubble on the scale
     * @param {Snap.Element} bubble
     */
    BubbleKey.prototype.setScaleHover = function(bubble) {

      if (bubble === null) {
        if (this.state.hover !== null) {
          this.state.hover.remove();
          this.state.hover = null;
          if (this.state.fixed === null) {
            this._showScaleLabels();
          }
        }
        return;
      }

      var paper = this._paper;
      var keyGroup = this.node.select(".fm-key-scale-bubblegroup");
      var circle = bubble.clone();
      var maxCircleRadius = getRadiusFromArea(this._scaleSettings.maxArea);
      var circleRadius;
      var circleYOffset = 0;
      var circleText;

      this._hideScaleLabels();

      this.state.hover = paper.g().attr("class", "fm-key-scale-hover").data("clone id", bubble.id);

      circleRadius = circle.attr("r");
      circleYOffset = maxCircleRadius - circleRadius;

      circle.attr({
        "cx": 0,
        "cy": maxCircleRadius + circleYOffset
      });
      circle.addClass("fm-scatter-bubble--active");
      this.state.hover.append(circle);

      if (this.state.fixed === null) {

        circleText = paper.text(0, maxCircleRadius + circleYOffset + parseInt(Config.TEXT_SIZE_MEDIUM, 10) / 2, bubble.data("area value")).attr({
          "fill": "#fff",
          "font-family": Config.FONT_FAMILY,
          "font-size": Config.TEXT_SIZE_MEDIUM,
          "text-anchor": "middle"
        });
        this.state.hover.append(circleText);

        keyGroup.append(this.state.hover);

      } else {

        circle.attr("fill-opacity", "0");
        this.state.hover.insertBefore(this.state.fixed);

      }

    };

    return BubbleKey;

    /**
     * Returns the radius from a given area
     * @param  {Number} area
     * @return {Number}
     */
    function getRadiusFromArea(area) {
      return Math.sqrt(area / Math.PI);
    }

  });