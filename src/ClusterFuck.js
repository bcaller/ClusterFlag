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

ClusterFlag.Clusterer = (function (imports, projection, Cluster, DistanceGrid) {

    ClusterFlag.setImports = function (latlng, bounds) {
        imports.LatLng = latlng
        imports.Bounds = bounds
    }

    var ClusterFuck = function (maxZoom, clusterWidth) {
        this.clusterGrids = []
        this.unclusteredGrids = []
        this.maxZoom = maxZoom
        _.times(this.maxZoom + 1, function (i) {
            var cellSize = clusterWidth / 4 / (1 << i)
            this.clusterGrids.push(new DistanceGrid(cellSize))
            this.unclusteredGrids.push(new DistanceGrid(cellSize))
        }.bind(this))
        this.clusterId = 0
        this.top = new Cluster(-1, this.nextClusterId()) //Top Level Cluster
    }

    ClusterFuck.prototype = {

        nextClusterId: function () {
            return 'c' + (this.clusterId++)
        },

        add: function (marker) {
            var pixelCoordinates = projection(marker.latlng)

            for (var zoom = this.maxZoom; zoom >= 0; zoom--) {
                //Try find a cluster close by
                var closestCluster = this.clusterGrids[zoom].getNearObject(pixelCoordinates)
                if (closestCluster) {
                    //console.log('putting', marker.id, 'into', closestCluster.id, 'zoom', zoom, marker.latlng)
                    return closestCluster.addMarker(marker);
                }
                //Try find a marker close by to form a new cluster with
                var closestMarker = this.unclusteredGrids[zoom].getNearObject(pixelCoordinates)
                if (closestMarker)
                    return this.newFriend(marker, closestMarker, zoom)

                //Didn't manage to cluster in at this zoom, record us as a marker here and continue upwards
                this.unclusteredGrids[zoom].add(marker, pixelCoordinates)
            }

            //Didn't get in anything at any zoom level, add us to the top
            this.top.addMarker(marker)
            //console.log('couldnt place', marker.id, 'at', marker.latlng)
        },

        newFriend: function (marker, closestMarker, zoom) {
            var oldParent = closestMarker.parent
            if (oldParent) {
                oldParent.removeMarker(closestMarker)
                //console.log('remove', closestMarker.id, 'from', oldParent.id)
            }

            //Create new cluster with these 2 in it
            var newCluster = new Cluster(zoom, this.nextClusterId())
            newCluster.addMarker(closestMarker)
            newCluster.addMarker(marker)

            //console.log('pairing', marker.id, 'with', closestMarker.id, 'to', newCluster.id, 'zoom', zoom, marker.latlng, closestMarker.latlng)

            var pixelCoordinates = projection(
                new imports.LatLng(
                        (closestMarker.latlng.lat() + marker.latlng.lat()) / 2,
                        (closestMarker.latlng.lng() + marker.latlng.lng()) / 2)
            )
            this.clusterGrids[zoom].add(newCluster, pixelCoordinates)


            //Remove closest from this zoom level and any above that it is in, replace with newCluster
            for (z = zoom; z >= 0; z--) {
                if (!this.unclusteredGrids[z].remove(closestMarker)) break
            }

            // Create any new intermediate parent clusters that don't exist
            // starting from the level above the new cluster
            // and bubbling up
            var lastParentCluster = newCluster
            for (var z = zoom - 1; z > oldParent.zoom; z--) {
                var parentCluster = new Cluster(z, this.nextClusterId())
                parentCluster.addChildCluster(lastParentCluster)
                //console.log('and',parentCluster.id, 'receives', lastParentCluster.id)
                this.clusterGrids[z].add(parentCluster, pixelCoordinates);
                lastParentCluster = parentCluster
            }
            oldParent.addChildCluster(lastParentCluster)
            //console.log('then',oldParent.id, 'receives', lastParentCluster.id)
        },

        get: function (bounds, zoom, clustersOnly) {
            return this.top.get(bounds, zoom, clustersOnly)
        },

        finish: function () {
            this.top.prune(11)
            /*
             prune: if keeping grids needs
             ø(function remove(cluster) {
             this.clusterGrids[cluster.zoom].remove(cluster)
             }, this)
             */
            this.unclusteredGrids = null
            this.clusterGrids = null
            delete this.unclusteredGrids //helps reclaim memory?
            delete this.clusterGrids
            this.top.recalculateBounds()
        },

        accumulate: function (acc, marker, cluster, finish) {
            return this.top.accumulate(acc, marker, cluster, finish)
        },

        mutualAncestor: function (a, b) {
            var c = a.parent
            var d = b.parent
            for (var zoom = Math.min(c.zoom, d.zoom); zoom >= 0; zoom--) {
                while (c.zoom > zoom) {
                    c = c.parent
                }
                while (d.zoom > zoom) {
                    d = d.parent
                }
                if (c === d) return c
            }
            return this.top
        }
    }


    return ClusterFuck
}(LatLngImports, modules_Projection, Modules_Cluster, Modules_DistanceGrid))
