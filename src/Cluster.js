/**
 *  Copyright 2014 Benjamin Caller

 *  This file is part of ClusterFlag.

 ClusterFlag is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 ClusterFlag is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with ClusterFlag.  If not, see <http://www.gnu.org/licenses/>.
 */
var LatLngImports = {}, Modules_Cluster = (function (imports) {

    var Cluster = function (zoom, id) {
        this.markers = []
        this.childClusters = []
        this.count = 0
        this.zoom = zoom
        this.id = id
    }

    Cluster.prototype = (function () {

        return {
            ø: ø,
            isCluster: true,

            addChildCluster: function (cluster) {
                this.childClusters.push(cluster)
                cluster.parent = this
            },

            addMarker: function (marker) {
                this.markers.push(marker)
                marker.parent = this
            },

            removeMarker: function (marker) {
                marker.parent = null
                spliceOut(this.markers, marker)
            },

            get: function (bounds, maxZoom, clustersOnly, arr) {
                if (!arr) arr = []

                // inequality because of pruning
                if (this.zoom >= maxZoom) {
                    if (bounds.contains(this.centreOfMass))
                        arr.push(this)
                    return
                }

                if (!clustersOnly) {
                    [].push.apply(arr, _.filter(this.markers, function (marker) {
                        return bounds.contains(marker.latlng)
                    }))
                }

                _(this.childClusters).each(function (child) {
                    if (bounds.intersects(child.bounds))
                        child.get(bounds, maxZoom, clustersOnly, arr)
                })

                return arr
            },

            allMarkers: function (array) {
                var allPoints = array
                if (!array) {
                    allPoints = []
                }
                each(this.childClusters, function (child) {
                    child.allMarkers(allPoints)
                });
                [].push.apply(allPoints, this.markers)
                return allPoints
            },

            prune: function (maxZoom, removeFromGrids) {
                //nodes with no markers and only one child cluster can be skipped
                if (!(this.markers.length || this.childClusters.length > 1) && this.parent) {
                    spliceOut(this.parent.childClusters, this)
                    var onlyChild = this.childClusters[0]
                    this.parent.childClusters.push(onlyChild)
                    onlyChild.parent = this.parent
                    removeFromGrids && removeFromGrids(this)
                }
                if (this.zoom < maxZoom) {
                    this.childClusters.forEach(function (c) {
                        c.prune(maxZoom, removeFromGrids)
                    })
                }
            },

            /**
             * Recursively execute a function on a cluster and all children
             * @param acc - Function - returning an object used to count properties of children
             * @param marker - Function(accum, marker) - function executed on each marker. Mutate the accum object
             * @param cluster - Function(accum, cluster) - executed on each child cluster
             * @param finish - Function(self, accum) - Opportunity to mutate the current cluster (self) with the results from its children (accum)
             */
            accumulate: function (acc, marker, cluster, finish) {
                var obj = acc ? acc() : {}

                each(this.childClusters, function (c) {
                    c.accumulate(acc, marker, cluster, finish)
                    cluster(obj, c)
                })
                each(this.markers, _.partial(marker, obj))

                finish(this, obj)
            },

            recalculateBounds: function () {

                this.accumulate(function () {
                    return {
                        lat: 0, lng: 0, count: 0
                    }
                }, function (accum, marker) {
                    if (!accum.bounds)
                        accum.bounds = new imports.Bounds(marker.latlng, marker.latlng)
                    else
                        accum.bounds = accum.bounds.extend(marker.latlng)

                    accum.lat += marker.latlng.lat()
                    accum.lng += marker.latlng.lng()
                    accum.count++
                }, function (accum, childCluster) {
                    if (!accum.bounds)
                        accum.bounds = new imports.Bounds(childCluster.bounds.getSouthWest(), childCluster.bounds.getNorthEast())
                    else
                        accum.bounds = accum.bounds.union(childCluster.bounds)

                    accum.lat += childCluster.centreOfMass.lat() * childCluster.count
                    accum.lng += childCluster.centreOfMass.lng() * childCluster.count
                    accum.count += childCluster.count
                }, function (self, accum) {
                    self.bounds = accum.bounds
                    self.count = accum.count
                    self.centreOfMass = new imports.LatLng(accum.lat / accum.count, accum.lng / accum.count)
                })
            }

        }
    })()

    function spliceOut(array, obj) {
        array.splice(_.indexOf(array, obj), 1)
    }

    return Cluster
}(LatLngImports))