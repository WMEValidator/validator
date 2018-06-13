ABOUT
=====
Validates a map area in Waze Map Editor, highlights issues and generates
a very detailed report with wiki references and solutions.

WME Validator uses Open Source GPLv3 license, i.e. you may copy,
distribute and modify the software as long as you track changes/dates
in source files. Any modifications to or software including
(via compiler) GPL-licensed code must also be made available under
the GPL along with build & install instructions.

Please check the doc directory for more information.

For questions please use official forum:<br/>
https://www.waze.com/forum/viewtopic.php?f=819&t=76488

Report bugs on GitHub Issues Tracker:<br/>
https://github.com/WMEValidator/validator/issues


QUICK START
===========
WME Validator uses Closure Compiler:<br/>
https://developers.google.com/closure/compiler/

Download and unpack Closure Compiler's JAR into your `${HOME}/bin` directory.

Here are the quick start steps:

    $ git clone --recurse-submodules git@github.com:WMEValidator/validator
    $ cd validator
    $ ./10.release.sh

The result of compilation should be in `build/WME_Validator.user.js`
