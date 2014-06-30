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

// Bind function cb in a context (fast version)
// Use this.ø(f)
// On a GB keyboard type ALT+0248 (for real)
function ø(cb, context) {
    var self = context || this
    return function () {
        return cb.apply(self, arguments)
    }
}

// _.each is about 30% slower which is annoying
// This is only for dense arrays not objects
// Does pass the index
function each(arr, f) {
    var i = 0,
        len = arr.length
    for (i; i < len; i++) {
        f(arr[i], i)
    }
}