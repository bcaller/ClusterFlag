//Copyright 2014 Benjamin Caller
var overlays = [];
var cf = new ClusterFlag.Clusterer(13, 1.7);
var infowindow = new google.maps.InfoWindow({content: "NOTHING"})
var map

function populateClusterer() {
    ClusterFlag.setImports(google.maps.LatLng, google.maps.LatLngBounds)

    function centralLimitTheorem(n) {
        var r = 0;
        for (var i = 0; i < n; i++) {
            r += Math.random()
            r -= 0.5
        }
        return r / Math.sqrt(n)
    }

    //add random data
    var j = 0
    _(somelatlngs).each(function (centre) {
        var num = 1000 * (1 + Math.random())
        for (var i = 0; i < num; i++) {
            //Add some random marker points
            cf.add({
                id: ++j,
                latlng: new google.maps.LatLng(centre[0] + centralLimitTheorem(12), centre[1] + centralLimitTheorem(12)),
                color: Math.random() > 0.51 ? 'red' : 'blue'
            })
        }
    })

    alert("Markers added:  " + j)

    cf.finish()

    cf.accumulate(function () {
        return {
            blue: 0, red: 0
        }
    }, function (accum, marker) {
        //Our markers will of course need to have a color property
        if (marker.color === 'blue')
            accum.blue++
        else if (marker.color === 'red')
            accum.red++
    }, function (accum, childCluster) {
        accum.blue += childCluster.blueDescendants
        accum.red += childCluster.redDescendants
    }, function (self, accum) {
        //Every cluster will now have the following properties
        self.blueDescendants = accum.blue
        self.redDescendants = accum.red
        self.overallColor = accum.blue >= accum.red ? 'blue' : 'red';
    })

    addMarkers()

    var addMarkersDebounced = _.debounce(addMarkers, 400)
    google.maps.event.addListener(map, 'zoom_changed', addMarkersDebounced)
    google.maps.event.addListener(map, 'drag', addMarkersDebounced)
}

function renderMap() {
    var mapOptions = {
        zoom: 5,
        center: new google.maps.LatLng(35.5376, -96.9247),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        panControl: false,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        mapTypeControl: true,
        tilt: 45
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    google.maps.event.addListenerOnce(map, 'idle', function () {
        window.setTimeout(populateClusterer, 1000)
    })
}

function addMarkers() {
    clearOverlays()

    var zoom = map.getZoom()
    if (zoom > 14) {
        return map.setZoom(14)
    }
    var toShow = cf.get(map.getBounds(), zoom)

    _(toShow).each(function (item) {
        var marker;
        if (item.isCluster) {
            marker = new google.maps.Marker({
                position: item.centreOfMass,
                map: map,
                title: "Cluster " + item.id + " contains " + item.count + " markers total (" + item.blueDescendants + " blue and " + item.redDescendants + " red)",
                icon: item.overallColor == 'blue' ? blueSquare : redSquare
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
                icon: item.color === 'blue' ? blueCircle : redCircle
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

var somelatlngs = [
    [32.7990, -86.8073],
    [14.2417, -170.7197],
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
    [    59.878889    , -1.295556    ],
    [    58.458889    , -3.093056    ],
    [    57.201944    , -2.197778    ],
    [    57.5425    , -4.0475    ],
    [    55.871944    , -4.433056    ],
    [    55.95    , -3.3725    ],
    [    55.681944    , -6.256667    ],
    [    55.509444    , -4.586667    ],
    [    57.481111    , -7.362778    ],
    [    60.432778    , -1.296111    ],
    [    56.452499    , -3.025833    ],
    [    58.215556    , -6.331111    ],
    [    56.499167    , -6.869167    ],
    [    56.372889    , -2.868444    ],
    [    57.705214    , -3.339169    ],
    [    52.205    , 0.175    ],
    [    52.675833    , 1.282778    ],
    [    51.885    , 0.235    ],
    [    50.734444    , -3.413889    ],
    [    51.519444    , -2.590833    ],
    [    51.836944    , -1.32    ],
    [    52.361933    , 0.486406    ],
    [    51.682167    , -1.790028    ],
    [    51.749964    , -1.583617    ],
    [    51.234139    , -0.942825    ],
    [    51.553    , -0.418167    ],
    [    53.093014    , -0.166014    ],
    [    52.342611    , 0.772939    ],
    [    53.166167    , -0.523811    ],
    [    52.648353    , 0.550692    ],
    [    51.083333    , 1.016667    ],
    [    57.0228    , -7.44306    ],
    [    53.248097    , -4.535339    ],
    [    50.1281    , -5.51845    ],
    [    50.1028    , -5.67056    ],
    [    59.3503    , -2.95    ],
    [    60.1922    , -1.24361    ],
    [    59.2503    , -2.57667    ],
    [    59.1553    , -2.64139    ],
    [    59.3517    , -2.90028    ],
    [    59.3675    , -2.43444    ],
    [    59.5358    , -1.62806    ],
    [    59.1906    , -2.77222    ],
    [    55.4372    , -5.68639    ],
    [    53.474722    , -1.004444    ],
    [    52.92    , -1.079167    ],
    [    60.7472    , -0.85385    ],
    [    56.464    , -5.4    ],
    [    56.0575    , -6.243056    ],
    [    49.945556    , -6.331389    ],
    [    50.677778    , -1.109444    ],
    [    56.439722    , -3.371389    ],
    [    52.09083    , 0.13194    ],
    [    51.351944    , 0.502778    ],
    [    51.213612    , -0.13861    ]
];

var blueCircle = {
    strokeColor: '#2B60DE',
    fillColor: '#0041C2',
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4,
    strokeWeight: 2,
    strokeOpacity: 0.9,
    fillOpacity: 0.5
}

var redCircle = {
    strokeColor: 'black',
    fillColor: '#ba0000',
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4,
    strokeWeight: 2,
    strokeOpacity: 0.9,
    fillOpacity: 0.5
}

var blueSquare = {
    strokeColor: '#2B60DE',
    fillColor: '#0041C2',
    path: 'm-2,2 h2v-2h-2z',
    scale: 8,
    strokeWeight: 2,
    strokeOpacity: 0.9,
    fillOpacity: 0.5
}

var redSquare = {
    strokeColor: 'black',
    fillColor: '#ba0000',
    path: 'm-2,2 h2v-2h-2z',
    scale: 8,
    strokeWeight: 2,
    strokeOpacity: 0.9,
    fillOpacity: 0.5
}

renderMap();