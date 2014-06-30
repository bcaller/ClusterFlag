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
var Modules_DistanceGrid = (function () {

    var DistanceGrid = function (clusterWidth) {
        this.cellSize = clusterWidth
        this.cellArea = clusterWidth * clusterWidth
        this.grid = {}
        this.objectPixelCoordinates = {}
        this.maxGridX = this.pixelToGrid(1) + 1
    }

    DistanceGrid.prototype = {
        add: function (obj, pixelCoordinates) {
            var x = this.pixelToGrid(pixelCoordinates.x),
                y = this.pixelToGrid(pixelCoordinates.y),
                row = this.grid[y] = this.grid[y] || {},
                cell = row[x] = row[x] || []
            cell.push(obj)
            this.objectPixelCoordinates[obj.id] = pixelCoordinates
        },

        remove: function (obj) {
            var pixelCoordinates = this.getObjectCoordinates(obj)
            if (!pixelCoordinates) return false
            var row = this.grid[this.pixelToGrid(pixelCoordinates.y)]
            if (!row) return false
            var rowIndex = this.pixelToGrid(pixelCoordinates.x),
                cell = row[rowIndex]
            if (!cell) return false

            delete this.objectPixelCoordinates[obj.id]

            cell.splice(_.indexOf(cell, obj), 1)
            if (!cell.length) delete row[rowIndex]

            return true
        },

        pixelToGrid: function (pixelCoordinate) {
            return Math.floor(pixelCoordinate / this.cellSize)
        },

        squareDistance: function (p, p2) {
            //Remember the circular latitude boundary
            var dx = Math.abs(p2.x - p.x)
            dx = dx > 0.5 ? 1 - dx : dx

            var dy = p2.y - p.y
            return dx * dx + dy * dy
        },

//        objById: function (id) {
//
//            var pixelCoordinates = this.objectPixelCoordinates[id],
//                x = this.pixelToGrid(pixelCoordinates.x),
//                y = this.pixelToGrid(pixelCoordinates.y)
//            return this.grid[y][x]
//        },


        getObjectCoordinates: function (obj) {
            return this.objectPixelCoordinates[obj.id]
        },

        getNearObject: function (pixelCoordinates) {
            var x = this.pixelToGrid(pixelCoordinates.x),
                y = this.pixelToGrid(pixelCoordinates.y),
                closestDistSq = this.cellArea,
                i, j, k, row, cell, len, obj, dist,
                closest = null

            for (i = y - 1; i <= y + 1; i++) {
                row = this.grid[i]
                if (row) {

                    for (j = x - 1; j <= x + 1; j++) {
                        cell = row[(j + this.maxGridX) % this.maxGridX]
                        if (cell) {
                            for (k = 0, len = cell.length; k < len; k++) {
                                obj = cell[k]
                                dist = this.squareDistance(this.getObjectCoordinates(obj), pixelCoordinates)
                                if (dist < closestDistSq) {
                                    closestDistSq = dist
                                    closest = obj
                                }
                            }
                        }
                    }
                }
            }
            return closest
        }
    }

    return DistanceGrid
}())