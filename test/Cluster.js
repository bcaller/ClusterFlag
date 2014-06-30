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
function markerWithLatlng(lat, lng) {
    return {
        latlng: new MapLatLng(lat, lng)
    }
}

describe('Cluster', function () {
    var cluster
    var markers = _([markerWithLatlng(0, 0), markerWithLatlng(2, 2), markerWithLatlng(2, -2)])

    beforeEach(function () {
        cluster = new Modules_Cluster(4)

        markers.each(function (m) {
            cluster.addMarker(m)
        })

        cluster.recalculateBounds()
    })

    it('should be able to add markers', function () {
        cluster.count.should.eql(markers.size())
    })

    it('should have a centre of mass', function () {
        cluster.centreOfMass.lat().should.eql(4 / 3)
        cluster.centreOfMass.lng().should.eql(0)
    })

    it('should have a bounds', function () {
        cluster.bounds.getNorthEast().lat().should.eql(2)
        cluster.bounds.getNorthEast().lng().should.eql(2)
        cluster.bounds.getSouthWest().lat().should.eql(0)
        cluster.bounds.getSouthWest().lng().should.eql(-2)
    })

    describe('with children', function () {
        var subMarkers = [markerWithLatlng(4, 5), markerWithLatlng(-6, 6)]
        var child
        beforeEach(function () {
            child = new Modules_Cluster(5)
            child.addMarker(subMarkers[0])
            cluster.addChildCluster(child)
            child.addMarker(subMarkers[1])
        })

        it('should have correct bounds', function () {
            cluster.recalculateBounds()
            cluster.bounds.getNorthEast().lat().should.eql(4)
            cluster.bounds.getNorthEast().lng().should.eql(6)
            cluster.bounds.getSouthWest().lat().should.eql(-6)
            cluster.bounds.getSouthWest().lng().should.eql(-2)

            child.centreOfMass.lat().should.eql(-1)
            child.centreOfMass.lng().should.eql(5.5)
        })

        it('#allMarkers', function () {
            var all = cluster.allMarkers()
            markers.each(function (m) {
                all.should.containEql(m)
            })
            _(subMarkers).each(function (m) {
                all.should.containEql(m)
            })
        })

        it('#removeMarker', function () {
            child.removeMarker(subMarkers[0])
            var all = cluster.allMarkers()
            markers.each(function (m) {
                all.should.containEql(m)
            })
            _(subMarkers).tail().each(function (m) {
                all.should.containEql(m)
            })
            all.should.not.containEql(subMarkers[0])

            subMarkers[0].should.have.property('parent', null)

            cluster.recalculateBounds()

            cluster.bounds.getNorthEast().lat().should.eql(2)
        })

        it('#accumulate executes function on each marker and sub-cluster', function () {
            var all = cluster.allMarkers()
            var subSubChild = new Modules_Cluster(7)
            child.addChildCluster(subSubChild)
            var run = 0
            cluster.accumulate(
                function () {
                    return {
                        markers: 0,
                        clusters: 0
                    }
                },
                function (accum, marker) {
                    accum.markers++
                    all.should.containEql(marker)
                },
                function (accum, cluster) {
                    accum.clusters++
                    cluster.hasBeenExecuted.should.eql(true)
                    console.log(105, cluster.zoom, run)
                    if (run === 1)
                        cluster.should.equal(subSubChild)
                    else if (run === 2)
                        cluster.should.equal(child)
                },
                function (self, accum) {
                    self.hasBeenExecuted = true
                    run.should.be.below(3, '3 levels of cluster')
                    if (run === 0) {
                        self.should.equal(subSubChild, 'Depth first')
                        accum.markers.should.eql(0)
                        accum.clusters.should.eql(0)
                    } else if (run === 1) {
                        //Execute on child cluster
                        self.should.equal(child)
                        accum.markers.should.eql(subMarkers.length)
                        accum.clusters.should.eql(1)
                    } else if (run === 2) {
                        //On parent
                        self.should.equal(cluster)
                        accum.markers.should.eql(markers.size())
                        accum.clusters.should.eql(1)
                    }
                    run++
                }
            )
        })
    })
})