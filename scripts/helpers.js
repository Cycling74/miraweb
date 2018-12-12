const { spawn } = require("child_process");
const { join } = require("path");

const REPO_DIR = join(__dirname, "..");

module.exports.runAsync = (cmd, args = [], options = {}) => {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args, Object.assign({}, {
			cwd: REPO_DIR,
			stdio: "inherit"
		}, options));

		proc.on("error", reject);
		proc.on("close", code => {

			if (code === 0) return void resolve();
			return void reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
		});
	});
};

module.exports.REPO_DIR = REPO_DIR;

module.exports.executeMain = fct => {
	fct()
		.then(() => { })
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});
};
