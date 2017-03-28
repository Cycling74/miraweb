let storage = null;

try {
	storage = window.localStorage;
	const testKey = "__storage_test__";
	storage.setItem(testKey, testKey);
	storage.removeItem(testKey);
} catch (e) {
	storage = null;
}

export const isAvailable = !!storage;

export function read(key) {
	if (!storage) return new Error("Storage Unavailable");

	let data = storage.getItem(key);
	try {
		data = JSON.parse(data);
	} catch (e) {
		return e;
	}
	return data;
}

export function write(key, data) {
	if (!storage) return new Error("Storage Unavailable");

	try {
		storage.setItem(key, JSON.stringify(data));
	} catch (e) {
		return e;
	}
	return null;
}

export function clear() {
	if (!storage) return new Error("Storage Unavailable");

	storage.clear();
	return null;
}

export function remove(key) {
	if (!storage) return new Error("Storage Unavailable");

	storage.removeItem(key);
	return null;
}
