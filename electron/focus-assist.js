const { exec } = require('child_process');

function setFocusAssist(mode) {
    // Mode: 0 = Off, 1 = Priority Only, 2 = Alarms Only
    const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings" /v NOC_GLOBAL_SETTING_DND /t REG_DWORD /d ${mode} /f`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error toggling Focus Assist: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Focus Assist stderr: ${stderr}`);
            return;
        }
        console.log(`Focus Assist set to ${mode}`);
    });
}

module.exports = { setFocusAssist };
