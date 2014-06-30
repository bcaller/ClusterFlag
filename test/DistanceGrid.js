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
describe('Distance Grid', function () {
    var grid

    describe('#getNearObject', function () {
        describe('Sparse', function () {
            beforeEach(function () {
                grid = new Modules_DistanceGrid(0.1)
                grid.add({ id: 'O' }, {
                    x: 0.01,
                    y: 0.01
                })
            })

            it('should not find a match for a distant marker', function () {
                _([
                    {x: 0.110, y: 0.01},
                    {x: 0.500, y: 0.200}
                ]).each(function (coord) {
                    (!grid.getNearObject(coord)).should.be.true
                })
            })

            it('should be able to find a nearby marker', function () {
                _([
                    {x: 0.005, y: 0.005},
                    {x: 0.109, y: 0.01}
                ]).each(function (coord) {
                    var nearObj = grid.getNearObject(coord);
                    nearObj.id.should.eql('O')
                })
            })
        })

        describe('Denser', function () {
            beforeEach(function () {
                grid = new Modules_DistanceGrid(0.1)
                grid.add({ id: 'A' }, { x: 0.010, y: 0.010 })
                grid.add({ id: 'B' }, { x: 0.011, y: 0.011 })
                grid.add({ id: 'C' }, { x: 0.012, y: 0.09 })
                grid.add({ id: 'D' }, { x: 0.012, y: 0.017 })
                grid.add({ id: 'E' }, { x: 0.090, y: 0.102 })
                grid.add({ id: 'F' }, { x: 0.111, y: 0.113 })
            })

            it('should not find a match for a distant marker', function () {
                (!grid.getNearObject({x: 0.020, y: 1})).should.be.true
            })

            it('should be able to find the nearest marker', function () {
                var nearObj = grid.getNearObject({x: 0.012, y: 0.012});
                nearObj.id.should.eql('B')
            })

            it('should be able to find the nearest marker across grid boundaries', function () {
                grid.getNearObject({x: 0.101, y: 0.102}).id.should.eql('E')
                grid.getNearObject({x: 0.099, y: 0.112}).id.should.eql('F')
            })
        })

        describe('Date Line', function () {
            beforeEach(function () {
                grid = new Modules_DistanceGrid(0.5)
                this.zoomedGrid = new Modules_DistanceGrid(0.5 / (1 << 5))

                this.positive = new MapLatLng(56, 179.5);
                this.negative = new MapLatLng(54, -179.5);

            })

            it('Should find near objects across ±180', function () {
                grid.add({id: "POSITIVE"}, modules_Projection(this.positive))
                this.zoomedGrid.add({id: "POSITIVE"}, modules_Projection(this.positive))

                grid.getNearObject(modules_Projection(this.negative)).id.should.eql('POSITIVE');
                (!this.zoomedGrid.getNearObject(modules_Projection(this.negative))).should.be.true
            })

            it('Should calculate distances across ±180', function () {
                grid.add({id: "NEGATIVE"}, modules_Projection(this.negative))
                grid.getNearObject(modules_Projection(this.positive)).id.should.eql('NEGATIVE');

                grid.add({id: "OTHER"}, modules_Projection(new MapLatLng(52, -179)))
                grid.getNearObject(modules_Projection(this.positive)).id.should.eql('NEGATIVE');

                grid.add({id: "POS1"}, modules_Projection(new MapLatLng(54, 178)))
                grid.getNearObject(modules_Projection(this.positive)).id.should.eql('NEGATIVE');

                grid.add({id: "POS2"}, modules_Projection(new MapLatLng(55, 178)))
                grid.getNearObject(modules_Projection(this.positive)).id.should.eql('POS2');
            })
        })
    })

})