<?php
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

namespace local_loginas_participants;

use core\hook\output\before_footer_html_generation;

/**
 * Hook callbacks.
 *
 * @package    local_loginas_participants
 * @author     Pedro Luis Garcia Leiva
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hook_callbacks {
    /**
     * Loads the AMD module on the course participants page.
     *
     * Injects a "Log in as" row action into the course participants report,
     * next to the enrolment edit/unenrol icons, without modifying core files.
     *
     * @param before_footer_html_generation $hook
     */
    public static function before_footer_html_generation(before_footer_html_generation $hook): void {
        global $PAGE, $COURSE;

        if ($PAGE->pagetype !== 'course-view-participants') {
            return;
        }

        if (empty($COURSE->id) || $COURSE->id == SITEID) {
            return;
        }

        $coursecontext = \context_course::instance($COURSE->id);

        if (!has_capability('moodle/user:loginas', $coursecontext)) {
            return;
        }

        if (\core\session\manager::is_loggedinas()) {
            // Do not offer login-as while already impersonating someone else.
            return;
        }

        // Build the exact same URL core uses for the row-level login-as link
        // (see \course\loginas.php), with a placeholder for the userid that
        // the JS substitutes per row. The JS never constructs URLs itself.
        $urltemplate = new \moodle_url('/course/loginas.php', [
            'id' => $COURSE->id,
            'user' => '__USERID__',
            'sesskey' => sesskey(),
        ]);

        $PAGE->requires->js_call_amd('local_loginas_participants/rowaction', 'init', [
            $urltemplate->out(false),
            get_string('loginas', 'local_loginas_participants'),
        ]);
    }
}
