const child_process = require("child_process");
const format = require("util").format;
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Setup Debug Logging
const MW_LOG_PATH = path.join(__dirname, "..", "mw_debug.log");

if (fs.existsSync(MW_LOG_PATH)) fs.unlinkSync(MW_LOG_PATH);

const errorLogFD = fs.openSync(MW_LOG_PATH, "w+");
const errorLog = fs.createWriteStream(null, { autoClose : false, fd : errorLogFD });

// Spinning Class for better feedback
class CLISpinner {

	constructor(text = "", stream = process.stdout, interval = 60) {

		this._intervalId = null;
		this._interval = interval;
		this._currentIndex = 0;
		this._stream = stream;
		this._text = text;
	}

	start() {
		this._intervalId = setInterval(() => {

			const currentSpinnerChar = this.constructor.SPINNER_CHARS[this._currentIndex];
			const msg = this._text.indexOf("%sp") > -1 ? this._text.replace("%sp", currentSpinnerChar) : `${currentSpinnerChar} ${this._text}`;

			this._clearline();
			this._stream.write(msg);

			this._currentIndex = ++this._currentIndex % this.constructor.SPINNER_CHARS.length;
		}, this._interval);
	}

	_clearline() {
		readline.clearLine(this._stream, 0);
		readline.cursorTo(this._stream, 0);
	}

	stop(clear = true) {
		clearInterval(this._intervalId);
		this._intervalId = null;
		if (clear) this._clearline();
	}
}

CLISpinner.SPINNER_CHARS = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";


// Export helper util functions
const logToConsole = (message, newLine = true) => {
	process.stdout.write(`${message}${newLine ? "\n" : "" }`);
};

const closeLogs = () => {
	fs.closeSync(errorLogFD);
};

const exitProcess = (status = 1, error) => {
	if (error) errorLog.write(typeof error === "string" ? error : error.message);
	closeLogs();
	logToConsole("");
	if (status === 0) {
		logToConsole(`Success! Additional debug has been written to ${MW_LOG_PATH}`);
	} else {
		logToConsole(`Error! For more info/insight and the reason for this error please check ${MW_LOG_PATH}`);
	}

	process.exit(status);
};

const execCommand = (
	message = null,
	command,
	args = [],
	cwd = path.join(__dirname, ".."),
	out = "ignore"
) => {

	let spinner;
	if (message && message.length) spinner = new CLISpinner(message, process.stdout);

	return new Promise((resolve, reject) => {

		if (spinner) spinner.start();

		const cmd = child_process.spawn(command, args, {
			cwd : cwd,
			stdio : ["inherit", "ignore", errorLog],
			killSignal : "SIGTERM"
		});

		cmd.on("exit", (code) => {
			if (spinner) {
				spinner.stop();
				logToConsole(`✓ ${message}`, true);
			}
			if (code === 0) return resolve({ code });
			return reject({ code, message: `exited with code ${code}` });
		});

		cmd.on("error", (error) => {
			if (spinner) spinner.stop();
			return reject(error);
		});
	});
};


module.exports = {
	execCommand,
	exitProcess,
	closeLogs,
	logToConsole,
	CLISpinner
};
