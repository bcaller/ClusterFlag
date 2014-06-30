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
describe('Clustering', function () {
    describe('#add', function () {
        beforeEach(function () {
            this.cf = new ClusterFlag.Clusterer(10, 0.9)
        })

        describe('one addition', function () {
            beforeEach(function () {
                this.one = {
                    latlng: new MapLatLng(-1, 1),
                    id: 'one'
                }
                this.cf.add(this.one)
            })

            it('should add to TLC', function () {
                this.cf.finish()
                this.cf.top.markers.length.should.eql(1)
                this.one.parent.should.eql(this.cf.top)
            })

            describe('second: cluster it', function () {
                beforeEach(function () {
                    this.two = {
                        latlng: new MapLatLng(-2, 2),
                        id: 'two'
                    }
                    this.cf.add(this.two)
                    this.firstCluster = this.two.parent
                })

                it('should cluster the two points at some level', function () {
                    this.one.parent.should.eql(this.firstCluster)
                    this.firstCluster.markers.length.should.eql(2)
                })

                it('should add clusters up to the TLC', function () {
                    this.cf.top.markers.length.should.eql(0)
                    this.firstCluster.parent.childClusters.length.should.eql(1)

                    this.cf.mutualAncestor(this.firstCluster, this.cf.top.childClusters[0].childClusters[0])
                        .should.eql(this.cf.top.childClusters[0])
                })

                describe('third: add to pre-existing cluster', function () {
                    beforeEach(function () {
                        this.three = {
                            latlng: new MapLatLng(1, 2),
                            id: 'three'
                        }
                        this.cf.add(this.three)
                    })

                    it('should add this cluster somewhere along the cluster chain', function () {
                        this.three.parent.should.not.eql(this.one.parent)
                        this.three.parent.markers.length.should.eql(1)
                        this.three.parent.childClusters.length.should.eql(1)
                    })

                    it('point 3 should be only clustered at a low zoom level', function () {
                        this.three.parent.zoom.should.be.below(this.firstCluster.zoom)
                        this.three.parent.zoom.should.be.above(1)
                    })

                    it('should not affect much else', function () {
                        this.cf.top.markers.length.should.eql(0)
                        this.firstCluster.markers.length.should.eql(2)
                        this.cf.mutualAncestor(this.two.parent, this.three.parent).zoom
                            .should.eql(this.three.parent.zoom - 1)
                    })

                    it('should count on #finish', function () {
                        this.cf.finish()
                        this.cf.top.count.should.eql(3)
                        this.three.parent.count.should.eql(3)
                        this.one.parent.count.should.eql(2)
                    })

                    it('should prune on #finish', function () {
                        var exGrandparentOfThree = this.three.parent.parent
                        this.cf.finish()
                        this.three.parent.parent.should.not.eql(exGrandparentOfThree)
                    })

                    describe('newfriend', function () {
                        beforeEach(function () {
                            this.exParentOfThree = this.three.parent
                            this.four = {
                                latlng: new MapLatLng(1.1, 2.2),
                                id: 'four'
                            }
                            this.cf.add(this.four)
                        })

                        it('should connect three and four at very high zoom', function () {
                            this.exParentOfThree.markers.should.be.empty;
                            this.exParentOfThree.childClusters.should.have.length(2)
                            this.three.parent.should.not.eql(this.exParentOfThree)
                            this.three.parent.zoom.should.be.above(this.firstCluster.zoom)
                        })
                    })

                    describe('#get', function () {
                        beforeEach(function () {
                            this.cf.finish()
                        })

                        describe('full MapLatLng range', function () {
                            beforeEach(function () {
                                this.zoomOut = this.cf.get(new MapBounds(new MapLatLng(-3, -3), new MapLatLng(3, 3)), 1)
                                this.zoomMedium = this.cf.get(new MapBounds(new MapLatLng(-3, -3), new MapLatLng(3, 3)), this.one.parent.zoom)
                                this.zoomIn = this.cf.get(new MapBounds(new MapLatLng(-3, -3), new MapLatLng(3, 3)), this.one.parent.zoom + 3)
                            })

                            it('single cluster (zoomed out)', function () {
                                this.zoomOut.should.be.an.instanceOf(Array)
                                this.zoomOut.should.have.length(1)
                                this.zoomOut[0].childClusters.should.have.length(1)
                            })

                            it('all markers (zoomed in far)', function () {
                                this.zoomIn.should.be.an.instanceOf(Array)
                                this.zoomIn.should.have.length(3)
                                this.zoomIn.should.containEql(this.one)
                                this.zoomIn.should.containEql(this.two)
                                this.zoomIn.should.containEql(this.three)
                            })

                            it('mixture', function () {
                                this.zoomMedium.should.be.an.instanceOf(Array)
                                this.zoomMedium.should.have.length(2)
                                this.zoomMedium.should.not.containEql(this.one)
                                this.zoomMedium.should.not.containEql(this.two)
                                this.zoomMedium.should.containEql(this.three)
                                this.zoomMedium.should.containEql(this.three)
                            })

                            it('pruned so get a high zoom level cluster even when zoomed out', function () {
                                /*
                                 TOP.....> zoomOut[0] -> 3
                                 |
                                 \/
                                 |
                                 \/
                                 1,2
                                 */
                                this.zoomOut[0].markers.should.have.length(1)
                                this.zoomOut[0].zoom.should.be.above(1)
                                this.cf.mutualAncestor(this.three, this.two).should.eql(this.zoomOut[0])
                            })
                        })

                        describe('bounds centred above one only', function () {
                            beforeEach(function () {
                                this.single = this.cf.get(new MapBounds(new MapLatLng(-1.1, 0.9), new MapLatLng(-0.9, 1.1)), this.one.parent.zoom + 1)
                                this.zoomOut = this.cf.get(new MapBounds(new MapLatLng(-1.1, 0.9), new MapLatLng(-0.9, 1.1)), this.one.parent.zoom - 3)
                            })

                            it('single marker when zoomed in', function () {
                                this.single.should.be.an.instanceOf(Array)
                                this.single.should.have.length(1)
                                this.single[0].should.eql(this.one)

                            })

                            it('nothing when zoomed out as bounds exclude CoM of cluster', function () {
                                this.zoomOut.should.be.an.instanceOf(Array)
                                this.zoomOut.should.be.empty
                            })
                        })
                    })

                })
            })
        })

    })
})