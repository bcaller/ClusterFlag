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
var MapLatLng = function (lat, lng) {
    this._lat = lat
    this._lng = lng
}
MapLatLng.prototype = {
    lat: function () {
        return this._lat
    },
    lng: function () {
        return this._lng
    }
}