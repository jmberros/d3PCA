"use strict";

// Settings
var width = 700, height = 700;
var margin_value = 20;
var components = ["PC1", "PC2"];
var reference_population = "PEL";
var config = {
    marker: {
        radius: 4,
        fill: "rgba(35, 150, 75, 0.75)",
    },
    labels: {
        fontfamily: "sans-serif",
        fontsize: "8px",
        fill: "#888888",
    },
    transition: {
        duration: 1000,
    }
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

function drawPCA(dataset, colors) {
    var scales = setScales(dataset);
    // var axes = drawAxes(dataset, scales);
    updateSamples(dataset, scales, colors);
    // updateLabels(dataset, scales, colors);
};

function drawAxes(dataset, scales) {
    var xAxis = d3.svg.axis() .scale(scales["x"]);
};

function bindSamples(dataset) {
    svg.selectAll("circle")
       .data(dataset).enter()
       .append("circle");
};

function bindLabels(dataset) {
    svg.selectAll("text")
       .data(dataset).enter()
       .append("text")
};

function updateSamples(dataset, scales, colors) {
    svg.selectAll("circle")
       .data(dataset)
       .transition()
       .duration(config.transition.duration)
       .attr("cx", function(d) { return scales["x"](d.PC1); })
       .attr("cy", function(d) { return scales["y"](d.PC2); })
       .attr("r", config.marker.radius)
       .attr("fill", function(d, i) { return colors[d.population]; });
};

function updateLabels(dataset, scales, colors) {
    svg.selectAll("text")
       .data(dataset)
       .transition()
       .duration(config.transition.duration)
       .text(function(d) { return d.population; })
       .attr("x", function(d) { return scales["x"](d.PC1); })
       .attr("y", function(d) { return scales["y"](d.PC2); })
       .attr("font-family", config.labels.fontfamily)
       .attr("font-size", config.labels.fontsize)
       .attr("fill", function(d, i) { return colors[d.population]; });
};

function setScales(dataset) {
    var getMax = function(dataset, component) {
            return d3.max(dataset, function(d){ return d[component]; });
        },
        getMin = function(dataset, component) {
            return d3.min(dataset, function(d){ return d[component]; });
        };

    var xScale = d3.scale.linear();
    xScale.domain([getMin(dataset, components[0]),
                   getMax(dataset, components[0])]);

    var yScale = d3.scale.linear();
    yScale.domain([getMin(dataset, components[1]),
                   getMax(dataset, components[1])]);
    
    var reference_samples = dataset.filter(function(d) {
        return d.population == reference_population;
    })
    var xDomainMean = mean(xScale.domain()),
        yDomainMean = mean(yScale.domain()),
        xSamplesMedian = median(reference_samples.map(function(d) {
            return d[components[0]];
        })),
        ySamplesMedian = median(reference_samples.map(function (d) {
            return d[components[1]];
        }));

    var population_on_the_left = xSamplesMedian < xDomainMean,
        population_on_the_top  = ySamplesMedian > yDomainMean;

    var range = { x: [0, width], y: [0, height] }
    if (!population_on_the_left) {
        range["x"] = [width, 0];
    };
    if (!population_on_the_top) {
        range["y"] = [height, 0];
    };

    xScale.range(range["x"]).nice()
    yScale.range(range["y"]).nice();

    return {x: xScale, y: yScale}
};

function googleColors(n) {
    var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colors[n % colors.length];
};

function generatePopulationColors(dataset) {
    var populations = dataset.map(function(d) { return d.population; });
    populations = Array.from(new Set(populations));
    var colors = {};
    for (var i = 0; i < populations.length; i++) {
        var population = populations[i];
        colors[population] = googleColors(i);
    };
    return colors;
};

function readCSVdrawPCA(filepath) {
    d3.csv(filepath, function(error, data) {
        if (error) { console.log(error); return; }

        dataset = data.map(function(d) {
            d.PC1 = parseFloat(d.PC1);
            d.PC2 = parseFloat(d.PC2);
            d.PC3 = parseFloat(d.PC3);
            return d;
        });
        var colors = generatePopulationColors(dataset);
        if (d3.selectAll("circle").size() == 0) {
            bindSamples(dataset);
            bindLabels(dataset);
        };
        drawPCA(dataset, colors);
    })
};

function showOptions() {
    var dataset_labels = [
        "LEA.GAL_Completo",
        "LEA.GAL_Affy",
        "LEA.100_SNPs_from_GAL_Affy",
        "LEA.50_SNPs_from_GAL_Affy",
        "LEA.25_SNPs_from_GAL_Affy",
        "LEA.20_SNPs_from_GAL_Affy",
        "LEA.15_SNPs_from_GAL_Affy",
    ];
    var select = d3.selectAll("button")
        .data(dataset_labels).enter()
        .append("button")
        .on("click", setDataset)
        .attr("dataset-label", function(d) { return d; })
        .text(function (d) { return d; });

    function setDataset() {
        var dataset_label = this.getAttribute("dataset-label");
        readCSVdrawPCA("data/" + dataset_label + ".eigenvecs.csv");
    };
};

showOptions();
// readCSVdrawPCA("data/LEA.CPx100.eigenvecs.csv");
