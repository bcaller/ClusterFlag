ClusterFlag
===========

[ClusterFlag](https://bcaller.github.io/ClusterFlag/) clusters LatLng points to allow a map to display different numbers of markers at different zoom levels. Built with the fast retrieval of hundreds of thousands of Google Maps markers in mind.

Originally developed for a personal project [TheyHaveYour.Info](http://theyhaveyour.info) which required a clusterer for Google Maps capable of fast browsing and aggregation of 200,000+ map markers.

No production dependencies required.

Even if it takes a few seconds to actually cluster 200000 markers, once it's done you can zoom the map it doesn't need to recalculate (unlike MarkerClusterer in google-maps-utility-library-v3) - browsing the map with ClusterFlag is fast! This greedy clustering algorithm is heavily based on the wonderful [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) (MIT License).

##Using ClusterFlag
Include the javascript file which will set the global variable `ClusterFlag`.
*Including the script within an IIFE will make the variable non-global.*

Include your mapping library and then import the `LatLng` and `LatLngBounds` classes into ClusterFlag, e.g.

`ClusterFlag.setImports(google.maps.LatLng, google.maps.LatLngBounds);`

The LatLng class must have `lat()` and `lng()` methods and constructor `LatLng(lat, lng)`.
The LatLngBounds class must have constructor `LatLngBounds(NE, SW)` and methods `getSouthWest()`, `getNorthEast()`, `contains(latlng)`, `intersects(bounds)`, `extend(latlng)` and `union(bounds)`
If you aren't using Google Maps or a mapping library, you can use the `MapLatLng` and `MapBounds` classes included in the test folder.

###Creating Clusterer

To create the clusterer use `var cf = new ClusterFlag.Clusterer(maxZoom, clusterWidth)` where:

* **maxZoom** - Maximum zoom level to calculate clusters for. Level 0 shows the whole world on the map.
On each subsequent zoom level the number of pixels in the world quadruples. If max zoom is too large, too many levels will be created and adding markers will be very slow. However, the `get` method shouldn't suffer.
* **clusterWidth** - Smaller values causes more markers to be shown (more dense). A good starting value is 0.5.

###Clustering

Each marker added to the clusterer can have any properties, but must always have:

* **id** - a unique ID (any type)
* **latlng** - a LatLng object specifying the object's position

To add a marker `cf.add(marker)`
When everything has been added you can call `cf.finish()` to clean up temporary arrays which are only required if adding more items and to calculate aggregate properties such as child count and centre of mass.

###Getting markers

On map events such as zooming or dragging, call `cf.get(map.getBounds() : LatLngBounds, zoomLevel)` to return an array containing marker objects (the same as you added to the clusterer) and Cluster objects. **Actually displaying the results on the map is your problem** although a basic example app is included!

####Cluster objects

A cluster object has the following properties populated:

* **id** - A unique ID
* **centreOfMass** - Approximate LatLng of the centre of this cluster
* **markers** - Array of marker objects which are children of this cluster (not children of children)
* **childClusters** - Array of clusters which are hidden within the current cluster at this zoom level
* **count** - Total number of marker objects contained within this cluster and its children (available after finish has been called)
* **zoom** - Zoom level of this cluster
* **bounds** - LatLngBounds
* **isCluster** - true
* **parent** - Cluster object which is the direct parent of this cluster.
The top level cluster (`cf.top`) has zoom = -1 and parent = null

###Accumulating Aggregate Properties

Calculate aggregate properties of clusters using `accumulate(acc, marker, cluster, finish)` as seen in Cluster.js.
Used in `Cluster.recalculateBounds` to calculate and attach the `bounds`, `count` and `centreOfMass` properties of clusters.
Example to calculate the number of blue and green markers and to attach the result to each cluster object:

```javascript

    cf.accumulate(function() {
        return {
            blue: 0, green: 0
        }
    }, function(accum, marker) {
        //Our markers will of course need to have a color property
        if (marker.color === 'blue')
            accum.blue++
        else if(marker.color === 'green')
            accum.green++
    }, function(accum, childCluster) {
        accum.blue += childCluster.blueDescendants
        accum.green += childCluster.greenDescendants
    }, function(self, accum) {
        //Every cluster will now have the following properties
        self.blueDescendants = accum.blue
        self.greenDescendants = accum.green
        self.overallColor = accum.blue >= accum.green ? 'blue' : 'green';
    })
```

###License

Copyright 2014 Benjamin Caller

ClusterFlag is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ClusterFlag is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ClusterFlag.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).

For alternative licensing please contact me.
Also it'd be nice to know if you make use of this library in a project.
