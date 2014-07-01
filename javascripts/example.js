//Copyright 2014 Benjamin Caller
var overlays = [];
var clusterFuck = new ClusterFlag.Clusterer(13, 1.1);
var infowindow = new google.maps.InfoWindow({content: "NOTHING"})
var map

function populateClusterer(n) {

    ClusterFlag.setImports(google.maps.LatLng, google.maps.LatLngBounds)

    addRandomData(n)

    clusterFuck.finish()

    //red or blue
    clusterFuck.accumulate(function () {
        return {
            blue: 0, red: 0
        }
    }, function (accum, marker) {
        //Our markers will of course need to have a colour property
        if (marker.colour === 'blue')
            accum.blue++
        else if (marker.colour === 'red')
            accum.red++
    }, function (accum, childCluster) {
        accum.blue += childCluster.blueDescendants
        accum.red += childCluster.redDescendants
    }, function (self, accum) {
        //Every cluster will now have the following properties
        self.blueDescendants = accum.blue
        self.redDescendants = accum.red
        self.overallColour = accum.blue >= accum.red ? 'blue' : 'red';
    })

    addMarkers()

    var addMarkersDebounced = _.debounce(addMarkers, 350)
    google.maps.event.addListener(map, 'bounds_changed', addMarkersDebounced)
}

function renderMap() {
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(35.5376, -96.9247),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: true,
        tilt: 45
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function addMarkers() {
    clearOverlays()

    var zoom = map.getZoom()
    if (zoom > 14) {
        return map.setZoom(14)
    }
    var toShow = clusterFuck.get(map.getBounds(), zoom)

    var max = _.max(toShow, function(item) {
        return item.count || 1
    }).count

    _(toShow).each(function (item) {
        var marker;
        if (item.isCluster) {
            marker = new google.maps.Marker({
                position: item.centreOfMass,
                map: map,
                title: "Cluster " + item.id + " contains " + item.count + " markers total (" + item.blueDescendants + " blue and " + item.redDescendants + " red)",
                icon: getShape(item.overallColour, true, 1 + (item.count / max) * (item.count / max) )
            })
            google.maps.event.addListener(marker, 'click', function () {
                map.panTo(item.centreOfMass)
                map.setZoom(zoom + 1)
            })
        } else {
            marker = new google.maps.Marker({
                position: item.latlng,
                map: map,
                title: "Marker " + item.id,
                icon: getShape(item.colour, false, 1)
            })
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(marker.getTitle())
                infowindow.open(map, marker)
            })
        }
        overlays.push(marker)
    })
}

function clearOverlays() {
    while (overlays[0]) {
        var o = overlays.pop()
        google.maps.event.clearInstanceListeners(o)
        o.setMap(null)
    }
}

function getShape(colour, isCluster, size) {
    return {
        strokeColor: 'black',
        fillColor: colour === 'blue' ? '#0041C2' : '#ba0000',
        path: isCluster ? 'M-4 -17.2L-8.7 -3.6 -23.1 -3.3 -11.6 5.4 -15.8 19.2 -4 11 7.9 19.2 3.7 5.4 15.2 -3.3 0.8 -3.6z' : google.maps.SymbolPath.CIRCLE,
        strokeWeight: 2,
        scale: (isCluster ? 0.6 : 4) * size,
        strokeOpacity: 0.9,
        fillOpacity: 0.6
    }
}



var somelatlngs = [
    [32.7990, -86.8073],
    [40.5773, -77.2640],
    [33.8191, -80.9066],
    [47.3917, -121.5708],
    [31.1060, -97.6475],
    [40, -85],
    [14.8058, 145.5505],
    [39.3498, -75.5148],
    [52.202544, 0.131237],
    [42.7475, -107.2085],
    [41.1289, -98.2883],
    [48.858093, 2.294694],
    [    54.6575    , -6.215833    ],
    [    54.398889    , -7.651667    ],
    [    54.618056    , -5.8725    ],
    [    55.042778    , -7.161111    ],
    [    52.453856    , -1.748028    ],
    [    52.369722    , -1.479722    ],
    [    51.894167    , -2.167222    ],
    [    53.353744    , -2.27495    ],
    [    50.440558    , -4.995408    ],
    [    51.505144    , -1.993428    ],
    [    51.009358    , -2.638819    ],
    [    51.396667    , -3.343333    ],
    [    51.605333    , -4.067833    ],
    [    51.382669    , -2.719089    ],
    [    53.333611    , -2.849722    ],
    [    51.874722    , -0.368333    ],
    [    50.422778    , -4.105833    ],
    [    50.78    , -1.8425    ],
    [    50.950261    , -1.356803    ],
    [    51.187167    , -1.0335    ],
    [    50.835556    , -0.297222    ],
    [    51.330833    , 0.0325    ],
    [    51.148056    , -0.190278    ],
    [    51.505278    , 0.055278    ],
    [    51.275833    , -0.776333    ],
    [    51.323889    , -0.8475    ],
    [    51.4775    , -0.461389    ],
    [    51.571389    , 0.695556    ],
    [    50.956111    , 0.939167    ],
    [    51.342222    , 1.346111    ],
    [    54.9375    , -2.809167    ],
    [    53.771667    , -3.028611    ],
    [    53.574444    , -0.350833    ],
    [    54.131167    , -3.263667    ],
    [    53.865897    , -1.660569    ],
    [    53.178056    , -2.977778    ],
    [    55.0375    , -1.691667    ],
    [    54.509189    , -1.429406    ],
    [    52.831111    , -1.328056    ],
    [    58.957778    , -2.905    ],
    [    50.45    , 30.5233    ]

];

function addRandomData(num) {
    function avgRandom(n) {
        var r = 0;
        for (var i = 0; i < n; i++) {
            r += Math.random()
            r -= 0.5
        }
        return r / Math.sqrt(n)
    }

    //add random data by random walk
    var j = 0
    _(somelatlngs).each(function (centre) {
        var pos = [centre[0] + avgRandom(12), centre[1] + avgRandom(12)]
        for (var i = 0; i < (3 + Math.random()) * num; i++) {
            //Add some random marker points
            clusterFuck.add({
                id: ++j,
                latlng: new google.maps.LatLng(pos[0], pos[1]),
                colour: Math.random() > 0.501 ? 'red' : 'blue'
            })
            pos[0] += avgRandom(6) / 30
            pos[1] += avgRandom(6) / 30
        }
    })

    clusterFuck.add({
        id: ++j,
        latlng: new google.maps.LatLng(23.054, -82.299),
        colour: 'red'
    })

    document.getElementById('ok').innerText = "Markers added:  " + j
}

var clicked = false

document.getElementById('click').onclick = function() {
    if(clicked) return false
    clicked = true
    populateClusterer(1234);
    window.setTimeout(function() {
        document.getElementById('ok').remove()
    }, 3000)
    return false
}

document.getElementById('clickless').onclick = function() {
    if(clicked) return false
    clicked = true
    populateClusterer(123);
    window.setTimeout(function() {
        document.getElementById('ok').remove()
    }, 3000)
    return false
}

renderMap();