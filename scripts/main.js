queue()
    .defer(d3.csv, "data/2018Jan.csv")
    .defer(d3.json, "data/hertfordshire.json")
    .await(makeGraphs);

function makeGraphs(error, crimeData, mapJson) {
    var ndx = crossfilter(crimeData);

    crimeType(ndx);
    crimeOutcome(ndx);
    totalCrime(ndx);
    crimeMap(ndx, mapJson);    

    dc.renderAll();
}

//Create map of hertfordshire
function crimeMap(ndx, mapJson) {
    var width = document.getElementById("one").clientWidth;
    var mapRegion = dc.geoChoroplethChart("#crimeMap");    
    var regions = ndx.dimension(dc.pluck('LSOA name', function(d) {
        return d.split(" 0")[0];
    }));
    var crimeSum = regions.group();

    var centre = d3.geo.centroid(mapJson);
    var projection = d3.geo.mercator().center(centre).scale(32000).translate([330, 280]);
    var colorBrewer = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'];
    var max = crimeSum.top(1)[0].value;

    mapRegion
        .width(width)
        .height(500)
        .dimension(regions)
        .projection(projection)
        .group(crimeSum)
        .colors(d3.scale.quantize().range(colorBrewer))
        .colorDomain([0, max])
        .colorCalculator(function (d) { return d ? mapRegion.colors()(d) : '#ccc'; })
        .overlayGeoJson(mapJson.features, "region", function(d) {
            return d.properties.lad17nm;
        });
}

// Total crime in number format
function totalCrime(ndx) {
    var totalGroup = ndx.groupAll();

    dc.numberDisplay('#totalCrime')
        .group(totalGroup)
        .formatNumber(d3.format(".0f"))
        .valueAccessor( function(d) { return d; } )
        .html({
            one:'%number Crime',
            some:'%number Crimes',
            none:'No Records'});
};

// Type of crime in pie chart format
function crimeType(ndx) {
    var width = document.getElementById("two").clientWidth;
    var typeDim = ndx.dimension(dc.pluck('Crime type'));
    var typeGroup = typeDim.group();

    dc.pieChart('#crimeType')
        .width(width)
        .height(500)
        .radius(150)
        .innerRadius(45)
        .externalRadiusPadding(50)
        .transitionDuration(1500)
        .cx([150])      
        .colors(d3.scale.category20())
        .dimension(typeDim)
        .group(typeGroup)
        .renderLabel(false)
        .legend(dc.legend().x(320).y(125).itemHeight(15).gap(5));
};

// Outcome of crime in pie chart format
function crimeOutcome(ndx) {
    var width = document.getElementById("three").clientWidth;
    var outcomeDim = ndx.dimension(dc.pluck('Last outcome category'));
    var outcomeGroup = outcomeDim.group();

    dc.pieChart('#crimeOutcome')
        .width(width)
        .height(500)
        .radius(150)
        .innerRadius(45)
        .externalRadiusPadding(50)
        .transitionDuration(1500)
        .cx([150]) 
        .colors(d3.scale.category10())
        .dimension(outcomeDim)
        .group(outcomeGroup)
        .renderLabel(false)
        .legend(dc.legend().x(300).y(15).itemHeight(15).gap(5));
};