// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Injects a "Log in as" link next to the enrolment edit icon on the
 * course participants report, without modifying any core template.
 *
 * The login-as URL is built server-side (see classes/hook_callbacks.php)
 * using the same moodle_url('/course/loginas.php', ...) call core itself
 * uses; this module only substitutes the userid placeholder per row and
 * reuses core/notification's confirm dialog, it does not construct URLs
 * or a custom confirmation UI.
 *
 * @module     local_loginas_participants/rowaction
 * @author     Pedro Luis Garcia Leiva
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['core/str', 'core/notification'], function(Str, Notification) {

    /**
     * Extract the userid from the row's select checkbox (id="user123").
     *
     * @param {HTMLElement} row
     * @return {Number|null}
     */
    var getUserIdFromRow = function(row) {
        var checkbox = row.querySelector('.usercheckbox');
        if (!checkbox || !checkbox.id) {
            return null;
        }
        var match = checkbox.id.match(/^user(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    };

    return {
        /**
         * Initialise the module: decorate every enrolment-edit link
         * already rendered in the participants table.
         *
         * Moodle's js_call_amd() passes each PHP array value as its own
         * positional argument to init(), it does not wrap them into a
         * single options object.
         *
         * @param {String} urltemplate The server-built loginas.php URL,
         *                             with literal "__USERID__" standing
         *                             in for the user param.
         * @param {String} label
         */
        init: function(urltemplate, label) {
            var table = document.querySelector('table#participants');
            if (!table) {
                return;
            }

            table.querySelectorAll('a.editenrollink').forEach(function(editLink) {
                var row = editLink.closest('tr');
                if (!row || row.querySelector('.local-loginas-participants-link')) {
                    return;
                }

                var userid = getUserIdFromRow(row);
                if (!userid) {
                    return;
                }

                var url = urltemplate.replace('__USERID__', userid);

                var link = document.createElement('a');
                link.href = '#';
                link.className = 'local-loginas-participants-link';
                link.setAttribute('role', 'button');
                link.title = label;
                link.setAttribute('aria-label', label);
                link.innerHTML = '<i class="icon fa fa-chalkboard-teacher fa-fw" aria-hidden="true"></i>';
                link.addEventListener('click', function(e) {
                    e.preventDefault();

                    Promise.all([
                        Str.get_string('confirmloginas', 'local_loginas_participants'),
                        Str.get_string('confirm'),
                        Str.get_string('continue'),
                        Str.get_string('cancel')
                    ]).then(function(strings) {
                        Notification.confirm(
                            strings[1],
                            strings[0],
                            strings[2],
                            strings[3],
                            function() {
                                window.location.href = url;
                            }
                        );
                        return;
                    }).catch(Notification.exception);
                });

                editLink.insertAdjacentElement('afterend', link);
            });
        }
    };
});
