"use strict";

// Settings
var width = 700, height = 700;
var margin_value = 20;
var components = ["PC1", "PC2"];
var config = {
    marker: {
        radius: 5,
        fill: "rgba(35, 150, 75, 0.75)",
    },
    labels: {
        fontfamily: "sans-serif",
        fontsize: "8px",
        fill: "#888888",
    },
}
var dataset;

// d3 margin convention
var margin = {top: margin_value, right: margin_value,
              bottom: margin_value, left: margin_value};
var width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scale.linear();
var yScale = d3.scale.linear();

var drawPCA = function(dataset, colors) {
    setScales(dataset);
    drawSamples(dataset, colors);
    // drawLabels(dataset);
};

var drawSamples = function(dataset, colors) {
    svg.selectAll("circle")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function(d) { return xScale(d.PC1); })
       .attr("cy", function(d) { return yScale(d.PC2); })
       .attr("r", config.marker.radius)
       .attr("fill", function(d, i) { return colors[d.population]; });
};

var drawLabels = function(dataset) {
    svg.selectAll("text")
       .data(dataset)
       .enter()
       .append("text")
       .text(function(d) { return d.population; })
       .attr("x", function(d) { return xScale(d.PC1); })
       .attr("y", function(d) { return yScale(d.PC2); })
       .attr("font-family", config.labels.fontfamily)
       .attr("font-size", config.labels.fontsize)
       .attr("fill", config.labels.fill);
};

var setScales = function(dataset) {
    var getMax = function(dataset, component) {
            return d3.max(dataset, function(d){ return d[component]; });
        },
        getMin = function(dataset, component) {
            return d3.min(dataset, function(d){ return d[component]; });
        };
    xScale.domain([getMin(dataset, components[0]),
                   getMax(dataset, components[0])])
          .range([0, width]).nice();
    yScale.domain([getMin(dataset, components[1]),
                   getMax(dataset, components[1])])
          .range([height, 0]).nice();
};

var googleColors = function(n) {
    var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colors[n % colors.length];
};

var generatePopulationColors = function(dataset) {
    var populations = dataset.map(function(d) { return d.population; });
    populations = Array.from(new Set(populations));
    var colors = {};
    for (var i = 0; i < populations.length; i++) {
        var population = populations[i];
        colors[population] = googleColors(i);
    };
    return colors;
};

var readCSVdrawPCA = function(filepath) {
    d3.csv(filepath, function(error, data) {
        if (error) { console.log(error); return; }

        dataset = data.map(function(d) {
            d.PC1 = parseFloat(d.PC1);
            d.PC2 = parseFloat(d.PC2);
            d.PC3 = parseFloat(d.PC3);
            return d;
        });
        var colors = generatePopulationColors(dataset);
        drawPCA(dataset, colors);
    })
};

readCSVdrawPCA("data/LEA.CPx1.eigenvecs.csv");
