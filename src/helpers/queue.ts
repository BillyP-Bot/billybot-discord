export class Queue<T = any> {
	private items: T[];
	constructor() {
		this.clear();
	}
	public clear() {
		this.items = [];
	}
	public enqueue(item: T) {
		this.items.push(item);
	}
	public dequeue() {
		this.items.shift();
	}
	public front() {
		return this.items[0];
	}
	public length() {
		return this.items.length;
	}
	public list() {
		return this.items;
	}
}
