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
// convert between latlng and world coordinate
// Adapted from https://developers.google.com/maps/documentation/javascript/examples/map-coordinates?csw=1 (Apache 2.0 License)
var modules_Projection = (function () {
    var RADS_PER_DEGREE = Math.PI / 180
    var pixelsPerLonDegree = 1 / 360
    var pixelsPerLonRadian = 1 / (2 * Math.PI)

    function bound(value, opt_min, opt_max) {
        value = Math.max(value, opt_min)
        value = Math.min(value, opt_max)
        return value
    }

    return function fromLatLngToPoint(latlng) {
        // Truncating to 0.9999 effectively limits latitude to 89.189. This is
        // about a third of a tile past the edge of the world tile.
        var siny = bound(Math.sin(latlng.lat() * RADS_PER_DEGREE), -0.9999, 0.9999)
        return {
            x: 0.5 + latlng.lng() * pixelsPerLonDegree,
            y: bound(0.5 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -pixelsPerLonRadian, 0, 1)
        }
    }

}())
