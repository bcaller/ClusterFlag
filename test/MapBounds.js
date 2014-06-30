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
var MapBounds = function (sw, ne) {
    this._sw = sw
    this._ne = ne
}

MapBounds.prototype = (function (LatLng) {
    return {
        getSouthWest: function () {
            return this._sw
        },
        getNorthEast: function () {
            return this._ne
        },
        contains: function (latlng) {
            var minlat = this._sw.lat()
            var maxlat = this._ne.lat()
            var minlng = this._sw.lng()
            var maxlng = this._ne.lng()
            return (latlng.lat() <= maxlat && latlng.lat() >= minlat) &&
                (latlng.lng() <= maxlng && latlng.lng() >= minlng)
        },
        intersects: function (bounds) {
            return this.contains(bounds.getSouthWest()) || this.contains(bounds.getNorthEast()) ||
                bounds.contains(this._sw) || bounds.contains(this._ne) ||
                bounds.contains(new LatLng(this._sw.lat(), this._ne.lng())) || bounds.contains(new LatLng(this._ne.lat(), this._sw.lng()))
        },
        extend: function (latlng) {
            var minlat = Math.min(this._sw.lat(), latlng.lat())
            var maxlat = Math.max(this._ne.lat(), latlng.lat())
            var minlng = Math.min(this._sw.lng(), latlng.lng())
            var maxlng = Math.max(this._ne.lng(), latlng.lng())
            return new MapBounds(
                new LatLng(minlat, minlng),
                new LatLng(maxlat, maxlng)
            )
        },
        union: function (bounds) {
            var minlat = Math.min(this._sw.lat(), bounds.getSouthWest().lat())
            var maxlat = Math.max(this._ne.lat(), bounds.getNorthEast().lat())
            var minlng = Math.min(this._sw.lng(), bounds.getSouthWest().lng())
            var maxlng = Math.max(this._ne.lng(), bounds.getNorthEast().lng())
            return new MapBounds(
                new LatLng(minlat, minlng),
                new LatLng(maxlat, maxlng)
            )
        }
    }
}(MapLatLng))